import instance from '@/axios/axios.config';

export async function loginWithGoogle() {
  window.location.href = 'http://localhost:8000/auth/google/login';
}

export async function loginWithGithub() {
  window.location.href = 'http://localhost:8000/auth/github/login';
}

export async function getUserData() {
  const { data } = await instance.get('/auth/me');
  return data;
}

export async function logoutUser() {
  const data = await instance.post('/auth/logout');
  return data;
}
