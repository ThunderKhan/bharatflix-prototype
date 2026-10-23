/** Save/error banner shown at the top of a studio screen after a mutation. */
export function Notice({ saved, error }: { saved?: string; error?: string }) {
  if (error) return <p className="studio-error" role="alert">{error}</p>;
  if (saved) return <p className="studio-notice" role="status">{saved}</p>;
  return null;
}
