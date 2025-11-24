import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { X, Plus, Edit2, Trash2, Clock, NotebookTabs, MessageSquare, Phone, User, Tags } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { type Lead } from '@/pages/Leads/Leads';
import { v4 as uuid } from "uuid";

interface LeadModalProps {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateLead: (lead: Lead) => void;
    onDeleteLead: (leadId: string | number) => void;
    columns: Array<{
        id: string | number;
        title: string;
        color: string;
        bg_color: string;
        text_color: string;
        leads: Lead[];
    }>;
}

interface FormData {
    name: string;
    phone?: string;
    stage: string | number;
    tags?: Array<string | { id: number; name: string }> | string[] | null;
    notes?: string | null;
    businessName?: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    stage?: string;
    tags?: string;
    notes?: string;
    businessName?: string;
}
interface Tag {
  id: string;        // uuid or DB id
  name: string;      // tag text
}

export function LeadModal({ lead, isOpen, onClose, onUpdateLead, onDeleteLead, columns }: LeadModalProps) {
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: lead?.name || "",
        phone: lead?.phone || "",
        stage: lead?.stage || 1,
        tags: lead?.tags || [],
        notes: lead?.notes || "",
    });

    const [newTag, setNewTag] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    // Add this useEffect hook right after the state declarations
    useEffect(() => {
        if (lead) {
            setFormData({
                name: lead.name || "",
                phone: lead.phone || "",
                stage: Number(lead.stage) || 1,
                tags: lead.tags || [],    // already objects
                notes: lead.notes || "",
            });
        }
    }, [lead]);
 // This will run whenever the lead prop changes
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        // Name validation (required, max 255 chars)
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length > 255) {
            newErrors.name = 'Name must be less than 255 characters';
        }
        
        // Phone validation (max 20 chars, valid format if provided)
        if (formData.phone && formData.phone.trim()) {
            if (formData.phone.length > 20) {
                newErrors.phone = 'Phone number must be less than 20 characters';
            } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
                newErrors.phone = 'Please enter a valid phone number';
            }
        }

        // Stage validation (required, must be a valid number)
        const stageNum = Number(formData.stage);
        if (isNaN(stageNum) || stageNum < 1) {
            newErrors.stage = 'Stage is required and must be valid';
        }
        
        // Notes validation (optional, max 65535 chars)
        if (formData.notes && formData.notes.length > 65535) {
            newErrors.notes = 'Notes must be less than 65535 characters';
        }

        // Tags validation (if tags exist, validate them)
        if (formData.tags && formData.tags.length > 0) {
            for (const tag of formData.tags) {
                if (typeof tag === 'string') {
                    if (tag.length > 50) {
                        newErrors.tags = "Each tag must be less than 50 characters";
                        break;
                    }
                } else if (tag.name.length > 50) {
                    newErrors.tags = "Each tag must be less than 50 characters";
                    break;
                }
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || !lead) return;
        try {
            setIsSubmitting(true);
            // Convert form data to match the Lead type
            const updatedLead: Lead = {
                ...lead,
                name: formData.name,
                phone: formData.phone,
                stage: formData.stage,
                notes: formData.notes || null,
                // Ensure tags are in the correct format
                tags: formData.tags?.map(tag => 
                    typeof tag === 'string' ? tag : { id: tag.id, name: tag.name }
                ) || []
            };

            onUpdateLead(updatedLead);
            setIsEditing(false);
            onClose();
        } catch (error) {
            console.error('Error updating lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        if (lead) {
            onDeleteLead(lead.id);
            onClose();
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addTag = () => {
        if (!newTag.trim()) return;

        const tagName = newTag.trim().toLowerCase();
        
        // prevent duplicates
        if (formData.tags?.some(tag => {
            if (typeof tag === 'string') {
                return tag.toLowerCase() === tagName;
            }
            return tag.name.toLowerCase() === tagName;
        })) {
            setNewTag("");
            return;
        }

        const tagObj = newTag.trim();
        
        setFormData(prev => ({
            ...prev,
            tags: [...(prev.tags || []), tagObj],
        }));

        setNewTag("");
    };

    const removeTag = (tagToRemove: string | { id: string | number; name: string }) => {
        setFormData(prev => ({
            ...prev,
            tags: (prev.tags || []).filter(tag => {
                if (typeof tag === 'string') {
                    return tag !== tagToRemove;
                }
                if (typeof tagToRemove === 'string') {
                    return tag.name !== tagToRemove;
                }
                return tag.id !== tagToRemove.id;
            })
        }));
    };




    const resetForm = () => {
        setFormData({
            name: lead?.name || '',
            phone: lead?.phone || '',
            tags: lead?.tags || [],
            stage: lead?.stage || 1,
            notes: lead?.notes || '',
        });
        setIsEditing(false);
    };
    if (!lead) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            onClose();
        }}>
            <DialogContent className="sm:max-w-[500px] bg-white rounded-xl shadow-lg">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-semibold text-black">
                        {isEditing ? 'Edit Lead' : 'Lead Details'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {isEditing ? 'Update the lead information below.' : 'View and manage lead details.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-black">Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter lead name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className={`h-11 bg-white text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.name && isEditing ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {errors.name && isEditing && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-medium text-black">Phone</Label>
                                    <PhoneInput
                                        country={'in'}
                                        value={formData.phone}
                                        onChange={(value) => handleInputChange('phone', value)}
                                        inputClass={`!w-full !h-11 !text-sm bg-white text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.phone && isEditing ? '!border-red-500' : '!border-gray-200'}`}
                                        buttonClass="!bg-gray-200"
                                        containerClass="mt-1"
                                        dropdownClass="!text-black"
                                        placeholder="Enter phone number"
                                        enableSearch={true}
                                        searchPlaceholder="Search country..."
                                        disableSearchIcon={true}
                                    />
                                    {errors.phone && isEditing && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stage" className="text-sm font-medium text-black">Stage</Label>
                                    <Select
                                        value={formData.stage.toString()}
                                        onValueChange={(value) => handleInputChange('stage', value)}
                                    >
                                        <SelectTrigger
                                            className={`h-11 bg-white text-black border ${errors.stage ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                                        >
                                            <SelectValue placeholder="Select stage">
                                        {columns.find(col => col.id.toString() === formData.stage.toString())?.title || 'Select stage'}
                                    </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                                            {columns.map((column:any) => (
                                                <SelectItem 
                                                    aria-selected = {formData.stage === column.id}
                                                    key={column.id} 
                                                    value={column.id.toString()} 
                                                    className="hover:bg-gray-200 cursor-pointer"
                                                >
                                                    {column.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes" className="text-sm font-medium text-black">Notes</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Add an initial message or note about this lead..."
                                    value={formData.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    className={`min-h-[80px] bg-white text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none ${errors.notes && isEditing ? 'border-red-500' : 'border-gray-200'}`}
                                />
                                {errors.notes && isEditing && <p className="text-sm text-red-500">{errors.notes}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-black">Tags</Label>
                                <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded-lg border border-gray-200 bg-white">
                                    {formData.tags?.map((tag, index) => {
                                        const tagName = typeof tag === 'string' ? tag : tag.name;
                                        const tagId = typeof tag === 'string' ? index.toString() : tag.id;
                                        
                                        return (
                                            <Badge key={tagId} className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                                                {tagName}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeTag(tag);
                                                    }}
                                                    className="ml-1 text-blue-500 hover:text-blue-700"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add a tag..."
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        className="h-10 bg-white border-gray-200 text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                    <Button
                                        type="button"
                                        onClick={addTag}
                                        size="sm"
                                        variant="outline"
                                        className="h-10 px-3 border-gray-200 text-black hover:bg-gray-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                    <span className="flex items-center gap-2 text-sm font-medium text-gray-600"><User className="h-3 w-3 ml-2 text-muted-foreground flex-shrink-0" /> Name</span>
                                    <span className="text-sm font-semibold text-black">{lead.name}</span>
                                </div>

                                {lead.phone && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-600"><Phone className="h-3 w-3 ml-2 text-muted-foreground flex-shrink-0" /> Phone</span>
                                        <span className="text-sm font-mono text-black">{lead.phone}</span>
                                    </div>
                                )}

                                {lead.lastMessage && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-600"><MessageSquare className="h-3 w-3 ml-2 text-muted-foreground flex-shrink-0" /> Last Message</span>
                                        <span className="text-sm font-mono text-black overflow-hidden line-clamp-2">{lead.lastMessage}</span>
                                        <span className="text-sm font-mono text-black overflow-hidden line-clamp-2"><Clock className="h-2 w-2" /> {lead.lastMessageTime}</span>
                                    </div>
                                )}

                                {lead.notes && (
                                    <div className="flex items-center justify-between py-2 border-b border-gray-200">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-600"><NotebookTabs className="h-3 w-3 ml-2 text-muted-foreground flex-shrink-0" /> Notes</span>
                                        <span className="text-sm font-mono text-black overflow-hidden line-clamp-2">{lead.notes}</span>
                                    </div>
                                )}

                                
                                {lead.tags && lead.tags.length > 0 && (
                                    <div className="py-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2"><Tags className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0" /> Tags</div>
                                        <div className="flex flex-wrap gap-2">
                                            {lead.tags.map((tag:any) => (
                                                <Badge
                                                    key={tag.id}
                                                    variant="outline"
                                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                                >
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-3 pt-4">
                    {isEditing ? (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="h-11 px-6 border-gray-200 text-black hover:bg-gray-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleUpdate}
                                disabled={!formData.name?.trim()}
                                className="h-11 px-6 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDelete}
                                className="h-11 px-6 border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="h-11 px-6 bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Edit2 className="h-4 w-4 mr-2" />
                                Edit Lead
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
