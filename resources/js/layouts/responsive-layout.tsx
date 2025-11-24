import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppHeader } from '@/components/app-header';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { useIsMobile } from '@/hooks/use-mobile';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function ResponsiveLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const isMobile = useIsMobile();

    if (isMobile) {
        // Mobile: Use sidebar layout
        return (
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
        );
    }

    // Desktop: Use header layout with top navigation
    return (
        <AppShell variant="header">
            <AppHeader breadcrumbs={breadcrumbs} showMobileMenu={false} />
            <AppContent variant="header" className="overflow-x-hidden">
                {children}
            </AppContent>
        </AppShell>
    );
}
