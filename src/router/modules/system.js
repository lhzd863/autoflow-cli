/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const systemRouter = {
  path: '/system',
  component: Layout,
  redirect: '/system/server-table',
  name: 'System',
  meta: {
    title: '系统',
    icon: 'component'
  },
  children: [
    {
      path: 'server-table',
      component: () => import('@/views/auto-system/server-table'),
      name: 'ServerTable',
      meta: { title: '服务端口管理' }
    },
    {
      path: 'worker-table',
      component: () => import('@/views/auto-system/worker-table'),
      name: 'WorkerTable',
      meta: { title: '节点心跳信息' }
    }
  ]
}
export default systemRouter
