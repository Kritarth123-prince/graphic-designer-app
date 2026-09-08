import api from './api';

export async function listAdmin(params = {}) {
  const { data } = await api.get('/custom-design/admin/all', { params });
  return data; // { requests, total, page, pages }
}

export async function getById(id) {
  const { data } = await api.get(`/custom-design/admin/${id}`);
  return data.request;
}

export async function updateStatus(id, status) {
  const { data } = await api.put(`/custom-design/admin/${id}/status`, { status });
  return data.request;
}

export async function remove(id) {
  const { data } = await api.delete(`/custom-design/admin/${id}`);
  return data;
}

export function referenceFileDownloadUrl(id) {
  return `${api.defaults.baseURL}/custom-design/admin/${id}/reference-file`;
}
