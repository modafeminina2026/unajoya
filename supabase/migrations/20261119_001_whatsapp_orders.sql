-- UNA JOYA - Pedidos encaminhados via WhatsApp
-- Já aplicada no projeto Supabase (hkczlyvzicoklbebhnfo). Mantida aqui para versionamento.
-- Não reserva estoque e não mexe nas tabelas orders / order_items.

CREATE TABLE IF NOT EXISTS public.whatsapp_orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE CHECK (code ~ '^UJ-[A-Z0-9]{8}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  customer_name text CHECK (customer_name IS NULL OR char_length(customer_name) <= 80),
  note text CHECK (note IS NULL OR char_length(note) <= 500),
  items jsonb NOT NULL,
  subtotal_cents bigint NOT NULL CHECK (subtotal_cents >= 0),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_conversa', 'fechado', 'perdido')),
  admin_note text CHECK (admin_note IS NULL OR char_length(admin_note) <= 1000),
  origin text CHECK (origin IS NULL OR char_length(origin) <= 200)
);

CREATE INDEX IF NOT EXISTS whatsapp_orders_created_at_idx ON public.whatsapp_orders (created_at DESC);

ALTER TABLE public.whatsapp_orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.whatsapp_orders FROM PUBLIC, anon, authenticated;

-- Somente administradores ativos (admin_profiles) leem e atualizam status/observação
GRANT SELECT ON TABLE public.whatsapp_orders TO authenticated;
GRANT UPDATE (status, admin_note) ON TABLE public.whatsapp_orders TO authenticated;

DROP POLICY IF EXISTS whatsapp_orders_admin_select ON public.whatsapp_orders;
CREATE POLICY whatsapp_orders_admin_select ON public.whatsapp_orders
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = (SELECT auth.uid()) AND ap.is_active));

DROP POLICY IF EXISTS whatsapp_orders_admin_update ON public.whatsapp_orders;
CREATE POLICY whatsapp_orders_admin_update ON public.whatsapp_orders
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = (SELECT auth.uid()) AND ap.is_active))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles ap WHERE ap.id = (SELECT auth.uid()) AND ap.is_active));

-- Criação do pedido: o preço vem SEMPRE do catálogo (nunca do navegador)
CREATE OR REPLACE FUNCTION public.create_whatsapp_order(
  p_code text,
  p_items jsonb,
  p_customer_name text DEFAULT NULL,
  p_note text DEFAULT NULL,
  p_origin text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_items jsonb := '[]'::jsonb;
  v_subtotal bigint := 0;
  v_row record;
  v_count integer;
  v_name text := nullif(left(btrim(coalesce(p_customer_name, '')), 80), '');
  v_note text := nullif(left(btrim(coalesce(p_note, '')), 500), '');
  v_origin text := nullif(left(btrim(coalesce(p_origin, '')), 200), '');
  v_id bigint;
BEGIN
  IF p_code IS NULL OR p_code !~ '^UJ-[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'INVALID_CODE';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'INVALID_ITEMS';
  END IF;
  v_count := jsonb_array_length(p_items);
  IF v_count < 1 OR v_count > 50 THEN
    RAISE EXCEPTION 'INVALID_ITEMS_COUNT';
  END IF;

  -- Freio simples contra abuso: no máximo 30 pedidos por minuto no total
  IF (SELECT count(*) FROM public.whatsapp_orders WHERE created_at > now() - interval '1 minute') >= 30 THEN
    RAISE EXCEPTION 'RATE_LIMITED';
  END IF;

  FOR v_row IN
    SELECT pr.id, pr.name, pr.price, pr.image, req.qty
    FROM (
      SELECT (e->>'product_id')::integer AS pid, sum((e->>'quantity')::integer) AS qty
      FROM jsonb_array_elements(p_items) e
      GROUP BY 1
    ) req
    JOIN public.products pr ON pr.id = req.pid
    ORDER BY pr.id
  LOOP
    IF v_row.qty < 1 OR v_row.qty > 100 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY';
    END IF;
    v_subtotal := v_subtotal + ((v_row.price * 100)::bigint * v_row.qty);
    v_items := v_items || jsonb_build_object(
      'product_id', v_row.id,
      'name', v_row.name,
      'image', coalesce(v_row.image, ''),
      'quantity', v_row.qty,
      'unit_price_cents', (v_row.price * 100)::bigint,
      'line_total_cents', (v_row.price * 100)::bigint * v_row.qty
    );
  END LOOP;

  IF jsonb_array_length(v_items) = 0 THEN
    RAISE EXCEPTION 'NO_VALID_PRODUCTS';
  END IF;

  INSERT INTO public.whatsapp_orders (code, customer_name, note, items, subtotal_cents, origin)
  VALUES (p_code, v_name, v_note, v_items, v_subtotal, v_origin)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'id', v_id, 'code', p_code, 'subtotal_cents', v_subtotal);
END;
$function$;

REVOKE ALL ON FUNCTION public.create_whatsapp_order(text, jsonb, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_whatsapp_order(text, jsonb, text, text, text) TO anon, authenticated;
