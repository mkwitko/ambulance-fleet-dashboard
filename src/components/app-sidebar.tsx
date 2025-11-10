import {
  AudioWaveform,
  Building2Icon,
  BuildingIcon,
  Command,
  GalleryVerticalEnd,
  HouseIcon,
  MapPinHouseIcon,
  PanelLeftIcon,
  UsersIcon,
} from 'lucide-react'
import type * as React from 'react'
import logoSvg from '@/assets/svg/logo.svg'
import { NavUser } from '@/components/nav-user'
import { Navigation } from '@/components/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from './ui/button'
import { useGetAuthenticatedUserCompanies } from '@/http/generated/user/user'
// import { useParams } from '@tanstack/react-router'

// This is sample data.

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar()

  const { data: userOrganizationsData } = useGetAuthenticatedUserCompanies()

  const data = {
    user: {
      name: userOrganizationsData?.data.name,
      document: userOrganizationsData?.data.document,
      avatar: userOrganizationsData?.data.avatarUrl || '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: 'Acme Inc',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup',
      },
      {
        name: 'Evil Corp.',
        logo: Command,
        plan: 'Free',
      },
    ],
    navMain: [
      {
        title: userOrganizationsData?.data.companyGroup?.name || 'Carregando...',
        url: '/app/company-group',
        icon: Building2Icon,
        isActive: true,
        items: [
          {
            title: 'Detalhes',
            url: '/app/company-group/uuid',
          },
          {
            title: 'Empresas',
            url: '/app/company-group/uuid/companies',
          },
        ],
      },
      {
        title: 'Empresa',
        url: '/app/company',
        icon: BuildingIcon,
        isActive: true,
        items: [
          {
            title: 'Detalhes',
            url: '/app/company-group/uuid',
          },
          {
            title: 'Unidades',
            url: '/app/companies/uuid/units',
          },
        ],
      },
      {
        title: 'Unidade',
        url: '/app/units',
        icon: MapPinHouseIcon,
        isActive: true,
        items: [
          {
            title: 'Bases',
            url: '/app/units/uuid/bases',
          },
        ],
      },
      {
        title: 'Base',
        url: '/app/bases',
        icon: HouseIcon,
        isActive: true,
        items: [
          {
            title: 'Ambulâncias',
            url: '/app/bases/uuid/ambulances',
          },
        ],
      },
      {
        title: 'Usuários',
        url: '/app/users',
        icon: UsersIcon,
        isActive: true,
      },
    ],
  }

  return (
    <Sidebar className="group/sidebar" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu className="flex flex-row items-center justify-between">
          <SidebarMenuButton asChild className="hover:bg-transparent">
            <div>
              <img alt="Logo" className="size-7" src={logoSvg} />
              <span className="font-semibold text-base">Connect</span>
            </div>
          </SidebarMenuButton>

          {state === 'expanded' && (
            <SidebarTrigger className="opacity-0 transition-all duration-200 group-hover/sidebar:opacity-100">
              <Button size="icon-sm" variant="ghost">
                <PanelLeftIcon className="text-muted-foreground" />
              </Button>
            </SidebarTrigger>
          )}
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="mx-0" />

      <SidebarContent>
        <Navigation items={data.navMain} label="Painel Administrativo" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
