/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const jobRouter = {
  path: '/job',
  component: Layout,
  redirect: '/job/job-table',
  name: 'Job',
  meta: {
    title: '作业',
    icon: 'component'
  },
  children: [
    {
      path: 'job-table',
      component: () => import('@/views/auto-job/job-table'),
      name: 'JobTable',
      meta: { title: '作业管理' }
    }
  ]
}
export default jobRouter
