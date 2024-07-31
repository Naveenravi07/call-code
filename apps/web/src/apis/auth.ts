export async function loginWithGoogle() {
  window.location.href = 'http://localhost:8000/auth/google/login';
}

export async function loginWithGithub() {
  window.location.href = 'http://localhost:8000/auth/github/login';
}
