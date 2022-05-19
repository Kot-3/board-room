import {
  createApp
} from 'vue'
import './tailwind.css'
import App from './App.vue'
import {
  routes
} from './routes.js'
import {
  createRouter,
  createWebHistory
} from 'vue-router'
const app = createApp(App)
const baseServeUrl = '127.0.0.1:10001'
const router = createRouter({
  history: createWebHistory(),
  routes,
})
app.use(router)
app.mount('#app')