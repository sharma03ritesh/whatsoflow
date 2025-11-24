import { useState, useEffect } from 'react';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head } from '@inertiajs/react';

export interface Automation {
    id: string | number;
    name: string;
    trigger_type: string;
    trigger_value?: string;
    action_type: string;
    action_config: Record<string, any>;
    delay_seconds: number;
    is_active: boolean;
    position?: number;
    created_at: string;
    updated_at: string;
    business_id?: string | number;
}

export interface CreateAutomationData {
    name: string;
    trigger_type: string;
    trigger_value?: string;
    action_type: string;
    action_config: Record<string, any>;
    delay_seconds: number;
    is_active: boolean;
    business_id?: string | number;
}

const TRIGGER_OPTIONS = [
    { value: 'new_lead', label: 'New Lead Created' },
    { value: 'stage_change', label: 'Stage Change' },
    { value: 'keyword', label: 'Keyword Match' },
    { value: 'timed', label: 'Timed' },
];

const ACTION_OPTIONS = [
    { value: 'send_message', label: 'Send Message' },
    { value: 'update_stage', label: 'Update Stage' },
    { value: 'add_tag', label: 'Add Tag' },
];

export default function Automations() {
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [updatingAutomations, setUpdatingAutomations] = useState<Record<string, boolean>>({});
    const [deletingAutomations, setDeletingAutomations] = useState<Record<string, boolean>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateAutomationData>({
        name: '',
        trigger_type: '',
        trigger_value: '',
        action_type: '',
        action_config: {},
        delay_seconds: 0,
        is_active: true,
    });

    // Fetch automations
    useEffect(() => {
        fetchAutomations();
    }, []);

    const fetchAutomations = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/data/automations', {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch automations');
            }

            const data = await response.json();
            setAutomations(data.automations || []);
        } catch (err: any) {
            console.error('Error fetching automations:', err);
            setError(err.message || 'Failed to load automations');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAutomations = automations.filter(automation => 
        automation.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleEditAutomation = (automation: Automation) => {
        setSelectedAutomation(automation);
        setFormData({
            name: automation.name,
            trigger_type: automation.trigger_type,
            trigger_value: automation.trigger_value || '',
            action_type: automation.action_type,
            action_config: automation.action_config,
            delay_seconds: automation.delay_seconds,
            is_active: automation.is_active,
            business_id: automation.business_id,
        });
        setIsDialogOpen(true);
    };

    const handleCreateOrUpdateAutomation = async () => {
        if (!formData.name || !formData.trigger_type || !formData.action_type) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate action_config based on action type
        if (formData.action_type === 'send_message' && !formData.action_config.message) {
            setError('Please enter a message for the send message action');
            return;
        }
        if (formData.action_type === 'update_stage' && !formData.action_config.stage) {
            setError('Please enter a stage for the update stage action');
            return;
        }
        if (formData.action_type === 'add_tag' && !formData.action_config.tag) {
            setError('Please enter a tag for the add tag action');
            return;
        }

        const isUpdate = !!selectedAutomation?.id;
        const automationId = selectedAutomation?.id;
        const method = isUpdate ? 'PUT' : 'POST';
        const url = isUpdate ? `/data/automations/${automationId}` : '/data/automations';

        try {
            if (isUpdate) {
                setUpdatingAutomations(prev => ({ ...prev, [automationId as string]: true }));
            } else {
                setIsCreating(true);
            }
            setError(null);

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to save automation');
            }

            const data = await response.json();

            if (isUpdate) {
                setAutomations(automations.map(a => 
                    a.id === automationId ? { ...a, ...data.automation } : a
                ));
            } else {
                setAutomations([data.automation, ...automations]);
            }

            setIsDialogOpen(false);
            resetForm();
        } catch (err: any) {
            console.error('Error saving automation:', err);
            setError(err.message || 'Failed to save automation');
        } finally {
            if (isUpdate) {
                setUpdatingAutomations(prev => {
                    const newState = { ...prev };
                    delete newState[automationId as string];
                    return newState;
                });
            } else {
                setIsCreating(false);
            }
        }
    };

    const handleDeleteAutomation = async (id: string | number) => {
        if (!window.confirm('Are you sure you want to delete this automation? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingAutomations(prev => ({ ...prev, [id]: true }));
            
            const response = await fetch(`/data/automations/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete automation');
            }

            setAutomations(automations.filter(a => a.id !== id));
        } catch (err: any) {
            console.error('Error deleting automation:', err);
            setError(err.message || 'Failed to delete automation');
        } finally {
            setDeletingAutomations(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            trigger_type: '',
            trigger_value: '',
            action_type: '',
            action_config: {},
            delay_seconds: 0,
            is_active: true,
        });
        setSelectedAutomation(null);
    };

    const handleDialogOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            resetForm();
        }
    };

    const handleToggleStatus = async (automation: Automation) => {
        if (!automation.id) return;
        
        const automationId = automation.id.toString();
        const newStatus = !automation.is_active;

        try {
            setUpdatingAutomations(prev => ({ ...prev, [automationId]: true }));

            const response = await fetch(`/data/automations/${automationId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ is_active: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update automation status');
            }

            setAutomations(automations.map(a => 
                a.id === automation.id ? { ...a, is_active: newStatus } : a
            ));
        } catch (err: any) {
            console.error('Error toggling automation status:', err);
            setError(err.message || 'Failed to update automation status');
        } finally {
            setUpdatingAutomations(prev => {
                const newState = { ...prev };
                delete newState[automationId];
                return newState;
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTriggerLabel = (value: string) => {
        return TRIGGER_OPTIONS.find(opt => opt.value === value)?.label || value;
    };

    const getActionLabel = (value: string) => {
        return ACTION_OPTIONS.find(opt => opt.value === value)?.label || value;
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Automations', href: '/automations' },
            ] as BreadcrumbItem[]}
        >
            <Head title="Automations" />
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Automations
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your automated workflows and triggers
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Automation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white text-foreground sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create New Automation</DialogTitle>
                                <DialogDescription>
                                    Set up a new automation workflow with triggers
                                    and actions
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Welcome New Leads"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="trigger_type">Trigger *</Label>
                                    <Select
                                        value={formData.trigger_type}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, trigger_type: value })
                                        }
                                    >
                                        <SelectTrigger id="trigger_type" className="bg-white text-foreground">
                                            <SelectValue placeholder="Select a trigger" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white text-foreground">
                                            {TRIGGER_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="action_type">Action *</Label>
                                    <Select
                                        value={formData.action_type}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, action_type: value })
                                        }
                                    >
                                        <SelectTrigger id="action_type" className="bg-white text-foreground">
                                            <SelectValue placeholder="Select an action" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white text-foreground">
                                            {ACTION_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="delay_seconds">Delay (seconds)</Label>
                                    <Input
                                        id="delay_seconds"
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={formData.delay_seconds}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                delay_seconds: parseInt(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>

                                {formData.action_type === 'send_message' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <textarea
                                            id="message"
                                            className="w-full p-2 border rounded-md"
                                            rows={3}
                                            placeholder="Enter your message here..."
                                            value={formData.action_config.message || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    action_config: {
                                                        ...formData.action_config,
                                                        message: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                )}

                                {formData.action_type === 'update_stage' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="stage">Stage</Label>
                                        <Input
                                            id="stage"
                                            placeholder="Enter stage name..."
                                            value={formData.action_config.stage || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    action_config: {
                                                        ...formData.action_config,
                                                        stage: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                )}

                                {formData.action_type === 'add_tag' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="tag">Tag</Label>
                                        <Input
                                            id="tag"
                                            placeholder="Enter tag name..."
                                            value={formData.action_config.tag || ''}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    action_config: {
                                                        ...formData.action_config,
                                                        tag: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateOrUpdateAutomation}
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                        {error}
                    </div>
                )}

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Automations List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Loading automations...
                            </div>
                        ) : automations.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No automations found. Create your first automation
                                to get started.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-semibold">
                                                Name
                                            </th>
                                            <th className="text-left p-4 font-semibold">
                                                Trigger
                                            </th>
                                            <th className="text-left p-4 font-semibold">
                                                Actions
                                            </th>
                                            <th className="text-left p-4 font-semibold">
                                                Status
                                            </th>
                                            <th className="text-left p-4 font-semibold">
                                                Created At
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {automations.map((automation) => (
                                            <tr
                                                key={automation.id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="p-4 font-medium">
                                                    {automation.name}
                                                </td>
                                                <td className="p-4">
                                                    {getTriggerLabel(automation.trigger_type)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-1">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {getActionLabel(automation.action_type)}
                                                        </Badge>
                                                        {automation.action_config && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {automation.action_type === 'send_message' && automation.action_config.message && (
                                                                    <span className="truncate block max-w-[200px]">
                                                                        {automation.action_config.message.substring(0, 50)}...
                                                                    </span>
                                                                )}
                                                                {automation.action_type === 'update_stage' && automation.action_config.stage && (
                                                                    <span>Stage: {automation.action_config.stage}</span>
                                                                )}
                                                                {automation.action_type === 'add_tag' && automation.action_config.tag && (
                                                                    <span>Tag: {automation.action_config.tag}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={automation.is_active}
                                                            onCheckedChange={() =>
                                                                handleToggleStatus(
                                                                    automation,
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating ===
                                                                automation.id
                                                            }
                                                        />
                                                        <span className="text-sm text-muted-foreground">
                                                            {automation.is_active
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {formatDate(automation.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}

