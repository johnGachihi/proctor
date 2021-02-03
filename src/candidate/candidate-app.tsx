import React from "react";
import { Switch, Route } from "react-router-dom";
import ExamRoom from "../candidate/screens/exam-room";
import useWebcam from "../hooks/use-webcam";
import CandidateHome from "./screens/home";

function CandidateApp() {
  const { webcamStream, requestWebcamStream, stopWebcamStream } = useWebcam()

  return (
    <Switch>
      <Route exact path="/exam/:code">
        <ExamRoom
          webcamStream={webcamStream!}
          requestWebcamStream={ requestWebcamStream }
          stopWebcamStream={ stopWebcamStream } />
      </Route>
      <Route exact path="/">
        <CandidateHome requestWebcamStream={requestWebcamStream}/>
      </Route>
    </Switch>
  );
}

export default CandidateApp;
