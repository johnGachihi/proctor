export type LoginCredentials = {
  email: string;
  password: string;
}

export type AuthProviderValue = {
  user: any,
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void
}