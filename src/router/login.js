/**
 * Created by weikaiwei on 2017/9/28.
 */
import Vue from 'vue'
import Router from 'vue-router'
const Login = ()=>import('@/pages/login')
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    }
  ]
})
