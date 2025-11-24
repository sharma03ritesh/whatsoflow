import { useState, useEffect, useMemo } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Plus, Search, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

import type { Lead as LeadCardLead } from '@/components/pipeline/LeadCard';

import { PipelineSettings } from '@/components/pipeline/PipelineSettings';
import { AddLeadModal } from '@/components/pipeline/AddLeadModal';
import { PipelineColumn } from '@/components/pipeline/PipelineColumn';
import { LeadModal } from '@/components/pipeline/LeadModal';
import { Head } from '@inertiajs/react';

/* ---------------------- FIXED TYPES ---------------------- */
interface Tag {
    id: string | number;
    name: string;
}

export type Lead = {
    id: string | number;
    name: string;
    phone?: string;
    email?: string;
    lastMessage?: string;
    stage: string | number;
    tags?: Array<string | { id: number; name: string }> | string[] | null;
    notes?: string | null;
    lastMessageTime?: string;
    pipeline_column_id?: string;
    business_id?: string | number;
    [key: string]: unknown;
};

export interface Column {
    readonly id: string;
    readonly title: string;
    readonly color: string;
    readonly bg_color: string;
    readonly text_color: string;
    leads: Lead[];
}

const DEFAULT_COLUMNS: readonly Column[] = [] as const;

/* ---------------------- MAIN COMPONENT ---------------------- */
export default function Leads() {
    const [columns, setColumns] = useState<Column[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updatingLeads, setUpdatingLeads] = useState<Record<string, boolean>>({});
    const [deletingLeads, setDeletingLeads] = useState<Record<string, boolean>>({});
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const openLeadModal = (lead: Lead) => {
        if (!lead) return;

        const formattedLead: Lead = {
            ...lead,
            tags: Array.isArray(lead.tags)
                ? lead.tags.map(tag => {
                    if (typeof tag === 'string') {
                        return { id: parseInt(tag) || 0, name: tag };
                    }
                    return {
                        ...tag,
                        id: typeof tag.id === 'string' ? parseInt(tag.id) || 0 : tag.id
                    };
                })
                : [],
            lastMessage: lead.lastMessage || undefined,
            lastMessageTime: lead.lastMessageTime || undefined,
        };

        setSelectedLead(formattedLead);
        setIsLeadModalOpen(true);
    };

    const handleSave = () => {
        setRefreshKey(prev => prev + 1);
    };

    /* ---------------------- FETCH LEADS ---------------------- */
    useEffect(() => {
        const fetchLeadsData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/data/leads', {
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch leads');

                const data = await response.json();
                setColumns(data.columns);
                setAllTags(data.allTags);
                setError(null);
            } catch (err) {
                console.error(err);
                setError('Failed to load leads.');
                setAllTags([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeadsData();
    }, [refreshKey]);

    /* ---------------------- CREATE LEAD ---------------------- */
    const handleAddLead = async (newLead: Omit<Lead, 'id'>) => {
        try {
            setIsUpdating(true);

            const response = await fetch('/data/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: newLead.name,
                    phone: newLead.phone,
                    stage: newLead.stage,
                    pipeline_column_id: newLead.pipeline_column_id,
                    tags: newLead.tags || [],
                    notes: newLead.notes,
                    business_id: newLead.business_id,
                }),
            });

            if (!response.ok) throw new Error('Failed to add lead');

            setRefreshKey(prev => prev + 1);
        } finally {
            setIsUpdating(false);
        }
    };

    /* ---------------------- UPDATE LEAD ---------------------- */
    const handleUpdateLead = async (updatedLead: Lead) => {
        if (!updatedLead.id) return;

        const leadId = updatedLead.id.toString();

        try {
            setUpdatingLeads(prev => ({ ...prev, [leadId]: true }));

            const response = await fetch(`/data/leads/${leadId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: updatedLead.name,
                    phone: updatedLead.phone,
                    stage: updatedLead.stage,
                    pipeline_column_id: updatedLead.pipeline_column_id,
                    tags: updatedLead.tags?.map((tag: any) => tag.name) || [],
                    notes: updatedLead.notes,
                    email: updatedLead.email,
                    business_id: updatedLead.business_id,
                }),
            });

            if (!response.ok) throw new Error('Failed to update lead');

            // setRefreshKey(prev => prev + 1);
            setSelectedLead(null);
            setIsLeadModalOpen(false);
        } finally {
            setUpdatingLeads(prev => {
                const newState = { ...prev };
                delete newState[leadId];
                return newState;
            });
        }
    };

    /* ---------------------- DELETE LEAD ---------------------- */
    const handleDeleteLead = async (leadId: string | number) => {
        const id = leadId.toString();
        try {
            setDeletingLeads(prev => ({ ...prev, [id]: true }));
            await fetch(`/data/leads/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            setRefreshKey(prev => prev + 1);
            setSelectedLead(null);
            setIsLeadModalOpen(false);
        } finally {
            setDeletingLeads(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        }
    };

    /* ---------------------- FILTERING ---------------------- */
    const filteredColumns = useMemo(() => {
        if (!searchQuery && selectedTags.length === 0) return columns;

        return columns.map(col => ({
            ...col,
            leads: col.leads.filter(lead => {
                const q = searchQuery.toLowerCase();

                const matchesSearch =
                    !searchQuery ||
                    lead.name?.toLowerCase()?.includes(q) ||
                    lead.phone?.toLowerCase()?.includes(q) ||
                    lead.notes?.toLowerCase()?.includes(q);

                const matchesTags =
                    selectedTags.length === 0 ||
                    (lead.tags &&
                        lead.tags.some(tag =>
                            selectedTags.includes(
                                typeof tag === 'string'
                                    ? tag
                                    : tag.name
                            )
                        ));

                return matchesSearch && matchesTags;
            }),
        }));
    }, [columns, searchQuery, selectedTags]);

    /* ---------------------- DRAG & DROP ---------------------- */
    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        )
            return;

        // Local state update
        setColumns(prevColumns => {
            const newColumns = [...prevColumns];
            const sourceColIndex = newColumns.findIndex(
                c => c.id === source.droppableId
            );
            const destColIndex = newColumns.findIndex(
                c => c.id === destination.droppableId
            );
            if (sourceColIndex === -1 || destColIndex === -1) return prevColumns;

            const sourceCol = { ...newColumns[sourceColIndex] };
            const destCol = { ...newColumns[destColIndex] };

            const [movedLead] = sourceCol.leads.splice(source.index, 1);
            movedLead.pipeline_column_id = destination.droppableId;

            destCol.leads.splice(destination.index, 0, movedLead);

            newColumns[sourceColIndex] = sourceCol;
            newColumns[destColIndex] = destCol;

            return newColumns;
        });

        // Server update
        try {
            setIsUpdating(true);

            await fetch(`/data/leads/${draggableId.toString()}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    pipeline_column_id: destination.droppableId,
                }),
            });

            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error(err);
            setRefreshKey(prev => prev + 1);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[{ title: 'Leads', href: '/leads' }] as BreadcrumbItem[]}
        >
            <Head title="Leads" />

            <div className="space-y-8 p-6 md:p-8 lg:p-10 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold">Leads Pipeline</h1>
                        <p className="text-lg text-muted-foreground">
                            Manage and track your leads
                        </p>
                    </div>

                    <Button size="lg" variant="outline" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="h-5 w-5 mr-2" />
                        Add Lead
                    </Button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 p-4 text-red-800 rounded-md">
                        {error}
                    </div>
                )}

                <PipelineSettings onSave={handleSave}>
                    <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Pipeline Settings
                    </Button>
                </PipelineSettings>

                {/* Search & Filters */}
                <div className="bg-card rounded-xl p-6 border shadow-sm">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search leads..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <Badge
                                key={tag}
                                variant={
                                    selectedTags.includes(tag)
                                        ? 'selected'
                                        : 'outline'
                                }
                                onClick={() =>
                                    setSelectedTags(prev =>
                                        prev.includes(tag)
                                            ? prev.filter(t => t !== tag)
                                            : [...prev, tag]
                                    )
                                }
                                className="cursor-pointer"
                            >
                                {tag}
                            </Badge>
                        ))}

                        {(searchQuery || selectedTags.length > 0) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedTags([]);
                                }}
                            >
                                <X className="h-3 w-3 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {/* Pipeline Board */}
                {isLoading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="rounded-xl p-6 border shadow-sm">
                            <div className="overflow-x-auto pb-4">
                                <div className="flex gap-6 min-w-max">
                                    {filteredColumns.map(col => (
                                        <PipelineColumn
                                            key={col.id}
                                            column={col}
                                            onLeadClick={openLeadModal}
                                            updatingLeads={updatingLeads}
                                            deletingLeads={deletingLeads}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DragDropContext>
                )}

                {isUpdating && (
                    <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
                        Updating...
                    </div>
                )}

                {/* Modals */}
                <AddLeadModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onAddLead={handleAddLead}
                    columns={columns}
                />

                <LeadModal
                    lead={selectedLead}
                    isOpen={isLeadModalOpen}
                    onClose={() => setIsLeadModalOpen(false)}
                    onUpdateLead={handleUpdateLead}
                    onDeleteLead={handleDeleteLead}
                    columns={columns}
                />
            </div>
        </AppSidebarLayout>
    );
}
