// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  nitro: {
    externals: {
      inline: ['mercadopago']
    }
  },
  vite: {
    optimizeDeps: {
      include: [
        '@supabase/supabase-js'
      ]
    }
  },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'https://hkczlyvzicoklbebhnfo.supabase.co',
      supabaseKey: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrY3pseXZ6aWNva2xiZWJobmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzAwMzYsImV4cCI6MjA5NDU0NjAzNn0.t8MalZsAlzcNbZu3kjvnpyS0IGO6oroNyXDg_cNgZO4'
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'UNA JOYA | Joalheria Artesanal',
      htmlAttrs: {
        lang: 'pt-BR'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: 'Una Joya - Joalheria Artesanal. Peças feitas à mão com pedras naturais.' },
        // Open Graph / Facebook / WhatsApp
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'UNA JOYA | Joalheria Artesanal' },
        { property: 'og:description', content: 'Una Joya - Joalheria Artesanal. Peças feitas à mão com pedras naturais.' },
        { property: 'og:image', content: '/about_us.png' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'UNA JOYA | Joalheria Artesanal' },
        { name: 'twitter:description', content: 'Una Joya - Joalheria Artesanal. Peças feitas à mão com pedras naturais.' },
        { name: 'twitter:image', content: '/about_us.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/about_us.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;700&family=Karla:wght@400;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap' }
      ]
    }
  }
})