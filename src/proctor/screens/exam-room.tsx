/** @jsx jsx */
import { jsx } from "@emotion/core";
import styled from '@emotion/styled'
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { usePeerConnection } from "../../hooks/use-peerconnection";
import SurveillanceScreen from "../components/surveillance-screen";

type Props = React.PropsWithChildren<{
  webcamStream: MediaStream
  requestWebcamStream: () => Promise<void>
  stopWebcamStream: () => void
}>

function ExamRoom({ webcamStream, requestWebcamStream, stopWebcamStream }: Props) {
  const { user } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  
  const [candidates, setCandidates] = useState<Candidate[]>([])

  const onProctoringMessage = useCallback((event: MessageEvent) => {
    console.log(event)
    const message: Message = JSON.parse(event.data)
    setCandidates(candidates => {
      const candidate = candidates?.find(c => c.id === message.senderId)
      if (candidate && candidate.proctoringState !== message.message) {
        return candidates
      }
      return candidates?.map(candidate => {
        return message.senderId === candidate.id
          ? {...candidate, proctoringState: (message.message as 'OK' | 'Possibly cheating')}
          : {...candidate}
      })
    })
  }, [])

  const { peerConnections } = usePeerConnection(
    code,
    webcamStream,
    user,
    onProctoringMessage
  )

  // TO BE REMOVED
  useEffect(() => {
    console.log('ExamRoom: Candidates', candidates)
  }, [candidates])

  // TO BE REMOVED
  useEffect(() => {
    console.log('ExamRoom: peerConnections', peerConnections)
  }, [peerConnections])

  useEffect(() => {
    if (! webcamStream) {
      requestWebcamStream()
    }
  }, [webcamStream, requestWebcamStream])

  useEffect(() => {
    return () => {
      stopWebcamStream()
    }
  }, [stopWebcamStream])

  useEffect(() => {
    setCandidates(candidates => {
      return peerConnections.map(pc => {
        const candidate = candidates?.find(c => c.id === pc.id)
        return candidate 
          ? {...candidate, ...pc}
          : {...pc, proctoringState: 'OK', cheatingCount: 0}
      })
    })
  }, [peerConnections])

  return (
    <InvigilatorExamRoom>
      <StyledSurveillanceScreen candidates={candidates} />
    </InvigilatorExamRoom>
  );
}

const InvigilatorExamRoom = styled.div`
  height: 100vh;
  display: grid;
  grid-template-columns: [start] 80% [mid] 20% [end];
  grid-template-rows: [top] auto [bottom];
`

const StyledSurveillanceScreen = styled(SurveillanceScreen)`
  grid-column-start: start;
  grid-column-end: mid;
  grid-row-start: top;
  grid-row-end: bottom;
  margin: 10px;
`


export default ExamRoom;
