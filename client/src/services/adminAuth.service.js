import api, { setAuthToken } from './api';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  setAuthToken(data.token);
  return data.admin;
}

export async function logout() {
  try {
    await api.post('/auth/logout');
  } finally {
    setAuthToken(null);
  }
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data.admin;
}
