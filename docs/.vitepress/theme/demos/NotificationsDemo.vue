<script setup>
import { ref, onMounted } from 'vue'
import SkyButton from '@/shared/ui/SkyButton/SkyButton.vue'

// Пакет реєструє web-component через customElements.define, якого немає в SSR,
// тому вантажимо його динамічно вже на клієнті.
const notify = ref(null)

onMounted(async () => {
  await import('sky-service-ui-components') // реєструє <sky-toast-notification>
  const mod = await import('sky-service-ui-components/modules')
  notify.value = mod.notificationModule.notify
})

function toast(type) {
  if (!notify.value) return
  const titles = {
    success: 'Успішно збережено!',
    error: 'Помилка завантаження',
    warning: 'Увага! Перевірте дані',
    info: 'Нове повідомлення',
  }
  notify.value[type]({
    toastData: {
      title: titles[type],
      description: type === 'error' ? 'Перевірте з’єднання з інтернетом' : undefined,
    },
  })
}

async function loadingToast() {
  if (!notify.value) return
  const id = await notify.value.loading({
    toastData: { title: 'Зберігається…', useCloseButton: false },
  })
  setTimeout(() => {
    if (id != null) notify.value.dismiss(id)
    notify.value.success({ toastData: { title: 'Готово!' } })
  }, 1800)
}
</script>

<template>
  <Demo title="Тости (рендеряться в кутку вікна)">
    <SkyButton variant="primary" @click="toast('success')">Success</SkyButton>
    <SkyButton variant="danger" @click="toast('error')">Error</SkyButton>
    <SkyButton variant="secondary" @click="toast('warning')">Warning</SkyButton>
    <SkyButton variant="outline" @click="toast('info')">Info</SkyButton>
    <SkyButton variant="secondary" @click="loadingToast">Loading → dismiss</SkyButton>
  </Demo>

  <sky-toast-notification />
</template>
