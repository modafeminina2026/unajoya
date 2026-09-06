/**
 * UNA JOYA - Route Middleware Global de Bloqueio Administrativo
 *
 * FASE 0A-2.1: Contenção de Rotas
 * Intercepta e encerra com 404 qualquer tentativa de acesso à rota administrativa legada
 * (com ou sem barra final) antes da inicialização do componente ou de consultas ao Supabase/R2.
 */
export default defineNuxtRouteMiddleware((to) => {
  const normalizedPath = to.path.replace(/\/+$/, '')

  if (normalizedPath === '/painel-exclusivo-unajoya') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Página não encontrada',
      fatal: true
    })
  }
})
