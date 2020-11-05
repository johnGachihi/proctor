import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";
import ExamRoom from "../candidate/screens/exam-room";
import CandidateHome from "./screens/home";

function CandidateApp() {
  const [webcamStream, setWebcamStream] = useState<MediaStream>()

  return (
    <Switch>
      <Route exact path="/exam/:code">
        <ExamRoom webcamStream={webcamStream} />
      </Route>
      <Route exact path="/">
        <CandidateHome setWebcamStream={setWebcamStream}/>
      </Route>
    </Switch>
  );
}

export default CandidateApp;
