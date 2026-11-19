import { toStoreProducts, type ProductRow, type StoreProduct } from '~/utils/catalog'

/**
 * Catálogo público carregado uma vez e compartilhado entre home, categorias, busca e página da peça.
 * (O catálogo é pequeno; buscar tudo de uma vez deixa a navegação instantânea.)
 */
export const useStoreProducts = () => {
  const { client } = useSupabase()
  const products = useState<StoreProduct[]>('store-products', () => [])
  const loaded = useState<boolean>('store-products-loaded', () => false)
  const loading = useState<boolean>('store-products-loading', () => false)
  const failed = useState<boolean>('store-products-failed', () => false)
  let pending: Promise<void> | null = null

  const load = async (force = false): Promise<void> => {
    if (loaded.value && !force) return
    if (pending) return pending
    loading.value = true
    failed.value = false
    pending = (async () => {
      try {
        const { data, error } = await client
          .from('products')
          .select('id, name, description, price, image, images, promo, created_at, duration, stock, reserved_stock, categories(name, slug)')
          .order('id', { ascending: true })
        if (error) throw error
        products.value = toStoreProducts(data as unknown as ProductRow[])
        loaded.value = true
      } catch (err) {
        console.error('Erro ao carregar o catálogo:', err)
        failed.value = true
      } finally {
        loading.value = false
        pending = null
      }
    })()
    return pending
  }

  return { products, loaded, loading, failed, load }
}
