import api from './api';

export async function getProducts(params = {}) {
  const { data } = await api.get('/products', { params });
  return data; // { success, products, total, page, pages }
}

export async function getProductBySlug(slug) {
  const { data } = await api.get(`/products/${slug}`);
  return data.product;
}
