import api from './api';

export async function submitContact({ name, email, phone, subject, message, attachment }) {
  const form = new FormData();
  form.append('name', name);
  form.append('email', email);
  if (phone) form.append('phone', phone);
  form.append('subject', subject);
  form.append('message', message);
  if (attachment) form.append('attachment', attachment);

  const { data } = await api.post('/contact', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
