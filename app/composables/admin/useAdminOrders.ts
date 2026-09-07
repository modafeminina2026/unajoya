import { ref, computed } from 'vue'
import type { AdminOrder, OrderStatusOption } from '~/types/admin'

export const useAdminOrders = () => {
  const { client } = useSupabase()

  const orders = ref<AdminOrder[]>([])
  const loadingOrders = ref(false)
  const savingOrderId = ref<number | null>(null)

  const orderStatusOptions: OrderStatusOption[] = [
    { value: 'pendente', label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'preparando', label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'enviado', label: 'Enviado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'entregue', label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200' }
  ]

  const defaultStatusOption: OrderStatusOption = {
    value: 'pendente',
    label: 'Pendente',
    color: 'bg-amber-100 text-amber-800 border-amber-200'
  }

  const getStatusOption = (status: string): OrderStatusOption => {
    return orderStatusOptions.find(o => o.value === status) ?? defaultStatusOption
  }

  const pendingOrdersCount = computed(() => orders.value.filter(o => o.status === 'pendente').length)

  const fetchOrders = async () => {
    loadingOrders.value = true
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      orders.value = data || []
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err)
    } finally {
      loadingOrders.value = false
    }
  }

  const handleUpdateOrderStatus = async (order: AdminOrder, newStatus: string) => {
    savingOrderId.value = order.id
    try {
      const { error } = await client
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)
      if (error) throw error
      order.status = newStatus
    } catch (err) {
      console.error('Erro ao atualizar status do pedido:', err)
      alert('Erro ao atualizar status do pedido.')
    } finally {
      savingOrderId.value = null
    }
  }

  const handleSaveOrderTracking = async (order: AdminOrder) => {
    savingOrderId.value = order.id
    try {
      const { error } = await client
        .from('orders')
        .update({
          tracking_code: order.tracking_code,
          notes: order.notes
        })
        .eq('id', order.id)
      if (error) throw error
      alert('Informações do pedido salvas com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar rastreio:', err)
      alert('Erro ao salvar informações do pedido.')
    } finally {
      savingOrderId.value = null
    }
  }

  const formatOrderDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const orderTotalItems = (order: AdminOrder) => {
    return order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0
  }

  return {
    orders,
    loadingOrders,
    savingOrderId,
    orderStatusOptions,
    getStatusOption,
    pendingOrdersCount,
    fetchOrders,
    handleUpdateOrderStatus,
    handleSaveOrderTracking,
    formatOrderDate,
    orderTotalItems
  }
}