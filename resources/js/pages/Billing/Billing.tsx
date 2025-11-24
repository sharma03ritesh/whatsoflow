import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Download, Loader2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface BillingData {
    currentPlan: {
        name: string;
        price: number;
        interval: 'monthly' | 'yearly';
        renewalDate: string;
        status: 'active' | 'cancelled' | 'expired';
    };
}

interface Invoice {
    id: string | number;
    invoiceNumber: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    issueDate: string;
    dueDate: string;
    downloadUrl?: string;
}

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[];
    popular?: boolean;
}

const PRICING_PLANS: PricingPlan[] = [
    {
        id: 'starter',
        name: 'Starter',
        price: 29,
        interval: 'monthly',
        features: [
            'Up to 1,000 messages/month',
            'Basic automation',
            'Email support',
            '5 integrations',
        ],
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 79,
        interval: 'monthly',
        features: [
            'Up to 10,000 messages/month',
            'Advanced automation',
            'Priority support',
            'Unlimited integrations',
            'Custom webhooks',
        ],
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        interval: 'monthly',
        features: [
            'Unlimited messages',
            'All automation features',
            '24/7 dedicated support',
            'Custom integrations',
            'Advanced analytics',
            'SLA guarantee',
        ],
    },
];

export default function Billing() {
    const [billingData, setBillingData] = useState<BillingData | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    // Fetch billing data
    useEffect(() => {
        fetchBillingData();
        fetchInvoices();
    }, []);

    const fetchBillingData = async () => {
        try {
            setError(null);

            let response;
            if (window.axios) {
                response = await window.axios.get('/api/billing', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                });
            } else {
                const fetchResponse = await fetch('/api/billing', {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                });

                if (!fetchResponse.ok) {
                    throw new Error('Failed to fetch billing data');
                }

                response = { data: await fetchResponse.json() };
            }

            setBillingData(response.data);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Failed to load billing data',
            );
            // Set default data for demo
            setBillingData({
                currentPlan: {
                    name: 'Professional',
                    price: 79,
                    interval: 'monthly',
                    renewalDate: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    status: 'active',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInvoices = async () => {
        try {
            let response;
            if (window.axios) {
                response = await window.axios.get('/api/billing/invoices', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                });
            } else {
                const fetchResponse = await fetch('/api/billing/invoices', {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                });

                if (!fetchResponse.ok) {
                    throw new Error('Failed to fetch invoices');
                }

                response = { data: await fetchResponse.json() };
            }

            setInvoices(response.data || []);
        } catch (err: any) {
            console.error('Failed to fetch invoices:', err);
            // Set default demo invoices
            setInvoices([
                {
                    id: 1,
                    invoiceNumber: 'INV-2024-001',
                    amount: 79,
                    status: 'paid',
                    issueDate: '2024-01-01T00:00:00Z',
                    dueDate: '2024-01-15T00:00:00Z',
                },
            ]);
        }
    };

    const handleUpgrade = async (planId: string) => {
        try {
            setIsUpgrading(true);
            setError(null);

            let response;
            if (window.axios) {
                response = await window.axios.post(
                    '/api/billing/upgrade',
                    { planId },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                        },
                    },
                );
            } else {
                const fetchResponse = await fetch('/api/billing/upgrade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: JSON.stringify({ planId }),
                });

                if (!fetchResponse.ok) {
                    const errorData = await fetchResponse.json().catch(() => ({}));
                    throw { response: { data: errorData }, status: fetchResponse.status };
                }

                response = { data: await fetchResponse.json() };
            }

            setIsPricingModalOpen(false);
            setSelectedPlan(null);
            // Refresh billing data
            fetchBillingData();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Failed to upgrade plan',
            );
        } finally {
            setIsUpgrading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            'default' | 'secondary' | 'destructive' | 'outline'
        > = {
            paid: 'default',
            active: 'default',
            pending: 'secondary',
            failed: 'destructive',
            cancelled: 'outline',
            expired: 'outline',
        };

        return (
            <Badge variant={variants[status] || 'outline'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const handleDownloadInvoice = (invoice: Invoice) => {
        if (invoice.downloadUrl) {
            window.open(invoice.downloadUrl, '_blank');
        } else {
            // Fallback: generate download URL
            const url = `/api/billing/invoices/${invoice.id}/download`;
            window.open(url, '_blank');
        }
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Billing', href: '/billing' },
            ] as BreadcrumbItem[]}
        >
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your subscription and view invoices
                        </p>
                    </div>
                    <Button onClick={() => setIsPricingModalOpen(true)}>
                        <ArrowUpRight className="h-4 w-4 mr-2" />
                        Upgrade Plan
                    </Button>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        Loading billing information...
                    </div>
                ) : (
                    <>
                        {/* Current Plan */}
                        {billingData && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Plan</CardTitle>
                                    <CardDescription>
                                        Your active subscription details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold">
                                                    {billingData.currentPlan.name}
                                                </h3>
                                                {getStatusBadge(billingData.currentPlan.status)}
                                            </div>
                                            <p className="text-muted-foreground mt-1">
                                                {formatCurrency(billingData.currentPlan.price)}/
                                                {billingData.currentPlan.interval === 'monthly'
                                                    ? 'month'
                                                    : 'year'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                Renewal Date
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {formatDate(
                                                    billingData.currentPlan.renewalDate,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Invoices Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice History</CardTitle>
                                <CardDescription>
                                    View and download your past invoices
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {invoices.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No invoices found
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left p-4 font-semibold">
                                                        Invoice Number
                                                    </th>
                                                    <th className="text-left p-4 font-semibold">
                                                        Amount
                                                    </th>
                                                    <th className="text-left p-4 font-semibold">
                                                        Status
                                                    </th>
                                                    <th className="text-left p-4 font-semibold">
                                                        Issue Date
                                                    </th>
                                                    <th className="text-left p-4 font-semibold">
                                                        Due Date
                                                    </th>
                                                    <th className="text-left p-4 font-semibold">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.map((invoice) => (
                                                    <tr
                                                        key={invoice.id}
                                                        className="border-b hover:bg-muted/50"
                                                    >
                                                        <td className="p-4 font-medium">
                                                            {invoice.invoiceNumber}
                                                        </td>
                                                        <td className="p-4">
                                                            {formatCurrency(invoice.amount)}
                                                        </td>
                                                        <td className="p-4">
                                                            {getStatusBadge(invoice.status)}
                                                        </td>
                                                        <td className="p-4 text-sm text-muted-foreground">
                                                            {formatDate(invoice.issueDate)}
                                                        </td>
                                                        <td className="p-4 text-sm text-muted-foreground">
                                                            {formatDate(invoice.dueDate)}
                                                        </td>
                                                        <td className="p-4">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDownloadInvoice(
                                                                        invoice,
                                                                    )
                                                                }
                                                            >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Download
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Pricing Modal */}
                <Dialog
                    open={isPricingModalOpen}
                    onOpenChange={setIsPricingModalOpen}
                >
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Upgrade Your Plan</DialogTitle>
                            <DialogDescription>
                                Choose a plan that fits your needs. You can change or
                                cancel anytime.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 md:grid-cols-3 py-4">
                            {PRICING_PLANS.map((plan) => (
                                <Card
                                    key={plan.id}
                                    className={`relative ${
                                        plan.popular
                                            ? 'border-primary ring-2 ring-primary'
                                            : ''
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <Badge>Most Popular</Badge>
                                        </div>
                                    )}
                                    <CardHeader>
                                        <CardTitle>{plan.name}</CardTitle>
                                        <div className="mt-2">
                                            <span className="text-3xl font-bold">
                                                {formatCurrency(plan.price)}
                                            </span>
                                            <span className="text-muted-foreground">
                                                /{plan.interval === 'monthly' ? 'mo' : 'yr'}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <ul className="space-y-2">
                                            {plan.features.map((feature, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-2 text-sm"
                                                >
                                                    <Check className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Button
                                            className="w-full"
                                            variant={
                                                plan.popular ? 'default' : 'outline'
                                            }
                                            onClick={() => handleUpgrade(plan.id)}
                                            disabled={
                                                isUpgrading ||
                                                selectedPlan === plan.id ||
                                                billingData?.currentPlan.name === plan.name
                                            }
                                        >
                                            {isUpgrading && selectedPlan === plan.id ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : billingData?.currentPlan.name === plan.name ? (
                                                'Current Plan'
                                            ) : (
                                                'Select Plan'
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsPricingModalOpen(false)}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}

