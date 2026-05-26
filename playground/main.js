import { createApp } from 'vue'
import App from './App.vue'
import { NotificationElement } from '../src'

NotificationElement.register()
createApp(App).mount('#app')
