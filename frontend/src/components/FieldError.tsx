interface FieldErrorProps {
    error?: string;
    touched?: boolean;
}

const FieldError = ({ error, touched = true }: FieldErrorProps) => {
    const mostrar = Boolean(error && touched);

    return (
        <p
            className={`
                text-red-500 text-xs font-medium
                mt-1 min-h-[16px]
                transition-opacity duration-150
                ${mostrar ? 'opacity-100' : 'opacity-0'}
            `}
            aria-live="polite"
        >
            {mostrar ? error : '\u00A0'}
        </p>
    );
};

export default FieldError;