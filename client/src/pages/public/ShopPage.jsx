import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/products.service';
import { getCategories } from '../../services/categories.service';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  useDocumentMeta({
    title: 'Shop the Collection',
    description: 'Curated digital designs, ready to license and use — each one a limited, original piece.',
    path: '/shop',
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(search);
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getProducts({ q: debouncedSearch || undefined, category: category || undefined, sort, page })
      .then((data) => {
        setProducts(data.products);
        setMeta({ page: data.page, pages: data.pages, total: data.total });
      })
      .catch(() => setError('Something went wrong. Please try again.'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, sort, page]);

  function updateParams(patch) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!('page' in patch)) next.delete('page'); // any filter change resets pagination
    setSearchParams(next);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="font-serif text-4xl md:text-5xl">Collection</h1>
        <p className="mt-4 text-ink/60">
          Curated digital designs, ready to license and use — each one a limited, original piece.
        </p>
      </div>

      <ProductFilters
        categories={categories}
        activeCategory={category}
        onCategoryChange={(slug) => updateParams({ category: slug })}
        sort={sort}
        onSortChange={(value) => updateParams({ sort: value })}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          updateParams({ q: value });
        }}
      />

      <div className="mt-12">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <EmptyState title="Something went wrong." message="Please try again in a moment." />
        )}

        {!loading && !error && products.length === 0 && (
          <EmptyState
            title="No designs found."
            message="Try a different search term or browse all categories."
          />
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <ProductGrid products={products} />
            <Pagination page={meta.page} pages={meta.pages} onChange={(p) => updateParams({ page: p })} />
          </>
        )}
      </div>
    </div>
  );
}
