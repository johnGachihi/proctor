import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { useEchoPresence } from '../../hooks/use-echo'
import * as webrtc from '../../utils/webrtc'
import { usePeerConnection } from '../../hooks/use-peerconnection'


type Props = PropsWithChildren<{
  webcamStream: MediaStream;
}>

function ExamRoom({ webcamStream }: Props) {
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()

  const channel = useMemo(() => `exam.${code}`, [code])
  const { listen, stopListening, onJoining, onLeaving } = useEchoPresence(channel)

  const videoEl = useRef<HTMLVideoElement>(null)

  const { 
    initiateConnection,
    destroyConnection,
    peerConnections
  } = usePeerConnection(code, webcamStream)

  useEffect(() => {
    if (videoEl && webcamStream) {
      videoEl.current!.srcObject = webcamStream
    }
  }, [videoEl, webcamStream])

  useEffect(() => {
    onJoining(async user => {
      if (user.role === 'proctor') {
        await initiateConnection(user)
      }
    })
  }, [initiateConnection, onJoining])

  useEffect(() => {
    onLeaving(user => {
      if (user.role === 'proctor') {
        destroyConnection(user.id)
      }
    })
  }, [destroyConnection, onLeaving])

  useEffect(() => {
    console.log(peerConnections)
  })

  useEffect(() => {
    listen('PeerConnectionAnswer', async (answer: any) => {
      const connection = peerConnections.find(pc => pc.id === answer.senderId)

      if (connection) {
        const peerConnection = connection.peerConnection

        webrtc.fixOfferOrAnswer(answer.answer)
        await peerConnection.setRemoteDescription(answer.answer)
      }
    })

    return () => stopListening('PeerConnectionAnswer')
  }, [listen, peerConnections, stopListening])

  useEffect(() => {
    listen('PeerConnectionICE', async (iceMessage) => {
      console.log('iceMessage', iceMessage)
      if (iceMessage.recipientId === user.id) {
        webrtc.handleIceCandidateReceived(iceMessage, peerConnections)
      }
    })
    return () => stopListening('PeerConnectionICE')
  }, [listen, peerConnections, stopListening, user.id])

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