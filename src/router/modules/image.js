/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const imageRouter = {
  path: '/image',
  component: Layout,
  redirect: '/image/image-table',
  name: 'Image',
  meta: {
    title: '镜像',
    icon: 'table'
  },
  children: [
    {
      path: 'image-table',
      component: () => import('@/views/auto-image/image-table'),
      name: 'ImageTable',
      meta: { title: '镜像管理' }
    },
    {
      path: 'instance-table',
      component: () => import('@/views/auto-image/instance-table'),
      name: 'InstanceTable',
      meta: { title: '镜像实例' }
    }
  ]
}
export default imageRouter
