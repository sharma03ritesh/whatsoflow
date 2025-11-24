import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type BreadcrumbItem } from '@/types';

interface SettingsData {
    profile: {
        name: string;
        email: string;
        company: string;
    };
    whatsapp: {
        token: string;
        phoneNumber: string;
    };
    integrations: {
        crm: boolean;
        zapier: boolean;
        webhooks: boolean;
    };
}

export default function Settings() {
    const [settings, setSettings] = useState<SettingsData>({
        profile: {
            name: '',
            email: '',
            company: '',
        },
        whatsapp: {
            token: '',
            phoneNumber: '',
        },
        integrations: {
            crm: false,
            zapier: false,
            webhooks: false,
        },
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch initial settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Try to fetch from API, or use defaults
            let response;
            if (window.axios) {
                try {
                    response = await window.axios.get('/api/settings', {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                        },
                    });
                    if (response.data) {
                        setSettings(response.data);
                    }
                } catch (err) {
                    // If no settings endpoint, use defaults
                    console.log('No settings endpoint, using defaults');
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccess(false);

            let response;
            if (window.axios) {
                response = await window.axios.post(
                    '/api/settings/update',
                    settings,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                        },
                    },
                );
            } else {
                const fetchResponse = await fetch('/api/settings/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: JSON.stringify(settings),
                });

                if (!fetchResponse.ok) {
                    const errorData = await fetchResponse.json().catch(() => ({}));
                    throw { response: { data: errorData }, status: fetchResponse.status };
                }

                response = { data: await fetchResponse.json() };
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Failed to save settings',
            );
        } finally {
            setIsSaving(false);
        }
    };

    const updateProfile = (field: keyof SettingsData['profile'], value: string) => {
        setSettings((prev) => ({
            ...prev,
            profile: {
                ...prev.profile,
                [field]: value,
            },
        }));
    };

    const updateWhatsApp = (field: keyof SettingsData['whatsapp'], value: string) => {
        setSettings((prev) => ({
            ...prev,
            whatsapp: {
                ...prev.whatsapp,
                [field]: value,
            },
        }));
    };

    const toggleIntegration = (integration: keyof SettingsData['integrations']) => {
        setSettings((prev) => ({
            ...prev,
            integrations: {
                ...prev.integrations,
                [integration]: !prev.integrations[integration],
            },
        }));
    };

    if (isLoading) {
        return (
            <AppSidebarLayout
                breadcrumbs={[
                    { title: 'Settings', href: '/settings' },
                ] as BreadcrumbItem[]}
            >
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">Loading settings...</p>
                    </div>
                </div>
            </AppSidebarLayout>
        );
    }

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Settings', href: '/settings' },
            ] as BreadcrumbItem[]}
        >
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your account settings and integrations
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : success ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-md bg-green-50 p-4 text-sm text-green-800 border border-green-200">
                        Settings saved successfully!
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Profile Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>
                                Update your personal information and company details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Your full name"
                                    value={settings.profile.name}
                                    onChange={(e) => updateProfile('name', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={settings.profile.email}
                                    onChange={(e) => updateProfile('email', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input
                                    id="company"
                                    type="text"
                                    placeholder="Your company name"
                                    value={settings.profile.company}
                                    onChange={(e) => updateProfile('company', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* WhatsApp API Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp API Settings</CardTitle>
                            <CardDescription>
                                Configure your WhatsApp Business API credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="token">API Token</Label>
                                <Input
                                    id="token"
                                    type="password"
                                    placeholder="Enter your WhatsApp API token"
                                    value={settings.whatsapp.token}
                                    onChange={(e) =>
                                        updateWhatsApp('token', e.target.value)
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your WhatsApp Business API token
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder="+1234567890"
                                    value={settings.whatsapp.phoneNumber}
                                    onChange={(e) =>
                                        updateWhatsApp('phoneNumber', e.target.value)
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    WhatsApp Business phone number
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Integrations */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Integrations</CardTitle>
                            <CardDescription>
                                Enable or disable third-party integrations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* CRM Integration */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="crm" className="text-base">
                                            CRM Integration
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Connect with your CRM system to sync leads and
                                            contacts
                                        </p>
                                    </div>
                                    <Switch
                                        id="crm"
                                        checked={settings.integrations.crm}
                                        onCheckedChange={() => toggleIntegration('crm')}
                                    />
                                </div>

                                {/* Zapier Integration */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="zapier" className="text-base">
                                            Zapier Integration
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automate workflows with Zapier connections
                                        </p>
                                    </div>
                                    <Switch
                                        id="zapier"
                                        checked={settings.integrations.zapier}
                                        onCheckedChange={() => toggleIntegration('zapier')}
                                    />
                                </div>

                                {/* Webhooks Integration */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="webhooks" className="text-base">
                                            Webhooks
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Send real-time events to your webhook endpoints
                                        </p>
                                    </div>
                                    <Switch
                                        id="webhooks"
                                        checked={settings.integrations.webhooks}
                                        onCheckedChange={() => toggleIntegration('webhooks')}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppSidebarLayout>
    );
}

