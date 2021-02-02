import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";
import ExamRoom from "./screens/exam-room";
import ProctorHome from "./screens/home";

function ProctorApp() {
  const [webcamStream, setWebcamStream] = useState<MediaStream>()

  return (
    <Switch>
      <Route path="/exam/:code">
        <ExamRoom webcamStream={ webcamStream! } setWebcamStream={ setWebcamStream } />
      </Route>
      <Route path="/">
        <ProctorHome setWebcamStream={setWebcamStream}/>
      </Route>
    </Switch>
  );
}

export default ProctorApp;
