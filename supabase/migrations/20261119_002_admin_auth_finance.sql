-- UNA JOYA - Login do painel (e-mail/senha via Supabase Auth) + vendas, gastos e dashboards
-- Já aplicada no projeto Supabase (hkczlyvzicoklbebhnfo). Mantida aqui para versionamento.

-- 1) Quem é administrador ativo ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles ap
    WHERE ap.id = (SELECT auth.uid()) AND ap.is_active
  );
$$;
REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;

-- A pessoa logada pode ler apenas o PRÓPRIO perfil (o painel usa para saber se é admin)
GRANT SELECT ON TABLE public.admin_profiles TO authenticated;
DROP POLICY IF EXISTS admin_profiles_select_own ON public.admin_profiles;
CREATE POLICY admin_profiles_select_own ON public.admin_profiles
  FOR SELECT TO authenticated USING (id = (SELECT auth.uid()));

-- 2) Escrita do painel nas tabelas da vitrine (somente admin ativo) ------------------------
GRANT INSERT, UPDATE, DELETE ON TABLE public.categories, public.hero_slides, public.lookbook_photos TO authenticated;
GRANT UPDATE ON TABLE public.about_us TO authenticated;

-- Produtos: estoque físico, reserva e versão NÃO são editáveis direto (regra do trigger de estoque)
GRANT INSERT (name, description, price, stock, promo, duration, image, images, category_id) ON TABLE public.products TO authenticated;
GRANT UPDATE (name, description, price, promo, duration, image, images, category_id) ON TABLE public.products TO authenticated;
GRANT DELETE ON TABLE public.products TO authenticated;
GRANT USAGE ON SEQUENCE public.products_id_seq TO authenticated;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['categories','hero_slides','lookbook_photos','about_us','products'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_write', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_active_admin()) WITH CHECK (public.is_active_admin())',
      t || '_admin_write', t);
  END LOOP;
END $$;

-- Estoque: o painel chama esta função (confere admin e usa o controle de versão existente)
CREATE OR REPLACE FUNCTION public.admin_set_product_stock(p_product_id integer, p_new_stock integer)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE v_version bigint;
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'NOT_ADMIN';
  END IF;
  SELECT version INTO v_version FROM public.products WHERE id = p_product_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'PRODUCT_NOT_FOUND';
  END IF;
  RETURN public.admin_update_product_stock(p_product_id, p_new_stock, v_version);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_product_stock(integer, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_product_stock(integer, integer) TO authenticated;

-- Pedidos do WhatsApp: o admin também pode apagar contatos de teste/spam
GRANT DELETE ON TABLE public.whatsapp_orders TO authenticated;
DROP POLICY IF EXISTS whatsapp_orders_admin_delete ON public.whatsapp_orders;
CREATE POLICY whatsapp_orders_admin_delete ON public.whatsapp_orders
  FOR DELETE TO authenticated USING (public.is_active_admin());

-- 3) Categorias de gastos (configuráveis no painel) ---------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.expense_categories (name, sort_order) VALUES
  ('Matéria-prima (pedras e metais)', 10),
  ('Embalagens', 20),
  ('Frete e envio', 30),
  ('Marketing e anúncios', 40),
  ('Taxas (maquininha e plataformas)', 50),
  ('Ferramentas e equipamentos', 60),
  ('Contas fixas (aluguel, internet)', 70),
  ('Outros', 99)
ON CONFLICT (name) DO NOTHING;

-- 4) Gastos -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  spent_on date NOT NULL,
  category text NOT NULL CHECK (char_length(btrim(category)) BETWEEN 1 AND 60),
  description text CHECK (description IS NULL OR char_length(description) <= 200),
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  payment_method text CHECK (payment_method IS NULL OR payment_method IN ('pix','cartao_credito','cartao_debito','dinheiro','transferencia','boleto','outro')),
  supplier text CHECK (supplier IS NULL OR char_length(supplier) <= 80),
  note text CHECK (note IS NULL OR char_length(note) <= 500),
  import_batch uuid,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS expenses_spent_on_idx ON public.expenses (spent_on DESC);
CREATE INDEX IF NOT EXISTS expenses_import_batch_idx ON public.expenses (import_batch) WHERE import_batch IS NOT NULL;

-- 5) Vendas (uma linha por item; itens da mesma venda compartilham sale_group) ----------------
CREATE TABLE IF NOT EXISTS public.sales (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sale_group uuid NOT NULL DEFAULT gen_random_uuid(),
  sold_on date NOT NULL,
  channel text NOT NULL CHECK (channel IN ('whatsapp_site','fora_da_loja')),
  channel_detail text CHECK (channel_detail IS NULL OR char_length(channel_detail) <= 60),
  product_id integer REFERENCES public.products(id) ON DELETE SET NULL,
  item_name text NOT NULL CHECK (char_length(btrim(item_name)) BETWEEN 1 AND 120),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 1000),
  unit_price_cents bigint NOT NULL CHECK (unit_price_cents >= 0),
  discount_cents bigint NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  payment_method text CHECK (payment_method IS NULL OR payment_method IN ('pix','cartao_credito','cartao_debito','dinheiro','transferencia','boleto','outro')),
  customer_name text CHECK (customer_name IS NULL OR char_length(customer_name) <= 80),
  customer_contact text CHECK (customer_contact IS NULL OR char_length(customer_contact) <= 60),
  whatsapp_order_id bigint REFERENCES public.whatsapp_orders(id) ON DELETE SET NULL,
  note text CHECK (note IS NULL OR char_length(note) <= 500),
  import_batch uuid,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sales_discount_not_above_total CHECK (discount_cents <= quantity * unit_price_cents)
);
CREATE INDEX IF NOT EXISTS sales_sold_on_idx ON public.sales (sold_on DESC);
CREATE INDEX IF NOT EXISTS sales_group_idx ON public.sales (sale_group);
CREATE INDEX IF NOT EXISTS sales_whatsapp_order_idx ON public.sales (whatsapp_order_id) WHERE whatsapp_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS sales_import_batch_idx ON public.sales (import_batch) WHERE import_batch IS NOT NULL;

-- 6) Acesso: somente administradores ativos --------------------------------------------------
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['expense_categories','expenses','sales'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_all', t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_active_admin()) WITH CHECK (public.is_active_admin())',
      t || '_admin_all', t);
  END LOOP;
END $$;
