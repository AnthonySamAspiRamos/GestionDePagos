import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
    duration?: number;
}

const Toast = ({ message, type, onClose, duration = 4000 }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const config = {
        success: { bg: 'bg-green-500', icon: '✓' },
        error: { bg: 'bg-red-500', icon: '✕' },
        info: { bg: 'bg-blue-500', icon: 'ℹ' },
        warning: { bg: 'bg-yellow-500', icon: '⚠' },
    }[type];

    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-3 ${config.bg} text-white px-5 py-3 rounded-xl shadow-2xl animate-slide-in`}>
            <span className="text-xl font-bold">{config.icon}</span>
            <p className="font-medium">{message}</p>
            <button onClick={onClose} className="ml-2 text-white/80 hover:text-white text-xl leading-none">×</button>
        </div>
    );
};

export default Toast;