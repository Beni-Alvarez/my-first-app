import ui from './ui.module.css';

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const message = error instanceof Error ? error.message : 'Something went wrong.';

  return (
    <div role="alert" className={ui.alert}>
      <p>{message}</p>
      {onRetry && (
        <p>
          <button type="button" className={ui.button} onClick={onRetry}>
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
