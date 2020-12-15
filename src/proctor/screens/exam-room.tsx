/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { usePeerConnection } from "../../hooks/use-peerconnection";

type Props = React.PropsWithChildren<{
  webcamStream: MediaStream
}>

type Candidate = {
  id: number
  mediaStream?: MediaStream
  proctoringState: 'Possibly cheating' | 'OK'
  dataChannel?: RTCDataChannel
}

function ExamRoom({ webcamStream }: Props) {
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  
  const [candidates, setCandidates] = useState<Candidate[]>()

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

  
  useEffect(() => {
    console.log(candidates)
  }, [candidates])

  useEffect(() => {
    setCandidates(candidates => {
      return peerConnections.map(pc => {
        const candidate = candidates?.find(c => c.id === pc.id)
        return candidate 
          ? {...candidate, ...pc}
          : {...pc, proctoringState: 'OK'}
      })
    })
  }, [peerConnections])

  return (
    <div>
      Invigilate
      <button onClick={logout}>Logout</button>
      {candidates?.map(candidate => {
        if (candidate.mediaStream) {
          return (
            <div>
              <video 
                autoPlay
                ref={videoEl => {
                  if (videoEl)
                    videoEl.srcObject = candidate!.mediaStream!
                }}
                css={{width: '250px', height: 'auto'}}/>
                <span>{candidate.proctoringState}</span>
            </div>
          )
        } else {
          return null
        }
      })}
    </div>
  );
}


export default ExamRoom;
