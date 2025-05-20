import UserAdminView from '../views/UserAdminView.vue';
import WorkerProfileView from '../views/WorkerProfileView.vue';
import WorkerSearchView from '../views/WorkerSearchView.vue';
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/admin/users',
    name: 'user-admin',
    component: UserAdminView
  },
  {
    path: '/worker/:id',
    name: 'worker-profile',
    component: WorkerProfileView
  },
  {
    path: '/search-workers',
    name: 'search-workers',
    component: WorkerSearchView
  },
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import( '../views/AboutView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import( '../views/RegisterView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import( '../views/LoginView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import( '../views/ProfileView.vue')
  },
  {
    path: '/add-service',
    name: 'add-service',
    component: () => import('../views/AddServiceView.vue')
  },
  {
    path: '/list-services',
    name: 'list-services',
    component: () => import('../views/ListServicesView.vue')
  },
  {
    path: '/service-details',
    name: 'service-details',
    component: () => import('../views/ServiceDetailsView.vue')
  },
  {
    path: '/list-experts',
    name: 'list-experts',
    component: () => import('../views/ListExpertsView.vue')
  },
  {
    path: '/expert/:id',
    name: 'ExpertDetail',
    component: () => import('../views/ExpertDetailView.vue')
  },
  {
    path: '/inbox',
    name: 'inbox',
    component: () => import('../views/InboxView.vue')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/ChatView.vue')
  },
  {
    path: '/chat/:userId',
    name: 'chat-user',
    component: () => import('../views/ChatView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
