/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import { usePeerConnection } from "../../hooks/use-peerconnection";

type Props = React.PropsWithChildren<{
  webcamStream: MediaStream
}>

function ExamRoom({ webcamStream }: Props) {
  // const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([]);
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()

  const { peerConnections } = usePeerConnection(code, webcamStream, user)

  useEffect(() => {
    console.log(peerConnections)
  }, [peerConnections])

  return (
    <div>
      Invigilate
      <button onClick={logout}>Logout</button>
      {peerConnections.map(peerConnection => {
        if (peerConnection.mediaStream) {
          return (
            <video autoPlay
                   ref={videoEl => {
                     if (videoEl)
                      videoEl.srcObject = peerConnection!.mediaStream!
                    }}
                   css={{width: '250px', height: 'auto'}}/>
            )
        } else {
          return null
        }
      })}
    </div>
  );
}


export default ExamRoom;
