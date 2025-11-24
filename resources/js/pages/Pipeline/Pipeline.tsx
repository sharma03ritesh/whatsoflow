import { Head } from '@inertiajs/react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Pipeline as PipelineComponent } from '@/components/pipeline/Pipeline';

const Pipeline = () => {
    return (
        <AppSidebarLayout>
            <Head title="Sales Pipeline" />
            <div className="container mx-auto py-6 px-4">
                <PipelineComponent />
            </div>
        </AppSidebarLayout>
    );
};

export default Pipeline;
