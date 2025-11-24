import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Button } from '@/components/ui/button';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { PanelLeftOpenIcon } from 'lucide-react';
import { dashboard} from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Settings } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Leads',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Automations',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Broadcast',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Billing',
        href: dashboard().url,
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: dashboard().url,
        icon: Settings,
    },
];

export function AppSidebar() {
    const { toggleSidebar } = useSidebar();
    
    return (
        <Sidebar collapsible="offcanvas">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                    title="Toggle sidebar (Ctrl/Cmd + B)"
                >
                    <PanelLeftOpenIcon className="h-4 w-4" />
                    <span className="sr-only">Collapse Sidebar</span>
                </Button>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
