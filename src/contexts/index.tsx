import React from 'react';
import {BrowserRouter as Router} from 'react-router-dom';
import { AuthProvider } from './auth-context'
const appRelativePath = process.env.REACT_APP_RELATIVE_PATH

function AppProviders({children}: React.PropsWithChildren<{}>) {
  return (
    <Router basename={appRelativePath}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Router>)
}

export default AppProviders;