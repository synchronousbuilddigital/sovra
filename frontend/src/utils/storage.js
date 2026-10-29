/**
 * Safe localStorage utilities for user session storage.
 * Prevents corrupted or invalid JSON from throwing unhandled syntax errors
 * that can cause a white-screen crash.
 */

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw || raw === 'undefined' || raw === 'null') {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Corrupted userInfo in localStorage detected. Removing key to recover.', error);
    try {
      localStorage.removeItem('userInfo');
    } catch (_) {}
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (!user) {
      localStorage.removeItem('userInfo');
    } else {
      localStorage.setItem('userInfo', JSON.stringify(user));
    }
  } catch (error) {
    console.error('Failed to store user info in localStorage:', error);
  }
};

export const clearStoredUser = () => {
  try {
    localStorage.removeItem('userInfo');
  } catch (_) {}
};
