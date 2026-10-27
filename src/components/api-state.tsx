export function LoadingState({ label = "Memuat data..." }: { label?: string }) {
  return <p className="api-state" role="status">{label}</p>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <section className="api-state api-state-error" role="alert">
      <p>{message}</p>
      {onRetry ? <button className="button button-outline" type="button" onClick={onRetry}>Coba lagi</button> : null}
    </section>
  );
}
