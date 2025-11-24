import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droppable } from '@hello-pangea/dnd';
import { LeadCard, type Lead } from './LeadCard';
import { cn } from '@/lib/utils';

export interface PipelineColumn {
    id: string;
    title: string;
    leads: Lead[];
    color: string;        // Added color properties
    bg_color: string;
    text_color: string;
}

interface PipelineColumnProps {
    column: PipelineColumn;
    onLeadClick?: (lead: Lead) => void;
    updatingLeads?: Record<string, boolean>;
    deletingLeads?: Record<string, boolean>;
}

export function PipelineColumn({ 
    column, 
    onLeadClick, 
    updatingLeads = {}, 
    deletingLeads = {} 
}: PipelineColumnProps) {
    const getColumnColor = () => {
        return {
            backgroundColor: `${column.bg_color}33`, // 33 = 20% opacity
            borderColor: `${column.color}80` // 80 = 50% opacity
        };
    };

    const getColumnHeaderColor = () => {
        return {
            backgroundColor: `${column.bg_color}1A`, // 1A = 10% opacity
            color: column.text_color,
            borderColor: `${column.color}80` // 80 = 50% opacity
        };
    };
    return (
        <div className="flex-shrink-0 w-full sm:w-80">
            <Card className="h-full flex flex-col backdrop-blur-sm border-2 transition-all duration-200 hover:shadow-lg"
                style={getColumnColor()}>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="px-3 py-1.5 rounded-full border text-sm font-semibold"
                            style={getColumnHeaderColor()}>
                            {column.title}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
                            <span className="text-sm font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded-full border">
                                {column.leads.length}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-3">
                    <Droppable droppableId={column.id}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={cn(
                                    'min-h-[300px] space-y-3 rounded-lg p-2 transition-all duration-200',
                                    snapshot.isDraggingOver && 'bg-background/50 ring-2 ring-primary/20'
                                )}
                            >
                                {column.leads.length === 0 ? (
                                    <div className="text-center text-sm text-muted-foreground py-12 border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
                                        <div className="space-y-2">
                                            <div className="w-12 h-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                                                <span className="text-lg">📋</span>
                                            </div>
                                            <p className="font-medium">No leads yet</p>
                                            <p className="text-xs">Drag leads here or add new ones</p>
                                        </div>
                                    </div>
                                ) : (
                                    column.leads.map((lead, index) => (
                                        <LeadCard
                                            key={lead.id}
                                            lead={lead}
                                            index={index}
                                            onClick={onLeadClick}
                                            isUpdating={updatingLeads[String(lead.id)] || false}
                                            isDeleting={deletingLeads[String(lead.id)] || false}
                                        />
                                    ))
                                )}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </CardContent>
            </Card>
        </div>
    );
}

