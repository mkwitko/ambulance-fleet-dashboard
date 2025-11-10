import type { ComponentProps } from 'react'
import { SidebarTrigger, useSidebar } from './ui/sidebar'

interface AppHeaderProps {
  children?: React.ReactNode
  title?: string
}

export function AppHeader({ children, title }: AppHeaderProps) {
  const { state } = useSidebar()

  return (
    <header className="flex h-[49px] w-full shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          {state === 'collapsed' && <SidebarTrigger className="-ml-1" />}

          {title && <AppHeaderTitle>{title}</AppHeaderTitle>}
        </div>

        {children}
      </div>
    </header>
  )
}

interface AppHeaderTitleProps extends ComponentProps<'h1'> {}

export function AppHeaderTitle(props: AppHeaderTitleProps) {
  return <h1 className="font-semibold text-lg" {...props} />
}

interface AppHeaderActionsProps extends ComponentProps<'div'> {}

export function AppHeaderActions(props: AppHeaderActionsProps) {
  return <div className="flex items-center gap-2" {...props} />
}
