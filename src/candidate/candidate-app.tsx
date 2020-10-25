import React from "react";
import { Switch, Route } from "react-router-dom";
import ExamRoom from "../candidate/screens/exam-room";
import CandidateHome from "./screens/home";

function CandidateApp() {
  return (
    <Switch>
      <Route exact path="/exam/:code" children={<ExamRoom />} />
      <Route exact path="/" children={<CandidateHome />} />
    </Switch>
  );
}

export default CandidateApp;
