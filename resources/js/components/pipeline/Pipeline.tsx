// resources/js/components/pipeline/Pipeline.tsx
import { useEffect, useState } from 'react';
import { Loader2, Plus, XCircle } from 'lucide-react';
import { PipelineSettings } from './PipelineSettings';
import { PipelineColumn } from './PipelineColumn';
import { pipelineService } from '@/services/pipelineService';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { Button } from '../ui/button';
import { toast } from 'react-hot-toast';

export function Pipeline() {
    const [columns, setColumns] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFirstTime, setIsFirstTime] = useState(false);

    const fetchColumns = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await pipelineService.getColumns();
            setColumns(data);
            if (data.length === 0) {
                setIsFirstTime(true);
            }
        } catch (err) {
            setError('Failed to load pipeline data');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchColumns();
    }, []);

    const handleColumnSaved = () => {
        fetchColumns();
        setIsFirstTime(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error loading pipeline
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                onClick={fetchColumns}
                                className="text-red-700 bg-red-100 hover:bg-red-200"
                            >
                                Try again
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isFirstTime || columns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pipeline columns yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Get started by creating your first column to organize your leads.
                </p>
                <div className="mt-6">
                    <PipelineSettings onSave={handleColumnSaved}>
                        <Button>
                            <Plus className="-ml-1 mr-2 h-5 w-5" />
                            Add Column
                        </Button>
                    </PipelineSettings>
                </div>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Sales Pipeline</h2>
                    <PipelineSettings onSave={handleColumnSaved} />
                </div>
                
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {columns.map((column) => (
                        <PipelineColumn
                            key={column.id}
                            column={column}
                            onLeadClick={(lead) => {
                                // Handle lead click
                                console.log('Lead clicked:', lead);
                            }}
                        />
                    ))}
                </div>
            </div>
        </ErrorBoundary>
    );
}