import api from './api';

export async function listAdmin(params = {}) {
  const { data } = await api.get('/orders/admin/all', { params });
  return data; // { orders, total, page, pages }
}

export async function getById(id) {
  const { data } = await api.get(`/orders/admin/${id}`);
  return data.order;
}

export async function update(id, payload) {
  const { data } = await api.put(`/orders/admin/${id}`, payload);
  return data.order;
}

export async function updateStatus(id, status, notes) {
  const { data } = await api.put(`/orders/admin/${id}/status`, { status, notes });
  return data.order;
}
