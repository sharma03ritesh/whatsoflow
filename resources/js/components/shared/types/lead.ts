// types/lead.ts
export interface Tag {
    id: string | number;
    name: string;
}

export interface Lead {
    id: string | number;
    name: string;
    phone?: string;
    email?: string;
    notes?: string | null;
    stage?: string | number;
    tags?: (string | Tag)[];
    pipeline_column_id?: string;  // Make it optional if not always required
    business_id?: string | number;
    lastMessage?: string | null;
    lastMessageTime?: string | null;
    [key: string]: any;  // For any additional properties
}