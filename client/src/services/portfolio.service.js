import api from './api';

export async function getPortfolio() {
  const { data } = await api.get('/portfolio');
  return data.projects;
}

export async function getPortfolioBySlug(slug) {
  const { data } = await api.get(`/portfolio/${slug}`);
  return data.project;
}
