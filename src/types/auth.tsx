export type LoginCredentials = {
  email: string;
  password: string;
}

export type AuthProviderValue = {
  user: any,
  login: (credentials: LoginCredentials) => void;
  logout: () => void
}