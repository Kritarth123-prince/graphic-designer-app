import api from './api';
import { downloadFile } from '../utils/download';

export async function listAdmin(params = {}) {
  const { data } = await api.get('/contact/admin/all', { params });
  return data; // { inquiries, total, page, pages }
}

export async function getById(id) {
  const { data } = await api.get(`/contact/admin/${id}`);
  return data.inquiry;
}

export async function markRead(id) {
  const { data } = await api.put(`/contact/admin/${id}/read`);
  return data.inquiry;
}

export async function markUnread(id) {
  const { data } = await api.put(`/contact/admin/${id}/unread`);
  return data.inquiry;
}

export async function remove(id) {
  const { data } = await api.delete(`/contact/admin/${id}`);
  return data;
}

export async function downloadAttachment(id, filename) {
  await downloadFile(`/contact/admin/${id}/attachment`, filename);
}
