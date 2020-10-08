import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import { AuthProvider } from './auth-context'

function AppProviders({children}: React.PropsWithChildren<{}>) {
  return (
    <Router>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Router>)
}

export default AppProviders;