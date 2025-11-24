import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';
import { type Lead } from './LeadCard';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export interface PipelineColumn {
    id: string | number;
    title: string;
    color?: string;
    bg_color?: string;
    text_color?: string;
    leads: Lead[];
}
interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddLead: (lead: Omit<Lead, 'id'>) => void;
    columns: PipelineColumn[];
}

interface FormData {
    name: string;
    phone: string;
    stage?: number;
    tags: string[];
    notes: string;
    email: string;
    lastMessage: string;
}

interface FormErrors {
    name?: string;
    phone?: string;
    stage?: string;
    tags?: string;
    notes?: string;
}


export function AddLeadModal({ isOpen, onClose, onAddLead, columns }: AddLeadModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        phone: '',
        stage: undefined,
        tags: [] as string[],
        notes: '',
        email: '',
        lastMessage: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newTag, setNewTag] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Name validation (required, max 255 chars)
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length > 255) {
            newErrors.name = 'Name must be less than 255 characters';
        }

        // Phone validation (required, max 20 chars, unique)
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.length > 20) {
            newErrors.phone = 'Phone number must be less than 20 characters';
        } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Stage validation (required, must be 1-5)
        if (!formData.stage || formData.stage < 1) {
            newErrors.stage = 'Stage is required and must be valid';
        }

        // Notes validation (optional, max 65535 chars)
        if (formData.notes && formData.notes.length > 65535) {
            newErrors.notes = 'Notes must be less than 65535 characters';
        }

        // Tags validation (required, max 50 chars per tag, at least one tag required)
        if (formData.tags.length === 0) {
            newErrors.tags = 'At least one tag is required';
        } else if (formData.tags.some(tag => tag.length > 50)) {
            newErrors.tags = 'Each tag must be less than 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Double check in case the columns were removed after the modal was opened
        if (columns.length === 0) {
            setErrors({ ...errors, stage: 'No stages available. Please create a stage first.' });
            return;
        }
        
        if (!validateForm()) return;
        try {
            setIsSubmitting(true);
            // Call the parent's onAddLead function and wait for it to complete
            await onAddLead(formData);

            // Only reset form and close modal if onAddLead was successful
            setFormData({
                name: '',
                phone: '',
                stage: 1,
                tags: [],
                notes: '',
                email: '',
                lastMessage: ''
            });
            onClose();
        } catch (error) {
            console.error('Error adding lead:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] bg-white rounded-xl shadow-lg overflow-y-auto">
            {isSubmitting && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Adding lead...</p>
                        </div>
                    </div>
                )}
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-semibold text-black">
                        Add New Lead
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Create a new lead and add it to your pipeline.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-black">Name *</Label>
                            <Input
                                id="name"
                                placeholder="Enter lead name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`h-11 bg-white text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                required
                            />
                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-medium text-black">Phone *</Label>
                                <PhoneInput
                                    country={'in'}
                                    value={formData.phone}
                                    onChange={(value) => handleInputChange('phone', value)}
                                    inputClass={`!w-full !h-11 !text-sm bg-white text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${errors.phone ? '!border-red-500' : '!border-gray-200'}`}
                                    buttonClass="!bg-gray-200"
                                    containerClass="mt-1"
                                    dropdownClass="!text-black"
                                    placeholder="Enter phone number"
                                    enableSearch={true}
                                    searchPlaceholder="Search country..."
                                    disableSearchIcon={true}
                                />
                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stage" className="text-sm font-medium text-black">Stage *</Label>
                                <Select
                                    value={formData.stage ? formData.stage.toString() : ''}
                                    onValueChange={(value) => handleInputChange('stage', value)}
                                >
                                    <SelectTrigger
                                        className={`h-11 bg-white text-black border ${errors.stage ? 'border-red-500' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                                    > 
                                        <SelectValue placeholder="Select stage" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                                        {columns.map((column) => (
                                            <SelectItem 
                                                key={column.id} 
                                                value={column.id.toString()} 
                                                className="hover:bg-gray-200 cursor-pointer"
                                            >
                                                {column.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.stage && <p className="text-sm text-red-500">{errors.stage}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes" className="text-sm font-medium text-black">Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Add notes about this lead..."
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className={`min-h-[80px] bg-white text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none ${errors.notes ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-black">Tags</Label>
                            <div className="flex flex-wrap gap-2 min-h-[32px] p-2 rounded-lg border border-gray-200 bg-white">
                                {formData.tags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 text-blue-500 hover:text-blue-700"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
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

                    <DialogFooter className="gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="h-11 px-6 border-gray-200 text-black hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formData.name.trim() || !formData.phone.trim() || formData.tags.length === 0}
                            className="h-11 px-6 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                               {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Lead
                                    </>
                                )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
