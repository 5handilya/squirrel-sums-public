// 


import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import GameSeeSaw from '../views/GameSeeSaw.vue';
import Login from '../views/Login.vue';
import Home from '../views/Home.vue';
import Builder from '../views/Builder.vue';
import { getFirebaseToken } from '../firebaseConfig';
import GameSlidingSquirrel from '../views/GameSlidingSquirrel.vue';

const API_URL = import.meta.env.VITE_API_URL;

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/gameSeeSaw',
    name: 'GameSeeSaw',
    component: GameSeeSaw,
    meta: { requiresAuth: true }
  },
  {
    path: '/gameSlidingSquirrel',
    name: 'GameSlidingSquirrel',
    component: GameSlidingSquirrel,
    meta: { requiresAuth: true }
  },
  {
    path: '/builder',
    name: 'Builder',
    component: Builder,
    meta: { requiresAuth: true }
  },
  //random URLs entered
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// login-related redirection
router.beforeEach((to, _, next) => {
  const userStore = localStorage.getItem('userStore');
  
  // Redirect from login to home if already authenticated
  if (to.name === 'Login' && userStore) {
    next({ name: 'Home' });
    return;
  }

  // Check auth requirement in destination, if yes & userStore not present return to login
  const nextRequiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (nextRequiresAuth && !userStore) {
    next({ name: 'Login' });
    return;
  }
  next();
});

// Check admin requirement for builder - userType retreived from backend
router.beforeEach(async (to, _, next) => {
  if (to.name === 'Builder') {
    try {
      const userId = localStorage.getItem('userId');
      const token = await getFirebaseToken();
      const response = await fetch(`${API_URL}/users/type/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log("Router's backend admin check:", data);
      if (data[0] !== 'admin') {
        next({ name: 'Home' });
        return;
      }
    } catch (error) {
      console.error('Router failed to verify admin status:', error);
      next({ name: 'Home' });
      return;
    }
  }
  next();
});

export default router;
