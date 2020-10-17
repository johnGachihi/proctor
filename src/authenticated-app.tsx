import React from "react";
import { useAuth } from "./contexts/auth-context";
import CandidateHome from "./screens/candidate/home";
import ProctorHome from "./screens/proctor/home";

function AuthenticatedApp() {
  const { user } = useAuth();

  if (user.role === 'proctor') {
    return <ProctorHome />
  } else {
    return  <CandidateHome />
  }
}

export default AuthenticatedApp;
