import { useEffect } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useCheckAuth } from '@/hooks/queries/use-check-auth'
import { useNavigate, Outlet } from 'react-router-dom'

export function AppLayout() {
  const { data, isLoading } = useCheckAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!data) return
    if (!data.isAuthenticated) {
      navigate('/authentication')
      return
    }
  }, [isLoading])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-full max-h-screen w-full flex-1">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
