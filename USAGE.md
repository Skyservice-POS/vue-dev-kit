# Швидка інструкція по використанню

## 📦 Встановлення

```bash
npm install @skyservice-developers/vue-dev-kit --legacy-peer-deps
```

## 🚀 Vue 3

### main.js
```js
import { createApp } from 'vue'
import '@skyservice-developers/vue-dev-kit/vue3/style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

### Компонент
```vue
<script setup>
import { ref } from 'vue'
import { Header, Modal } from '@skyservice-developers/vue-dev-kit'

const showModal = ref(false)
</script>

<template>
  <div>
    <Header title="Моя сторінка">
      <button @click="showModal = true">Відкрити</button>
    </Header>

    <Modal v-model="showModal" title="Привіт!">
      <p>Це модальне вікно</p>
    </Modal>
  </div>
</template>
```

## 🚀 Vue 2

### main.js
```js
import Vue from 'vue'
import '@skyservice-developers/vue-dev-kit/vue2/style.css'
import App from './App.vue'

new Vue({
  render: h => h(App)
}).$mount('#app')
```

### Компонент
```vue
<template>
  <div>
    <Header title="Моя сторінка">
      <button @click="showModal = true">Відкрити</button>
    </Header>

    <Modal v-model="showModal" title="Привіт!">
      <p>Це модальне вікно</p>
    </Modal>
  </div>
</template>

<script>
import { Header, Modal } from '@skyservice-developers/vue-dev-kit/vue2'

export default {
  components: { Header, Modal },
  data() {
    return {
      showModal: false
    }
  }
}
</script>
```

## 📚 Доступні компоненти

- `Header` - Шапка сторінки з кнопкою "Назад"
- `Modal` - Модальне вікно
- `Dialog` - Діалогове вікно
- `BaseTeleport` - Базовий телепорт компонент

## 🔗 Повна документація

Дивіться [README.md](./README.md) для повної документації всіх компонентів, props, events та slots.
