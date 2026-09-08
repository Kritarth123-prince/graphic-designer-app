const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ProductFilters({
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-ink/10 pb-8">
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <button
          onClick={() => onCategoryChange('')}
          className={`text-sm pb-1 border-b ${
            activeCategory === '' ? 'border-gold text-ink' : 'border-transparent text-ink/50 hover:text-ink'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => onCategoryChange(cat.slug)}
            className={`text-sm pb-1 border-b ${
              activeCategory === cat.slug
                ? 'border-gold text-ink'
                : 'border-transparent text-ink/50 hover:text-ink'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search designs..."
          className="bg-transparent border-b border-ink/20 text-sm py-1 focus:border-gold outline-none placeholder:text-ink/30 w-40"
        />

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-transparent border-b border-ink/20 text-sm py-1 focus:border-gold outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
