import api from './api';

export async function listAdmin() {
  const { data } = await api.get('/portfolio/admin/all');
  return data.projects;
}

export async function getById(id) {
  const { data } = await api.get(`/portfolio/admin/${id}`);
  return data.project;
}

export async function create(payload) {
  const { data } = await api.post('/portfolio/admin', payload);
  return data.project;
}

export async function update(id, payload) {
  const { data } = await api.put(`/portfolio/admin/${id}`, payload);
  return data.project;
}

export async function remove(id) {
  const { data } = await api.delete(`/portfolio/admin/${id}`);
  return data;
}

export async function publish(id) {
  const { data } = await api.put(`/portfolio/admin/${id}/publish`);
  return data.project;
}

export async function unpublish(id) {
  const { data } = await api.put(`/portfolio/admin/${id}/unpublish`);
  return data.project;
}

export async function addImages(id, files) {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('images', f));
  const { data } = await api.post(`/portfolio/admin/${id}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.project;
}

export async function removeImage(id, imageId) {
  const { data } = await api.delete(`/portfolio/admin/${id}/images/${imageId}`);
  return data.project;
}
