import instance from '@/axios/axios.config';
import { User } from '@/types/user';

export function loginWithGoogle(): void {
  window.location.href = 'http://localhost:8000/auth/google/login';
}

export function loginWithGithub(): void {
  window.location.href = 'http://localhost:8000/auth/github/login';
}

export async function getUserData(): Promise<User> {
  const { data } = await instance.get<User>('/auth/me');
  return data;
}

export async function logoutUser(): Promise<unknown> {
  const data = await instance.post('/auth/logout');
  return data;
}
