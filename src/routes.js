import Home from './views/Home.vue'




/** @type {import('vue-router').RouterOptions['routes']} */
export const routes = [{
    path: '/',
    component: Home,
    meta: {
      title: 'Home'
    },
    redirect: '/test'
  },
  {
    path: '/:room',
    component: Home,
    meta: {
      title: 'Home'
    },
  }
]