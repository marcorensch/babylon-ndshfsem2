import { createRouter, createWebHistory } from 'vue-router'
import UploadView from '../views/UploadView.vue'

const routes = [
  {
    path: '/',
    name: 'Upload',
    component: UploadView,
    props: true
  },
  {
    path: '/checker',
    name: 'Checker',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/CheckerView.vue'),
    props: true
  },
  {
    path: '/translator',
    name: 'Translator',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/TranslatorView.vue'),
    props: true
  },
  {
    path: '/settings',
    name: 'Settings',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/SettingsView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
