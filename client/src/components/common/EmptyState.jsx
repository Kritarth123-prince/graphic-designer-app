export default function EmptyState({ title, message }) {
  return (
    <div className="text-center py-24">
      <p className="font-serif text-2xl">{title}</p>
      {message && <p className="mt-3 text-sm text-ink/50">{message}</p>}
    </div>
  );
}
