import React from 'react';
import { AuthProviderValue, LoginCredentials } from '../types/auth';
import useAsync from '../utils/use-async';
import * as auth from './../network/auth-provider'

const AuthContext = React.createContext<AuthProviderValue | undefined>(undefined)
AuthContext.displayName = 'AuthContext'

function AuthProvider(props: React.PropsWithChildren<{}>) {
  const {
    data: user,
    setData
  } = useAsync()

  const login = React.useCallback(
    (creds: LoginCredentials) => {
      auth.login(creds).then(user => setData(user))
    }, [setData]
  )

  const logout = React.useCallback(() => {
    auth.logout()
    setData(null)
  }, [setData])

  const value = React.useMemo<AuthProviderValue>(
    () => ({user, login, logout}),
    [user, login, logout]
  )

  return <AuthContext.Provider value={value} {...props} />
}

function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth() should be called within AuthProvider')
  }
  return context;
}

export {AuthProvider, useAuth}