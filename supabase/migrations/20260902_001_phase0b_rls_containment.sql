-- ==============================================================================
-- UNA JOYA - MIGRATION DE CONTENÇÃO EMERGENCIAL DE RLS (FASE 0B)
-- Arquivo: supabase/migrations/20260902_001_phase0b_rls_containment.sql
-- Status: NÃO APLICADA - AGUARDANDO REVISÃO EXTERNA FORMAL
-- Transacional: Sim (BEGIN ... COMMIT)
-- Objetivo: Isolar tabela orders (default-deny) e fixar read-only no catálogo.
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. TABELA CRÍTICA: ORDERS (BLOQUEIO TOTAL CLIENT-SIDE / ZERO-ACCESS)
-- ------------------------------------------------------------------------------

-- 1.1 Garantir RLS habilitado na tabela orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 1.2 Remover policies públicas vulneráveis identificadas na auditoria
DROP POLICY IF EXISTS "Allow insert for all" ON public.orders;
DROP POLICY IF EXISTS "Allow select for all" ON public.orders;
DROP POLICY IF EXISTS "Allow update for all" ON public.orders;

-- 1.3 Revogar todos os privilégios de acesso direto para roles client-side e públicas
REVOKE ALL ON TABLE public.orders FROM PUBLIC, anon, authenticated;

-- Nota: Nenhum GRANT e nenhuma policy substituta são criados para orders nesta fase.
-- A tabela permanece 100% inacessível via API client-side (comportamento default-deny).
-- Acesso permitido exclusivamente via service_role / backend seguro.


-- ------------------------------------------------------------------------------
-- 2. TABELAS DE CATÁLOGO: READ-ONLY PÚBLICO SEGURO
-- ------------------------------------------------------------------------------

-- 2.1 Tabela: about_us
ALTER TABLE public.about_us ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.about_us FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.about_us TO anon, authenticated;
DROP POLICY IF EXISTS "catalog_public_read_about_us" ON public.about_us;
CREATE POLICY "catalog_public_read_about_us"
    ON public.about_us
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2.2 Tabela: categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.categories FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.categories TO anon, authenticated;
DROP POLICY IF EXISTS "catalog_public_read_categories" ON public.categories;
CREATE POLICY "catalog_public_read_categories"
    ON public.categories
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2.3 Tabela: hero_slides
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.hero_slides FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.hero_slides TO anon, authenticated;
DROP POLICY IF EXISTS "catalog_public_read_hero_slides" ON public.hero_slides;
CREATE POLICY "catalog_public_read_hero_slides"
    ON public.hero_slides
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2.4 Tabela: lookbook_photos
ALTER TABLE public.lookbook_photos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.lookbook_photos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.lookbook_photos TO anon, authenticated;
DROP POLICY IF EXISTS "catalog_public_read_lookbook_photos" ON public.lookbook_photos;
CREATE POLICY "catalog_public_read_lookbook_photos"
    ON public.lookbook_photos
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2.5 Tabela: products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.products FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.products TO anon, authenticated;
DROP POLICY IF EXISTS "catalog_public_read_products" ON public.products;
CREATE POLICY "catalog_public_read_products"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);


-- ------------------------------------------------------------------------------
-- 3. SEQUÊNCIAS DO SCHEMA PUBLIC (PROTEÇÃO CONTRA MUTAÇÃO CLIENT-SIDE)
-- ------------------------------------------------------------------------------

-- Revogar uso e seleção de todas as sequências para roles públicas e client-side
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC, anon, authenticated;

COMMIT;
