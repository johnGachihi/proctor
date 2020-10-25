import React from "react";
import { Switch, Route } from "react-router-dom";
import ExamRoom from "./screens/exam-room";
import ProctorHome from "./screens/home";

function ProctorApp() {
  return (
    <Switch>
      <Route path="/exam/:code" children={<ExamRoom />} />
      <Route path="/" children={<ProctorHome />} />
    </Switch>
  );
}

export default ProctorApp;
