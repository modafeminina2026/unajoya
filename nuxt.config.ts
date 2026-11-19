// https://nuxt.com/docs/api/configuration/nuxt-config
// Ícones Material Symbols usados no site. O Google entrega SÓ estes (arquivo bem menor).
// Ao usar um ícone novo, acrescente o nome aqui (o teste tests/icons.test.ts avisa se faltar).
const MATERIAL_ICONS: string[] = [
  'add',
  'add_a_photo',
  'add_circle',
  'add_photo_alternate',
  'arrow_back',
  'category',
  'chat',
  'chevron_left',
  'chevron_right',
  'close',
  'cloud_upload',
  'delete',
  'diamond',
  'edit',
  'edit_note',
  'explore_off',
  'face_nod',
  'home',
  'hourglass_top',
  'inbox',
  'info',
  'local_shipping',
  'logout',
  'mail',
  'menu',
  'monitoring',
  'person',
  'phone',
  'photo_camera',
  'photo_library',
  'point_of_sale',
  'publish',
  'receipt_long',
  'remove',
  'remove_shopping_cart',
  'save',
  'schedule',
  'search',
  'share',
  'shopping_bag',
  'shopping_cart',
  'star',
  'support_agent',
  'sync',
  'upload_file',
  'view_carousel',
  'visibility',
  'visibility_off',
  'zoom_in'
]

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
  routeRules: {
    '/painel-exclusivo-unajoya': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      }
    },
    '/painel-exclusivo-unajoya/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive'
      }
    }
  },
  runtimeConfig: {
    checkoutEnabled: '',
    public: {
      // WhatsApp que recebe os pedidos (DDI + DDD + número, só dígitos)
      whatsappNumber: process.env.WHATSAPP_NUMBER || '5511953769317',
      supabaseUrl: process.env.SUPABASE_URL || 'https://hkczlyvzicoklbebhnfo.supabase.co',
      supabaseKey: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrY3pseXZ6aWNva2xiZWJobmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzAwMzYsImV4cCI6MjA5NDU0NjAzNn0.t8MalZsAlzcNbZu3kjvnpyS0IGO6oroNyXDg_cNgZO4'
    }
  },
  modules: ['@nuxtjs/tailwindcss'],
  css: [
    // Fontes da marca hospedadas no próprio site (sem esperar o Google), só o alfabeto latino
    '@fontsource/eb-garamond/latin-400.css',
    '@fontsource/eb-garamond/latin-400-italic.css',
    '@fontsource/eb-garamond/latin-700.css',
    '@fontsource/karla/latin-400.css',
    '@fontsource/karla/latin-700.css',
    '~/assets/css/main.css'
  ],
  app: {
    head: {
      title: 'UNA JOYA | Joalheria Artesanal',
      htmlAttrs: {
        lang: 'pt-BR'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
        { name: 'theme-color', content: '#fcf8f8' },
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
        { rel: 'stylesheet', href: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,300..400,0..1,0&icon_names=${[...MATERIAL_ICONS].sort().join(',')}&display=block` }
      ]
    }
  }
})