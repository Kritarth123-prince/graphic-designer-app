import api from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.admin;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data.admin;
}
