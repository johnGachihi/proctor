import React, { useEffect } from 'react';
import { FullPageSpinner, FullPageErrorFallback } from '../components/lib';
import client from '../network/client';
import { AuthProviderValue, LoginCredentials } from '../types/auth';
import useAsync from '../utils/use-async';
import * as auth from './../network/auth-provider'


async function bootstrapAppData() {
  try {
    const appData: {user: any} = await client.get('bootstrap')
    return appData.user
  } catch (error) {
    return error.unauthenticated
     ? null
     : Promise.reject(error)
  }
}

const AuthContext = React.createContext<AuthProviderValue | undefined>(undefined)
AuthContext.displayName = 'AuthContext'

function AuthProvider(props: React.PropsWithChildren<{}>) {
  const {
    data: user,
    status,
    error,
    isLoading,
    isIdle,
    isError,
    isSuccess,
    run,
    setData,
  } = useAsync()

  useEffect(() => {
    const bootstrapPromise = bootstrapAppData()
    run(bootstrapPromise)
  }, [run])

  const login = React.useCallback(
    async (creds: LoginCredentials) => {
      const user = await auth.login(creds)
      setData(user)
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

  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return <FullPageErrorFallback error={error} />
  }

  if (isSuccess) {
    return <AuthContext.Provider value={value} {...props} />
  }

  throw new Error(`Unhandled status: ${status}`)
}

function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth() should be called within AuthProvider')
  }
  return context;
}

export {AuthProvider, useAuth}