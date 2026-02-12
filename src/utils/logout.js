// Simple logout utility: clears localStorage/sessionStorage and redirects to login
export function logout() {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/'; // Adjust if your login route is different
}
