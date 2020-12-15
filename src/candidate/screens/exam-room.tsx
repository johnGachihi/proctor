import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { usePeerConnection } from '../../hooks/use-peerconnection'


type Props = PropsWithChildren<{
  webcamStream: MediaStream;
}>

function ExamRoom({ webcamStream }: Props) {
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  const { peerConnections } = usePeerConnection(code, webcamStream, user)
  const videoEl = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoEl && webcamStream) {
      videoEl.current!.srcObject = webcamStream
    }
  }, [videoEl, webcamStream])

  useEffect(() => {
    console.log(peerConnections)
  }, [peerConnections])

  return (
    <div>
      <span>Exam Room</span>
      <button onClick={logout}>Logout</button>
      <video
        autoPlay
        ref={videoEl}
        css={{
          width: "250px",
          height: "auto",
        }}
      ></video>
    </div>
  )
}

export default ExamRoom