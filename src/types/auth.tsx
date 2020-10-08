export type LoginCredentials = {
  username: string;
  password: string;
}

export type AuthProviderValue = {
  user: any,
  login: (credentials: LoginCredentials) => void;
  logout: () => void
}