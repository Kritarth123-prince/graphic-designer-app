import api from './api';

export async function listAdmin() {
  const { data } = await api.get('/categories/admin');
  return data.categories;
}

export async function create(payload) {
  const { data } = await api.post('/categories/admin', payload);
  return data.category;
}

export async function update(id, payload) {
  const { data } = await api.put(`/categories/admin/${id}`, payload);
  return data.category;
}

export async function remove(id) {
  const { data } = await api.delete(`/categories/admin/${id}`);
  return data;
}

export async function reorder(order) {
  const { data } = await api.put('/categories/admin/reorder', { order });
  return data.categories;
}
