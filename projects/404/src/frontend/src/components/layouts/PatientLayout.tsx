import { Outlet } from "react-router-dom"
import { Sidebar } from "../shared/Sidebar"
import { DashboardTopBar } from "../shared/DashboardTopBar"

export function PatientLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar role="patient" />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopBar />
        
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_15%_10%,hsl(var(--muted)/0.5)_0%,transparent_38%),radial-gradient(circle_at_85%_0%,hsl(var(--muted)/0.5)_0%,transparent_28%)] p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
