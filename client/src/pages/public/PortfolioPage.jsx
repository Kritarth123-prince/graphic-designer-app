import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolio } from '../../services/portfolio.service';
import EmptyState from '../../components/common/EmptyState';
import { noSaveImageProps } from '../../utils/imageProtection';

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPortfolio()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="font-serif text-4xl md:text-5xl">Portfolio</h1>
        <p className="mt-4 text-ink/60">Selected work — brand identities, campaigns, and visual systems.</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-16 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/3] bg-ink/5" />
              <div className="mt-4 h-4 w-1/2 bg-ink/10" />
            </div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <EmptyState title="No portfolio projects yet." message="Check back soon." />
      )}

      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-16">
          {projects.map((project) => (
            <Link key={project._id} to={`/portfolio/${project.slug}`} className="group block">
              <div className="aspect-[4/3] bg-charcoal overflow-hidden">
                {project.images?.[0] ? (
                  <img
                    src={project.images[0].url}
                    alt={project.images[0].alt || project.title}
                    loading="lazy"
                    {...noSaveImageProps}
                    className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${noSaveImageProps.className}`}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-ivory/30 font-serif text-sm">
                    No preview yet
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="font-serif text-xl">{project.title}</h3>
                <p className="text-sm text-ink/50 mt-1">
                  {[project.client, project.year].filter(Boolean).join(' · ')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
