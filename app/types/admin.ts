/**
 * Tipos e interfaces compartilhadas do Painel Administrativo UNA JOYA
 */

export interface AdminProduct {
  id: number
  name: string
  description: string
  price: number
  stock: number
  promo: boolean
  duration: number // em dias
  image: string
  images: string[]
  createdAt: Date
  category_id: number | null
  category_name?: string
}

export interface AdminProductFormState {
  id: number | null
  name: string
  description: string
  price: number | null
  stock: number | null
  promo: boolean
  duration: number
  image: string
  images: string[]
  category_id: number | null
}

export interface Category {
  id: number
  name: string
  slug: string
  sort_order: number
  active: boolean
  created_at?: string
}

export interface CategoryFormState {
  id: number | null
  name: string
  slug: string
  sort_order: number
  active: boolean
}

export interface AboutUsFormState {
  title: string
  content: string
  image: string
}

export interface HeroSlide {
  id: number
  sort_order: number
  image: string
  subtitle: string
  title: string
  btn1: string
  btn2: string
  align: string
  active: boolean
}

export interface HeroSlideFormState {
  id: number | null
  sort_order: number
  image: string
  subtitle: string
  title: string
  btn1: string
  btn2: string
  align: string
  active: boolean
}

export interface LookbookPhoto {
  id: number
  image: string
  alt: string
  sort_order: number
}

export interface LookbookFormState {
  id: number | null
  image: string
  alt: string
  sort_order: number
}

export interface AdminOrderItem {
  name: string
  price: number
  quantity: number
  image: string
}

export interface AdminOrder {
  id: number
  created_at: string
  stripe_session_id: string | null
  customer_email: string | null
  customer_name: string | null
  customer_phone: string | null
  items: AdminOrderItem[]
  subtotal: number
  total: number
  status: string
  tracking_code: string | null
  notes: string | null
}

export interface OrderStatusOption {
  value: string
  label: string
  color: string
}

export type AdminTab = 'products' | 'categories' | 'about' | 'carousel' | 'lookbook' | 'orders'

export interface SupabaseProductRow {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  promo: boolean
  duration: number
  image: string | null
  images?: unknown
  created_at?: string | null
  category_id: number | null
  categories?: { name: string } | null
}

export interface AdminProductPayload {
  name: string
  description: string
  price: number
  stock: number
  promo: boolean
  duration: number
  image: string
  images?: string[]
  category_id: number | null
}

export const getErrorMessage = (err: unknown): string => {
  if (err && typeof err === 'object') {
    if ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data) {
      return String(err.data.message)
    }
    if ('message' in err && typeof err.message === 'string') {
      return err.message
    }
  }
  return 'Erro desconhecido'
}
