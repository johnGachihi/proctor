/** @jsx jsx */
import { jsx } from "@emotion/core";
import styled from '@emotion/styled'
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { usePeerConnection } from "../../hooks/use-peerconnection";
import SurveillanceScreen from "../components/surveillance-screen";
import IconButton from '@material/react-icon-button';
import dingSound from '../../assets/beep.wav'
import MaterialIcon from "@material/react-material-icon";

function usePlayAudio() {
  const dingAudio = useMemo(() => new Audio(dingSound), []);

  const play = useCallback(() => {
    if (dingAudio.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
      dingAudio.play();
    } else {
      dingAudio.addEventListener('canplaythrough', dingAudio.play);
    }
  }, [dingAudio]);

  return play
}

type Props = React.PropsWithChildren<{
  webcamStream: MediaStream
  requestWebcamStream: () => Promise<void>
  stopWebcamStream: () => void
}>

function ExamRoom({ webcamStream, requestWebcamStream, stopWebcamStream }: Props) {
  const { user } = useAuth()
  //@ts-ignore
  const { code } = useParams()

  const [isNotificationMuted, setIsNotificationMuted] = useState(false)
  const playDing = usePlayAudio()
  
  const [candidates, setCandidates] = useState<Candidate[]>([])

  const onProctoringMessage = useCallback((event: MessageEvent) => {
    console.log(event)
    const message: Message = JSON.parse(event.data)

    if (message.message === 'possibly-cheating' && !isNotificationMuted) {
      playDing()
    }

    setCandidates(candidates => {
      return candidates.map(candidate => {
        if (message.senderId === candidate.id) {
          const newCandidate: Candidate = {
            ...candidate,
            proctoringState: message.message as ProctoringState
          }

          if (message.message === 'possibly-cheating') {
            newCandidate.cheatingCount = candidate.cheatingCount + 1
          }
          return newCandidate
        } else {
          return candidate
        }
      })
    })
  }, [isNotificationMuted, playDing])

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
          ? {...candidate, ...pc, connectionState: pc.peerConnection.connectionState}
          : {
            ...pc,
            proctoringState: 'ok',
            cheatingCount: 0,
            connectionState: pc.peerConnection.connectionState
          }
      })
    })
  }, [peerConnections])

  return (
    <InvigilatorExamRoom>
      <StyledSurveillanceScreen candidates={candidates} />
      <TopAppBar>
        <IconButton onClick={() => setIsNotificationMuted(isNotificationMuted => !isNotificationMuted)}>
          { isNotificationMuted
            ? <MaterialIcon icon='notifications_off'/>
            : <MaterialIcon icon='notifications_active'/>
          }
        </IconButton>
        {/* <Button icon={<MaterialIcon icon='warning' />}></Button> */}
      </TopAppBar>
    </InvigilatorExamRoom>
  );
}

const InvigilatorExamRoom = styled.div`
  height: 100vh;
  display: grid;
  grid-template-columns: [leftmost] 80% [mid] 20% [rightmost];
  grid-template-rows: [top] 10% [app-bar-bottom] auto [bottom];
`

const StyledSurveillanceScreen = styled(SurveillanceScreen)`
  grid-column-start: leftmost;
  grid-column-end: rightmost;
  grid-row-start: app-bar-bottom;
  grid-row-end: bottom;
  margin: 10px;
`

const TopAppBar = styled.div`
  grid-column-start: leftmost;
  grid-column-end: rightmost;
  grid-row-start: top;
  grid-row-end: app-bar-bottom;

  display: flex
`


export default ExamRoom;
