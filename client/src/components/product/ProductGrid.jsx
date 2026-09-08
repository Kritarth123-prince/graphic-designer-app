import ProductCard from './ProductCard';

// Uniform grid — no per-item column-spanning. A "featured item gets 2x
// width" treatment looked fine with a full catalog but produced a badly
// unbalanced layout with only one or two products, which is exactly
// what a new catalog looks like. Featured items still stand out via
// sort order (see ProductFilters' "Featured" option) instead.
export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
