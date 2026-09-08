export default function ProsePage({ title, updated, children }) {
  return (
    <div className="mx-auto max-w-2xl px-6 md:px-10 py-16">
      <h1 className="font-serif text-4xl">{title}</h1>
      {updated && <p className="mt-2 text-xs text-ink/40">Last updated: {updated}</p>}
      <div className="mt-10 space-y-6 text-sm text-ink/70 leading-relaxed [&_h2]:font-serif [&_h2]:text-lg [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-2">
        {children}
      </div>
    </div>
  );
}
