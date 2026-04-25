import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import CareBot from '../components/CareBot'

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="py-10 px-8">
          <Outlet />
        </div>
      </main>
      <CareBot />
    </div>
  )
}

export default DashboardLayout
