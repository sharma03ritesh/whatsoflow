import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn, isSameUrl, resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Search, Settings, Users, Zap, Radio, CreditCard } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
    {
        title: 'Leads',
        href: '/leads',
        icon: Users,
    },
    {
        title: 'Automations',
        href: '/automations',
        icon: Zap,
    },
    {
        title: 'Broadcast',
        href: '/broadcast',
        icon: Radio,
    },
    {
        title: 'Billing',
        href: '/billing',
        icon: CreditCard,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

// const rightNavItems: NavItem[] = [
//     {
//         title: 'Repository',
//         href: 'https://github.com/laravel/react-starter-kit',
//         icon: Folder,
//     },
//     {
//         title: 'Documentation',
//         href: 'https://laravel.com/docs/starter-kits#react',
//         icon: BookOpen,
//     },
// ];

const activeItemStyles =
    'text-neutral-900';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    showMobileMenu?: boolean;
}

export function AppHeader({ breadcrumbs = [], showMobileMenu = false }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    return (
        <>
            <div className="flex justify-around border-b border-sidebar-border/80">
                <div className="flex items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    {showMobileMenu && (
                        <div className="mr-2">
                            <SidebarTrigger />
                        </div>
                    )}
                    <Link
                        href={dashboard().url}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>
                </div>
                <div className="flex justify-between items-center space-x-6 px-12 md:max-w-7xl">
                    <div className="flex justify-around items-center space-x-6">
                        {mainNavItems.map((item, index) => (
                            <NavigationMenuItem
                                key={index}
                                className="relative flex h-full items-center"
                            >
                                <Link
                                    href={item.href}
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        isSameUrl(
                                            page.url,
                                            item.href,
                                        ) && activeItemStyles,
                                        'h-9 cursor-pointer px-3',
                                    )}
                                    tabIndex={0}
                                >
                                    {item.icon && (
                                        <Icon
                                            iconNode={item.icon}
                                            className="mr-2 h-4 w-4"
                                        />
                                    )}
                                    {item.title}
                                </Link>
                                {isSameUrl(page.url, item.href) && (
                                    <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black"></div>
                                )}
                            </NavigationMenuItem>
                        ))}
                    </div>
                    <div className="flex items-center space-x-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage
                                            src={auth.user.avatar}
                                            alt={auth.user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </>
    );
}
