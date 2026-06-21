export const useDrawer = () => {
  const isDrawerOpen = useState<boolean>('drawer-open', () => false)

  const openDrawer = () => {
    isDrawerOpen.value = true
    if (import.meta.client) {
      document.body.style.overflow = 'hidden'
    }
  }

  const closeDrawer = () => {
    isDrawerOpen.value = false
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  }

  const toggleDrawer = () => {
    if (isDrawerOpen.value) {
      closeDrawer()
    } else {
      openDrawer()
    }
  }

  return {
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer
  }
}
