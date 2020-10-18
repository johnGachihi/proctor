import React from "react";
import { Switch, Route } from "react-router-dom";
import CandidateHome from "./screens/home";

function CandidateApp() {
  return (
    <Switch>
      <Route path="/" children={<CandidateHome />} />
    </Switch>
  );
}

export default CandidateApp;
