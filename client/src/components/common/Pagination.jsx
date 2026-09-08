export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-16 text-sm">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="disabled:opacity-30 hover:text-gold transition-colors"
      >
        Previous
      </button>
      <span className="text-ink/40">
        {page} / {pages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="disabled:opacity-30 hover:text-gold transition-colors"
      >
        Next
      </button>
    </div>
  );
}
