import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import {
  Check,
  Edit,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { pipelineService } from '@/services/pipelineService';
import { type Lead } from './LeadCard';

interface PipelineColumn {
  id?: string;
  name: string;
  color: string;
  bg_color: string;
  text_color: string;
  order: number;
  is_active: boolean;
  leads?: Lead[];
}

interface PipelineSettingsProps {
  onSave?: () => void;
  children?: React.ReactNode;
}

type FormMode = 'none' | 'create' | 'edit';

interface ColumnFormValues {
  name: string;
  color: string;
  bg_color: string;
  text_color: string;
}

export function PipelineSettings({ onSave, children }: PipelineSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [columns, setColumns] = useState<PipelineColumn[]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [formMode, setFormMode] = useState<FormMode>('none');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ColumnFormValues>({
    name: '',
    color: '#3b82f6',
    bg_color: 'bg-blue-100',
    text_color: 'text-blue-800',
  });

  const [isFetching, setIsFetching] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    column: PipelineColumn | null;
  }>({
    isOpen: false,
    column: null,
  });

  const colorOptions: ColumnFormValues[] = [
    { name: 'Blue', color: '#3b82f6', bg_color: 'bg-blue-100', text_color: 'text-blue-800' },
    { name: 'Green', color: '#10b981', bg_color: 'bg-green-100', text_color: 'text-green-800' },
    { name: 'Purple', color: '#8b5cf6', bg_color: 'bg-purple-100', text_color: 'text-purple-800' },
    { name: 'Red', color: '#ef4444', bg_color: 'bg-red-100', text_color: 'text-red-800' },
    { name: 'Yellow', color: '#f59e0b', bg_color: 'bg-yellow-100', text_color: 'text-yellow-800' },
    { name: 'Pink', color: '#ec4899', bg_color: 'bg-pink-100', text_color: 'text-pink-800' },
  ];

  const defaultFormValues: ColumnFormValues = {
    name: '',
    color: '#3b82f6',
    bg_color: 'bg-blue-100',
    text_color: 'text-blue-800',
  };

  // Fetch columns whenever modal is opened
  useEffect(() => {
    if (!isOpen) return;

    const fetchColumns = async () => {
      setIsFetching(true);
      try {
        const data = await pipelineService.getColumns();
        setColumns(data || []);
        setHasLoadedOnce(true);
      } catch (error) {
        console.error('Failed to fetch pipeline columns:', error);
        toast.error('Failed to load pipeline columns');
        setColumns([]);
        setHasLoadedOnce(true);
      } finally {
        setIsFetching(false);
      }
    };

    fetchColumns();
  }, [isOpen]);

  const resetForm = () => {
    setFormData(defaultFormValues);
    setFormMode('none');
    setEditingIndex(null);
  };

  const startCreate = () => {
    setFormMode('create');
    setEditingIndex(null);
    setFormData(defaultFormValues);
  };

  const startEdit = (index: number) => {
    const column = columns[index];
    setFormMode('edit');
    setEditingIndex(index);
    setFormData({
      name: column.name,
      color: column.color,
      bg_color: column.bg_color,
      text_color: column.text_color,
    });
  };

  const updateFormData = (field: keyof ColumnFormValues, value: string) => {
    setFormData(prev => {
      if (field === 'color') {
        const colorOption = colorOptions.find(c => c.color === value);
        if (colorOption) {
          return {
            ...prev,
            color: value,
            bg_color: colorOption.bg_color,
            text_color: colorOption.text_color,
          };
        }

        // Custom color: keep color but fallback to default bg/text
        return {
          ...prev,
          color: value,
          bg_color: prev.bg_color ?? 'bg-blue-100',
          text_color: prev.text_color ?? 'text-blue-800',
        };
      }

      return { ...prev, [field]: value };
    });
  };

  const handleSubmitColumn = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a column name');
      return;
    }

    try {
      setIsFormSubmitting(true);

      if (formMode === 'edit' && editingIndex !== null) {
        // Local update; persisted on "Save Changes"
        setColumns(prev =>
          prev.map((col, idx) =>
            idx === editingIndex
              ? {
                  ...col,
                  name: formData.name,
                  color: formData.color,
                  bg_color: formData.bg_color,
                  text_color: formData.text_color,
                }
              : col,
          ),
        );

        toast.success('Column updated. Click "Save Changes" to apply.');
      } else if (formMode === 'create') {
        // Create immediately via API so it exists for the pipeline
        const newColumn: PipelineColumn = {
          name: formData.name.trim(),
          color: formData.color,
          bg_color: formData.bg_color,
          text_color: formData.text_color,
          order: columns.length,
          is_active: true,
        };

        const savedColumn = await pipelineService.createColumn(newColumn);
        setColumns(prev => [...prev, savedColumn]);
        toast.success('Column added successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving column:', error);
      toast.error('Failed to save column');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const openDeleteConfirm = (column: PipelineColumn) => {
    setDeleteConfirm({
      isOpen: true,
      column,
    });
  };

  const handleConfirmDelete = async () => {
    const column = deleteConfirm.column;
    if (!column) return;

    const leadCount = column.leads?.length || 0;
    const tagCount =
      column.leads?.reduce((total, lead) => total + (lead.tags?.length || 0), 0) || 0;

    try {
      setIsDeleting(true);

      if (column.id) {
        await pipelineService.deleteColumn(column.id);
      }

      setColumns(prev => prev.filter(col => col.id !== column.id));

      // If we were editing this one, reset form
      if (
        formMode === 'edit' &&
        editingIndex !== null &&
        columns[editingIndex]?.id === column.id
      ) {
        resetForm();
      }

      let message = 'Column deleted successfully';
      if (leadCount > 0) {
        message += `, along with ${leadCount} ${leadCount === 1 ? 'lead' : 'leads'}`;
        if (tagCount > 0) {
          message += ` and ${tagCount} associated ${tagCount === 1 ? 'tag' : 'tags'}`;
        }
      }

      toast.success(message);
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Failed to delete column');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm({ isOpen: false, column: null });
    }
  };

  const saveColumns = async () => {
    if (columns.length === 0) {
      toast.error('Please add at least one column');
      return;
    }

    setIsSavingAll(true);
    try {
      const updatePromises = columns.map((column, index) => {
        const payload: PipelineColumn = {
          ...column,
          order: index,
          is_active: column.is_active ?? true,
        };

        if (column.id) {
          return pipelineService.updateColumn(column.id, payload);
        }

        return pipelineService.createColumn(payload);
      });

      await Promise.all(updatePromises);

      const ids = columns.map(c => c.id!).filter(Boolean);
      if (ids.length) {
        await pipelineService.reorderColumns(ids);
      }

      toast.success('Pipeline columns saved successfully');
      setIsOpen(false);
      resetForm();

      if (onSave) onSave();
    } catch (error) {
      console.error('Failed to save pipeline columns:', error);
      toast.error('Failed to save pipeline columns');
    } finally {
      setIsSavingAll(false);
    }
  };

  const DeleteConfirmationDialog = () => {
    const column = deleteConfirm.column;
    const leadCount = column?.leads?.length || 0;
    const tagCount =
      column?.leads?.reduce((total, lead) => total + (lead.tags?.length || 0), 0) || 0;

    return (
      <Dialog
        open={deleteConfirm.isOpen}
        onOpenChange={open => !open && setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-700">
              Delete Column
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-gray-600">
              Are you sure you want to delete the column{' '}
              <span className="font-semibold">&quot;{column?.name}&quot;</span>?
            </p>
            {leadCount > 0 && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">This will permanently delete:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm text-red-700">
                      <li>
                        {leadCount} {leadCount === 1 ? 'lead' : 'leads'} in this column
                      </li>
                      {tagCount > 0 && (
                        <li>
                          {tagCount} associated {tagCount === 1 ? 'tag' : 'tags'}
                        </li>
                      )}
                    </ul>
                    <p className="mt-2 text-sm font-medium text-red-700">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="text-white border-red-600 bg-red-500 hover:bg-red-600"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const renderForm = () => {
    if (formMode === 'none') return null;

    const isEditing = formMode === 'edit';

    return (
      <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-end gap-4">
          <div className="w-4flex-1 space-y-2">
            <Label htmlFor="column-name" className="text-sm font-medium text-gray-700">
              Column Name
            </Label>
            <Input
              id="column-name"
              placeholder="e.g. New Lead, Contacted, Won..."
              value={formData.name}
              onChange={e => updateFormData('name', e.target.value)}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="w-48 space-y-2">
            <Label className="text-sm font-medium text-gray-700 block">Color</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal border-gray-300',
                    !formData.color && 'text-gray-500',
                  )}
                >
                  <div className="flex items-center w-full justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                        style={{ backgroundColor: formData.color }}
                      />
                      {
                        colorOptions.find(c => c.color === formData.color)?.name ||
                        'Custom'
                      }
                    </div>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {colorOptions.map(color => (
                    <button
                      key={color.color}
                      type="button"
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2"
                      style={{
                        backgroundColor: color.color,
                        borderColor:
                          formData.color === color.color ? color.color : 'transparent',
                      }}
                      onClick={() => updateFormData('color', color.color)}
                    >
                      {formData.color === color.color && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Custom Color
                  </Label>
                  <HexColorPicker
                    color={formData.color}
                    onChange={color => updateFormData('color', color)}
                    className="w-full"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="button"
            onClick={handleSubmitColumn}
            disabled={!formData.name.trim() || isFormSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isFormSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isEditing ? (
              <Save className="h-4 w-4 mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            {isFormSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Column'
              : 'Add Column'}
          </Button>
        </div>

        {isEditing && (
          <div className="text-xs sm:text-sm text-gray-500 flex items-center">
            <span>Editing column. </span>
            <button
              type="button"
              onClick={resetForm}
              className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => {
        setIsOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm" className="h-8">
              <Settings className="h-4 w-4 mr-2" />
              Pipeline Settings
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-2xl bg-white text-gray-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Pipeline Columns
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Form area */}
            {renderForm()}

            {/* Empty state */}
            {!isFetching &&
              hasLoadedOnce &&
              columns.length === 0 &&
              formMode === 'none' && (
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No pipeline columns yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first column to start organizing your leads.
                  </p>
                  <Button
                    type="button"
                    onClick={startCreate}
                    className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Column
                  </Button>
                </div>
              )}

            {/* Add column button when there are existing columns and form is closed */}
            {columns.length > 0 && formMode === 'none' && (
              <Button
                type="button"
                onClick={startCreate}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            )}

            {/* Columns list */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Columns</h3>

              {isFetching && (
                <div className="flex items-center text-sm text-gray-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading columns...
                </div>
              )}

              {!isFetching && columns.length === 0 && hasLoadedOnce && formMode !== 'none' && (
                <p className="text-sm text-gray-500">
                  No columns yet. Add your first column above.
                </p>
              )}

              {!isFetching && columns.length > 0 && (
                <div className="space-y-2">
                  {columns.map((column, index) => (
                    <div
                      key={column.id ?? index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: column.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {column.name}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => startEdit(index)}
                          disabled={isSavingAll || isFormSubmitting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => openDeleteConfirm(column)}
                          disabled={isSavingAll || isFormSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSavingAll || isFormSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={saveColumns}
              disabled={
                isSavingAll ||
                isFormSubmitting ||
                isFetching ||
                columns.length === 0
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSavingAll && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isSavingAll ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog />
    </>
  );
}
