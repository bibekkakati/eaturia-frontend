/** Decode a JWT payload without verifying the signature */
export const decodeJwt = (token: string): Record<string, any> | null => {
  try {
    const base64 = token.split('.')[1]
      .replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

export type UserRole = 'RESTAURANT_ADMIN' | 'SUPER_ADMIN' | null;

/** Read the userType from the token stored in localStorage */
export const getStoredUserRole = (): UserRole => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodeJwt(token);
  const type = (payload?.type || '').toString().toUpperCase();
  if (type === 'RESTAURANT_ADMIN') return 'RESTAURANT_ADMIN';
  if (type === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  return null;
};

/** Return the correct dashboard path for a given role */
export const getDashboardForRole = (role: UserRole): string => {
  return role === 'RESTAURANT_ADMIN' ? '/admin' : '/super-admin';
};
