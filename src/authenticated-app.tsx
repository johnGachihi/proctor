import React from "react";
import { FullPageSpinner } from "./components/lib";
import { useAuth } from "./contexts/auth-context";

const ProctorApp = React.lazy(() => import('./proctor/proctor-app'))
const CandidateApp = React.lazy(() => import('./candidate/candidate-app'))

function AuthenticatedApp() {
  const { user } = useAuth();

  return (
    <React.Suspense fallback={<FullPageSpinner/>}>
      {user.role === 'proctor' ? <ProctorApp /> : <CandidateApp />}
    </React.Suspense>
  )
}

export default AuthenticatedApp;
