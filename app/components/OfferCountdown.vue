<script setup lang="ts">
const secondsLeft = ref(891) // 14 minutes and 51 seconds

let timer: any = null

const formattedTime = computed(() => {
  const h = Math.floor(secondsLeft.value / 3600)
  const m = Math.floor((secondsLeft.value % 3600) / 60)
  const s = secondsLeft.value % 60
  
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
})

onMounted(() => {
  timer = setInterval(() => {
    if (secondsLeft.value > 0) {
      secondsLeft.value--
    } else {
      if (timer) clearInterval(timer)
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="flex items-center justify-center space-x-2 py-4 bg-surface-container-low/40 rounded-lg">
    <span class="material-symbols-outlined text-on-background text-lg animate-pulse">schedule</span>
    <p class="font-body-md text-on-background">
      Estas ofertas terminam em: <span class="font-bold text-error font-mono tracking-wider tabular-nums">{{ formattedTime }}</span>
    </p>
  </div>
</template>
