import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPortfolioBySlug } from '../../services/portfolio.service';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import EmptyState from '../../components/common/EmptyState';
import { noSaveImageProps } from '../../utils/imageProtection';

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div className="grid md:grid-cols-4 gap-6 py-10 border-t border-ink/10">
      <h2 className="font-serif text-xl md:col-span-1">{title}</h2>
      <p className="md:col-span-3 text-ink/70 leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}

export default function PortfolioCaseStudyPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getPortfolioBySlug(slug)
      .then(setProject)
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const [hero, ...rest] = project?.images || [];

  useDocumentMeta({
    title: project ? project.seo?.title || project.title : undefined,
    description: project?.seo?.metaDescription || project?.brief || project?.description,
    image: project?.seo?.ogImage || hero?.url,
    path: project ? `/portfolio/${project.slug}` : undefined,
  });

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-24 text-center text-ink/40">Loading…</div>;
  }

  if (notFound || !project) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16">
        <EmptyState title="This project couldn't be found." />
        <div className="text-center">
          <Link to="/portfolio" className="text-sm border-b border-gold pb-0.5">
            Back to Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[16/9] bg-charcoal">
        {hero ? (
          <img
            src={hero.url}
            alt={hero.alt || project.title}
            {...noSaveImageProps}
            className={`h-full w-full object-cover ${noSaveImageProps.className}`}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-ivory/30 font-serif">
            No preview yet
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-6 md:px-10 py-16">
        <p className="text-xs text-ink/40">{[project.client, project.year].filter(Boolean).join(' · ')}</p>
        <h1 className="font-serif text-4xl md:text-5xl mt-2">{project.title}</h1>

        <Section title="Brief">{project.brief}</Section>
        <Section title="Creative Direction">{project.creativeDirection}</Section>
        <Section title="Process">{project.process}</Section>
        <Section title="Final Result">{project.finalResult}</Section>

        {rest.length > 0 && (
          <div className="mt-10 grid gap-6">
            {rest.map((img) => (
              <img
                key={img._id}
                src={img.url}
                alt={img.alt || project.title}
                loading="lazy"
                {...noSaveImageProps}
                className={`w-full object-cover ${noSaveImageProps.className}`}
              />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link to="/portfolio" className="text-sm border-b border-gold pb-0.5">
            Back to Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
