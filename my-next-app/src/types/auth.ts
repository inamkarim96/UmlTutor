export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  uid?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
}
