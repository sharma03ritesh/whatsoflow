import { ButtonHTMLAttributes } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function PrimaryButton({
    className = '',
    disabled,
    loading = false,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                    (disabled || loading) && 'opacity-25'
                } ` + className
            }
            disabled={disabled || loading}
        >
            {loading && <LoadingSpinner size="sm" />}
            {children}
        </button>
    );
}
