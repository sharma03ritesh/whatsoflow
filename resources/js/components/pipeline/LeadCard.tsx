import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Clock, NotebookTabs } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';

export interface Lead {
    id: string | number;
    name: string;
    phone?: string;
    lastMessage?: string;
    stage: number | string;
    tags?: Array<string | { id: number; name: string }> | string[] | null;
    notes?: string | null;
    lastMessageTime?: string;
    [key: string]: any;
}

interface LeadCardProps {
    lead: Lead;
    index: number;
    onClick?: (lead: Lead) => void;
    isUpdating?: boolean;
    isDeleting?: boolean;
}

export function LeadCard({ lead, index, onClick, isUpdating = false, isDeleting = false }: LeadCardProps) {
    const getTagColor = (tag: string) => {
        const colors: Record<string, string> = {
            'hot-lead': 'bg-red-100 text-red-700 border-red-200',
            'premium': 'bg-purple-100 text-purple-700 border-purple-200',
            'follow-up': 'bg-blue-100 text-blue-700 border-blue-200',
            'call-back': 'bg-green-100 text-green-700 border-green-200',
            'enterprise': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'closed-won': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'cold-lead': 'bg-gray-100 text-gray-700 border-gray-200',
            'technical': 'bg-orange-100 text-orange-700 border-orange-200',
            'meeting': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            'qualified': 'bg-violet-100 text-violet-700 border-violet-200',
            'budget': 'bg-amber-100 text-amber-700 border-amber-200',
            'lost': 'bg-rose-100 text-rose-700 border-rose-200',
        };
        return colors[tag] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <Draggable draggableId={String(lead.id)} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        'mb-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md bg-gradient-to-br from-card to-card/95 border rounded-lg relative',
                        snapshot.isDragging && 'shadow-xl ring-2 ring-primary/30 scale-105 rotate-1',
                        onClick && 'hover:border-primary/50 hover:shadow-lg transform hover:-translate-y-0.5',
                        (isUpdating || isDeleting) && 'opacity-75 cursor-not-allowed'
                    )}
                    onClick={() => onClick?.(lead)}
                >
                    {(isUpdating || isDeleting) && (
                        <div className="absolute inset-0 bg-background/50 rounded-lg flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    )}
                    <div className={cn('p-4 space-y-3', (isUpdating || isDeleting) && 'opacity-50')}>
                        {/* Lead Name and Status */}
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">
                                    {lead.name || 'Unnamed Lead'}
                                </h3>
                            </div>
                        </div>
                        {isUpdating && !isDeleting && (
                            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                Updating...
                            </div>
                        )}
                        {isDeleting && (
                            <div className="absolute bottom-2 right-2 text-xs text-destructive">
                                Deleting...
                            </div>
                        )}
                        {(lead.phone || lead.phone === '') && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-2 py-1.5 rounded-md">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="font-mono truncate">{lead.phone || 'No phone'}</span>
                            </div>
                        )}

                        {(lead.lastMessage || lead.last_message) && (
                            <div className="space-y-2">
                                <div className="flex items-start gap-2 text-xs">
                                    <MessageSquare className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                                            {lead.lastMessage || lead.last_message}
                                        </p>
                                        {(lead.lastMessageTime || lead.last_message_time) && (
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/70">
                                                <Clock className="h-2 w-2" />
                                                <span>{lead.lastMessageTime}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {lead.notes && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                    <NotebookTabs className="h-3 w-3 ml-2 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                                            {lead.notes}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {lead.tags?.map((tag, index) => {
                            const tagName = typeof tag === 'string' ? tag : tag.name;
                            return (
                                <Badge 
                                    key={typeof tag === 'string' ? `${tag}-${index}` : tag.id}
                                    className={cn(
                                        'text-xs font-medium mr-1 mb-1 border',
                                        getTagColor(tagName)
                                    )}
                                >
                                    {tagName}
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            )}
        </Draggable>
    );
}

