import React from "react";
import { Switch, Route } from "react-router-dom";
import useWebcam from "../hooks/use-webcam";
import ExamRoom from "./screens/exam-room";
import ProctorHome from "./screens/home";

function ProctorApp() {
  const { webcamStream, requestWebcamStream, stopWebcamStream } = useWebcam()

  return (
    <Switch>
      <Route path="/exam/:code">
        <ExamRoom
          webcamStream={ webcamStream! }
          requestWebcamStream={requestWebcamStream}
          stopWebcamStream={stopWebcamStream} />
      </Route>
      <Route path="/">
        <ProctorHome requestWebcamStream={requestWebcamStream} />
      </Route>
    </Switch>
  );
}

export default ProctorApp;
