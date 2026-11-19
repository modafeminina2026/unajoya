-- UNA JOYA - Ajustes finos de segurança (não aplicado automaticamente; rode no SQL Editor do Supabase)

-- Funções internas não precisam ser chamáveis pela API pública (/rest/v1/rpc).
-- Triggers continuam funcionando: o Postgres não exige EXECUTE para disparar função de trigger.
revoke execute on function public.trg_products_guard() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.generate_order_number() from public, anon, authenticated;
revoke execute on function public.generate_pickup_code() from public, anon, authenticated;
revoke execute on function public.calculate_pickup_ready_date() from public, anon, authenticated;

-- O bucket "product-images" é público: as imagens abrem pela URL sem essa política.
-- Ela só servia para qualquer pessoa LISTAR todos os arquivos do bucket.
drop policy if exists "Product images publicly accessible" on storage.objects;

-- Novas funções criadas no schema public deixam de ser executáveis pela API por padrão
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
