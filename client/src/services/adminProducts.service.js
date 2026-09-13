import api from './api';
import { downloadFile } from '../utils/download';

export async function listAdmin(params = {}) {
  const { data } = await api.get('/products/admin/all', { params });
  return data; // { products, total, page, pages }
}

export async function getById(id) {
  const { data } = await api.get(`/products/admin/${id}`);
  return data.product;
}

export async function create(payload) {
  const { data } = await api.post('/products/admin', payload);
  return data.product;
}

export async function update(id, payload) {
  const { data } = await api.put(`/products/admin/${id}`, payload);
  return data.product;
}

export async function remove(id) {
  const { data } = await api.delete(`/products/admin/${id}`);
  return data;
}

export async function publish(id) {
  const { data } = await api.put(`/products/admin/${id}/publish`);
  return data.product;
}

export async function unpublish(id) {
  const { data } = await api.put(`/products/admin/${id}/unpublish`);
  return data.product;
}

export async function archive(id) {
  const { data } = await api.put(`/products/admin/${id}/archive`);
  return data.product;
}

export async function uploadPreviewImages(id, files, onProgress) {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append('images', f));
  const { data } = await api.post(`/products/admin/${id}/preview-images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      : undefined,
  });
  return data.product;
}

export async function removePreviewImage(id, imageId) {
  const { data } = await api.delete(`/products/admin/${id}/preview-images/${imageId}`);
  return data.product;
}

export async function uploadOriginalFile(id, file, onProgress) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/products/admin/${id}/file`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || 1)))
      : undefined,
  });
  return data.file;
}

export async function downloadOriginalFile(id, filename) {
  await downloadFile(`/products/admin/${id}/file`, filename);
}
