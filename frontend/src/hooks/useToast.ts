import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const useToast = () => {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        setToast({ message, type });
    }, []);

    const closeToast = useCallback(() => setToast(null), []);

    return { toast, showToast, closeToast };
};