import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Send, Upload, Image, File, X, Loader2, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { type BreadcrumbItem } from '@/types';

export interface BroadcastHistory {
    id: string | number;
    campaignName: string;
    sent: number;
    delivered: number;
    status: 'pending' | 'sending' | 'completed' | 'failed';
    createdAt: string;
}

interface BroadcastFormData {
    campaignName: string;
    audienceSegment: string;
    message: string;
    mediaFile: File | null;
    mediaUrl: string | null;
    mediaType: 'image' | 'document' | null;
}

const AUDIENCE_SEGMENTS = [
    { value: 'all', label: 'All Leads' },
    { value: 'new', label: 'New Leads' },
    { value: 'contacted', label: 'Contacted Leads' },
    { value: 'qualified', label: 'Qualified Leads' },
    { value: 'custom', label: 'Custom Segment' },
];

export default function Broadcast() {
    const [formData, setFormData] = useState<BroadcastFormData>({
        campaignName: '',
        audienceSegment: '',
        message: '',
        mediaFile: null,
        mediaUrl: null,
        mediaType: null,
    });
    const [history, setHistory] = useState<BroadcastHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Fetch broadcast history
    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);
            setError(null);

            let response;
            if (window.axios) {
                response = await window.axios.get('/api/broadcast/history', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                });
            } else {
                const fetchResponse = await fetch('/api/broadcast/history', {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                });

                if (!fetchResponse.ok) {
                    throw new Error('Failed to fetch broadcast history');
                }

                response = { data: await fetchResponse.json() };
            }

            setHistory(response.data || []);
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Failed to load broadcast history',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            setIsUploading(true);
            setError(null);

            const formData = new FormData();
            formData.append('file', file);

            let response;
            if (window.axios) {
                response = await window.axios.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                });
            } else {
                const fetchResponse = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: formData,
                });

                if (!fetchResponse.ok) {
                    throw new Error('Failed to upload file');
                }

                response = { data: await fetchResponse.json() };
            }

            const mediaType = file.type.startsWith('image/') ? 'image' : 'document';
            setFormData((prev) => ({
                ...prev,
                mediaFile: file,
                mediaUrl: response.data.url || response.data.path,
                mediaType,
            }));
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Failed to upload file',
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            handleFileUpload(file);
        }
    };

    const removeMedia = () => {
        setFormData((prev) => ({
            ...prev,
            mediaFile: null,
            mediaUrl: null,
            mediaType: null,
        }));
    };

    const handleSend = async () => {
        if (!formData.campaignName || !formData.audienceSegment || !formData.message) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setIsSending(true);
            setError(null);

            const payload = {
                campaignName: formData.campaignName,
                audienceSegment: formData.audienceSegment,
                message: formData.message,
                mediaUrl: formData.mediaUrl,
                mediaType: formData.mediaType,
            };

            let response;
            if (window.axios) {
                response = await window.axios.post('/api/broadcast/send', payload, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                });
            } else {
                const fetchResponse = await fetch('/api/broadcast/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (!fetchResponse.ok) {
                    const errorData = await fetchResponse.json().catch(() => ({}));
                    throw { response: { data: errorData }, status: fetchResponse.status };
                }

                response = { data: await fetchResponse.json() };
            }

            // Reset form
            setFormData({
                campaignName: '',
                audienceSegment: '',
                message: '',
                mediaFile: null,
                mediaUrl: null,
                mediaType: null,
            });

            // Refresh history
            fetchHistory();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    'Failed to send broadcast',
            );
        } finally {
            setIsSending(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            completed: 'default',
            sending: 'secondary',
            pending: 'outline',
            failed: 'destructive',
        };

        return (
            <Badge variant={variants[status] || 'outline'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
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

    return (
        <AppSidebarLayout
            breadcrumbs={[{ title: 'Broadcast', href: '/broadcast' }] as BreadcrumbItem[]}
        >
            <div className="space-y-6 p-4 md:p-6 lg:p-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Broadcast</h1>
                    <p className="text-muted-foreground mt-2">
                        Send bulk WhatsApp messages to your audience
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Send Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Broadcast</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="campaignName">Campaign Name *</Label>
                                <Input
                                    id="campaignName"
                                    placeholder="e.g., New Product Launch"
                                    value={formData.campaignName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            campaignName: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="audienceSegment">Audience Segment *</Label>
                                <Select
                                    value={formData.audienceSegment}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, audienceSegment: value })
                                    }
                                >
                                    <SelectTrigger id="audienceSegment">
                                        <SelectValue placeholder="Select audience segment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AUDIENCE_SEGMENTS.map((segment) => (
                                            <SelectItem
                                                key={segment.value}
                                                value={segment.value}
                                            >
                                                {segment.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message *</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Type your message here..."
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            message: e.target.value,
                                        })
                                    }
                                    rows={6}
                                    className="resize-none"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {formData.message.length} characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Media (Optional)</Label>
                                {formData.mediaUrl ? (
                                    <div className="border rounded-md p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {formData.mediaType === 'image' ? (
                                                    <Image className="h-4 w-4" />
                                                ) : (
                                                    <File className="h-4 w-4" />
                                                )}
                                                <span className="text-sm">
                                                    {formData.mediaFile?.name || 'Media'}
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={removeMedia}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {formData.mediaType === 'image' && (
                                            <img
                                                src={formData.mediaUrl}
                                                alt="Preview"
                                                className="max-w-full h-32 object-contain rounded"
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded-md p-4">
                                        <label className="flex flex-col items-center cursor-pointer">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="h-4 w-4" />
                                                        Click to upload or drag and drop
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                disabled={isUploading}
                                            />
                                            <p className="text-xs text-muted-foreground mt-2">
                                                PNG, JPG, PDF up to 10MB
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPreview(true)}
                                    disabled={!formData.message}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </Button>
                                <Button
                                    onClick={handleSend}
                                    disabled={isSending || isUploading}
                                    className="flex-1"
                                >
                                    {isSending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Send Broadcast
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="bg-muted rounded-lg p-4 space-y-3">
                                    {formData.mediaUrl && formData.mediaType === 'image' && (
                                        <img
                                            src={formData.mediaUrl}
                                            alt="Preview"
                                            className="w-full rounded"
                                        />
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">
                                        {formData.message || 'Your message will appear here...'}
                                    </p>
                                    {formData.mediaUrl && formData.mediaType === 'document' && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <File className="h-4 w-4" />
                                            <span>{formData.mediaFile?.name || 'Document'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    <p>
                                        Audience:{' '}
                                        {AUDIENCE_SEGMENTS.find(
                                            (s) => s.value === formData.audienceSegment,
                                        )?.label || 'Not selected'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Broadcast History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Loading history...
                            </div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No broadcast history yet
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-4 font-semibold">
                                                Campaign Name
                                            </th>
                                            <th className="text-left p-4 font-semibold">Sent</th>
                                            <th className="text-left p-4 font-semibold">
                                                Delivered
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
                                        {history.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b hover:bg-muted/50"
                                            >
                                                <td className="p-4 font-medium">
                                                    {item.campaignName}
                                                </td>
                                                <td className="p-4">{item.sent}</td>
                                                <td className="p-4">{item.delivered}</td>
                                                <td className="p-4">
                                                    {getStatusBadge(item.status)}
                                                </td>
                                                <td className="p-4 text-sm text-muted-foreground">
                                                    {formatDate(item.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Preview Dialog */}
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Message Preview</DialogTitle>
                            <DialogDescription>
                                This is how your message will appear to recipients
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="bg-muted rounded-lg p-4 space-y-3">
                                {formData.mediaUrl && formData.mediaType === 'image' && (
                                    <img
                                        src={formData.mediaUrl}
                                        alt="Preview"
                                        className="w-full rounded"
                                    />
                                )}
                                <p className="text-sm whitespace-pre-wrap">
                                    {formData.message || 'No message'}
                                </p>
                                {formData.mediaUrl && formData.mediaType === 'document' && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <File className="h-4 w-4" />
                                        <span>{formData.mediaFile?.name || 'Document'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>
                                    <strong>Campaign:</strong> {formData.campaignName || 'N/A'}
                                </p>
                                <p>
                                    <strong>Audience:</strong>{' '}
                                    {AUDIENCE_SEGMENTS.find(
                                        (s) => s.value === formData.audienceSegment,
                                    )?.label || 'Not selected'}
                                </p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppSidebarLayout>
    );
}

