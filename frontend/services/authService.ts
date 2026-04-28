import { User } from '../types';

const STORAGE_KEY = 'cocospice_users';
const SESSION_KEY = 'cocospice_session';

// Helper to get stored users
const getStoredUsers = (): (User & { password: string })[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper to save users
const saveUsers = (users: (User & { password: string })[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Get currently logged-in user from session
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

// Sign up a new user
export const signUp = async (
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800));

  const users = getStoredUsers();
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const newUser: User & { password: string } = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password,
    phone,
  };

  users.push(newUser);
  saveUsers(users);

  // Auto-login after signup
  const { password: _, ...sessionUser } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return { success: true, user: sessionUser };
};

// Log in an existing user
export const logIn = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  await new Promise((r) => setTimeout(r, 800));

  const users = getStoredUsers();
  const found = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!found) {
    return { success: false, error: 'Invalid email or password' };
  }

  const { password: _, ...sessionUser } = found;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return { success: true, user: sessionUser };
};

// Log out
export const logOut = (): void => {
  localStorage.removeItem(SESSION_KEY);
};
