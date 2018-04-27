import Vue from 'vue'
import Router from 'vue-router'

// 加载路由模块
const Index = ()=>import('@/pages/index')
const AppList = ()=>import('@/pages/applist')
const User = ()=>import('@/pages/sys/user')
const Position = ()=>import('@/pages/sys/position')
const Operation = ()=>import('@/pages/sys/operation')
Vue.use(Router)

export default new Router({
    routes: [
      {
        path: '/',
        name: 'index',
        component: Index,
        children: [
          {
            name: "applist",
            path: "applist.html",
            component: AppList
          },
          {
            path: "sys/user.html",
            component: User
          },
          {
            path: "sys/position.html",
            component: Position
          },
          {
            path: "sys/operation.html",
            component: Operation
          }
        ]
      }
    ]
})
