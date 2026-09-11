import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductBySlug } from '../../services/products.service';
import { createOrder } from '../../services/orders.service';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { buildWhatsAppOrderUrl } from '../../utils/whatsapp';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import ProductGallery from '../../components/product/ProductGallery';
import OrderDetailsModal from '../../components/product/OrderDetailsModal';
import UpiPaymentDetails from '../../components/product/UpiPaymentDetails';
import EmptyState from '../../components/common/EmptyState';

export default function ProductPage() {
  const { slug } = useParams();
  const { settings } = useSiteSettings();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getProductBySlug(slug)
      .then(setProduct)
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const whatsappReady = Boolean(settings.whatsappNumber);

  useDocumentMeta({
    title: product ? product.seo?.title || `${product.title} — ${settings.designerName || 'Studio'}` : undefined,
    description: product?.seo?.metaDescription || product?.shortDescription || product?.description,
    image: product?.seo?.ogImage || product?.thumbnail,
    path: product ? `/shop/${product.slug}` : undefined,
    structuredData: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.shortDescription || product.description,
          image: product.previewImages?.map((img) => img.url),
          sku: product.productId,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency || 'INR',
            availability: 'https://schema.org/InStock',
            url: `${window.location.origin}/shop/${product.slug}`,
          },
        }
      : undefined,
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 animate-pulse">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-ink/5" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-ink/10" />
            <div className="h-4 w-1/3 bg-ink/5" />
            <div className="h-24 w-full bg-ink/5" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-16">
        <EmptyState
          title="This design couldn't be found."
          message="It may have been unpublished or the link may be incorrect."
        />
        <div className="text-center">
          <Link to="/shop" className="text-sm border-b border-gold pb-0.5">
            Back to the collection
          </Link>
        </div>
      </div>
    );
  }

  // The customer's own contact details are collected in the modal (see
  // OrderDetailsModal) right before this fires — this is what actually
  // populates Order.customerName/Email/Phone, instead of leaving them
  // blank for the admin to fill in from scratch after the fact.
  async function handleConfirmOrder({ customerName, customerEmail, customerPhone }) {
    setOrdering(true);

    let orderId;
    try {
      const order = await createOrder({ productId: product._id, customerName, customerEmail, customerPhone });
      orderId = order.orderId;
    } catch {
      // Order tracking is a nice-to-have here — the customer's ability to
      // actually reach WhatsApp and buy must never depend on it.
    }

    const url = buildWhatsAppOrderUrl({
      whatsappNumber: settings.whatsappNumber,
      product,
      orderId,
      customerName,
    });
    setOrdering(false);
    setModalOpen(false);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-16">
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <ProductGallery images={product.previewImages} title={product.title} />

        <div className="md:sticky md:top-28 self-start">
          <p className="text-xs text-ink/40">{product.category?.name}</p>
          <h1 className="font-serif text-3xl md:text-4xl mt-2">{product.title}</h1>

          <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-xl">
              {product.currency || 'INR'} {product.price}
            </span>
            <span className="font-mono text-xs text-ink/40">{product.productId}</span>
          </div>

          <p className="mt-6 text-ink/70 leading-relaxed max-w-md">{product.description}</p>

          <dl className="mt-8 space-y-2 text-sm">
            {product.dimensions && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-ink/10 py-2 max-w-md">
                <dt className="text-ink/40">Dimensions</dt>
                <dd>{product.dimensions}</dd>
              </div>
            )}
            {product.format && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-ink/10 py-2 max-w-md">
                <dt className="text-ink/40">File format</dt>
                <dd>{product.format}</dd>
              </div>
            )}
            {product.includedFiles?.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-ink/10 py-2 max-w-md">
                <dt className="text-ink/40">Included files</dt>
                <dd className="sm:text-right">{product.includedFiles.join(', ')}</dd>
              </div>
            )}
          </dl>

          <div className="mt-10 max-w-md">
            {whatsappReady ? (
              <button
                onClick={() => setModalOpen(true)}
                className="block w-full text-center bg-ink text-ivory py-4 text-sm tracking-wide hover:bg-charcoal transition-colors"
              >
                Order via WhatsApp
              </button>
            ) : (
              <p className="text-sm text-ink/40 border border-ink/10 py-4 text-center">
                Ordering is temporarily unavailable — please check back shortly.
              </p>
            )}
            <p className="mt-3 text-xs text-ink/40 text-center">
              Manual UPI payment · Payment verified personally
            </p>

            <UpiPaymentDetails upi={settings.upi} />
          </div>

          <p className="mt-6 text-xs text-ink/40 max-w-md leading-relaxed">
            Preview artwork may contain a watermark. Final files are delivered after payment
            verification.
          </p>
        </div>
      </div>

      <OrderDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleConfirmOrder}
        submitting={ordering}
      />
    </div>
  );
}
