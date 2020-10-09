import { Button } from "@material/react-button";
import React from "react";
import { useAuth } from "./contexts/auth-context";

function AuthenticatedApp() {
  const { user, logout } = useAuth();

  return (
    <div>
      Welcome, {user.name}
      <Button onClick={ logout } raised>Logout</Button>
    </div>
  );
}

export default AuthenticatedApp;
