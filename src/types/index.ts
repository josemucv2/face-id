export interface BiometricType {
  available: boolean;
  biometryType: 'TouchID' | 'FaceID' | 'Biometrics' | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
