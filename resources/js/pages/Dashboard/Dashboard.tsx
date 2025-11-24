import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import {
    Users,
    Zap,
    Radio,
    MessageSquare,
    TrendingUp,
} from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Head } from '@inertiajs/react';

interface DashboardData {
    totalLeads: {
        totalLeads: number;
        symbol: string;
        growth: string;
    };
    activeAutomations: {
        activeAutomations: number;
        symbol: string;
        growth: string;
    };
    totalBroadcasts: {
        totalBroadcasts: number;
        symbol: string;
        growth: string;
    };
    todayMessages: {
        todayMessages: number;
        symbol: string;
        growth: string;
    };
    chartData: {
        name: string;
        leads: number;
        messages: number;
        broadcasts: number;
    }[];
}

interface StatWidgetProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: any;
        isPositive: boolean;
    };
}

function StatWidget({ title, value, icon, trend }: StatWidgetProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                    <p className="text-xs text-muted-foreground mt-1">
                        <span
                            className={
                                trend.isPositive
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }
                        >
                            {trend.isPositive ? '+' : ''}
                            {trend.value}%
                        </span>{' '}
                        from last month
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                let response;
                if (window.axios) {
                    response = await window.axios.get('/data/dashboard');
                } else {
                    const fetchResponse = await fetch('/data/dashboard', {
                        headers: {
                            Accept: 'application/json',
                            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                        },
                    });

                    if (!fetchResponse.ok) {
                        throw new Error('Failed to fetch dashboard data');
                    }

                    response = { data: await fetchResponse.json() };
                }
                setData(response.data);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                        err.message ||
                        'Failed to load dashboard data',
                );
                // Set default data for demo purposes
                setData({
                    totalLeads: {
                        totalLeads: 0,
                        symbol: '',
                        growth: '',
                    },
                    activeAutomations: {
                        activeAutomations: 0,
                        symbol: '',
                        growth: '',
                    },
                    totalBroadcasts: {
                        totalBroadcasts: 0,
                        symbol: '',
                        growth: '',
                    },
                    todayMessages: {
                        todayMessages: 0,
                        symbol: '',
                        growth: '',
                    },
                    chartData: [],
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Default chart data if API doesn't provide it
    const chartData = data?.chartData || [
        { name: 'Mon', leads: 12, messages: 45, broadcasts: 3 },
        { name: 'Tue', leads: 19, messages: 52, broadcasts: 5 },
        { name: 'Wed', leads: 15, messages: 38, broadcasts: 2 },
        { name: 'Thu', leads: 22, messages: 61, broadcasts: 7 },
        { name: 'Fri', leads: 18, messages: 48, broadcasts: 4 },
        { name: 'Sat', leads: 14, messages: 35, broadcasts: 3 },
        { name: 'Sun', leads: 20, messages: 55, broadcasts: 6 },
    ];

    return (
        <AppSidebarLayout
            breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }] as BreadcrumbItem[]}
        >
            <Head title="Dashboard" />
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Overview of your business metrics and performance
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatWidget
                        title="Total Leads"
                        value={
                            isLoading
                                ? '...'
                                : data?.totalLeads?.totalLeads?.toLocaleString() || '0'
                        }
                        icon={<Users className="h-4 w-4" />}
                        trend={{ value: data?.totalLeads?.growth || 0, isPositive: data?.totalLeads?.symbol == "+" ? true : false }}
                    />
                    <StatWidget
                        title="Active Automations"
                        value={
                            isLoading
                                ? '...'
                                : data?.activeAutomations?.activeAutomations?.toLocaleString() ||
                                  '0'
                        }
                        icon={<Zap className="h-4 w-4" />}
                        trend={{ value: data?.activeAutomations?.growth || 0, isPositive: data?.activeAutomations?.symbol == "+" ? true : false }}
                    />
                    <StatWidget
                        title="Total Broadcasts"
                        value={
                            isLoading
                                ? '...'
                                : data?.totalBroadcasts?.totalBroadcasts?.toLocaleString() || '0'
                        }
                        icon={<Radio className="h-4 w-4" />}
                        trend={{ value: data?.totalBroadcasts?.growth || 0, isPositive: data?.totalBroadcasts?.symbol == "+" ? true : false }}
                    />
                    <StatWidget
                        title="Today's Messages"
                        value={
                            isLoading
                                ? '...'
                                : data?.todayMessages?.todayMessages?.toLocaleString() || '0'
                        }
                        icon={<MessageSquare className="h-4 w-4" />}
                        trend={{ value: data?.todayMessages?.growth || 0, isPositive: data?.todayMessages?.symbol == "+" ? true : false }}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Line Chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                <CardTitle>Weekly Performance</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="leads"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        name="Leads"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="messages"
                                        stroke="#82ca9d"
                                        strokeWidth={2}
                                        name="Messages"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Bar Chart */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Radio className="h-5 w-5" />
                                <CardTitle>Broadcast Activity</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="broadcasts"
                                        fill="#8884d8"
                                        name="Broadcasts"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppSidebarLayout>
    );
}

