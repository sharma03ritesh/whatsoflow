import ResponsiveLayout from '@/layouts/responsive-layout';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return <ResponsiveLayout breadcrumbs={breadcrumbs}>{children}</ResponsiveLayout>;
}
