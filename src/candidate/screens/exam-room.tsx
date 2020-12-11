import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import client from '../../network/client'
import useAsync from '../../utils/use-async'
import { useEchoPresence } from '../../hooks/use-echo'
import * as webrtc from '../../utils/webrtc'

/* webcamStream should never be undefined */
type Props = PropsWithChildren<{
  webcamStream: MediaStream | undefined;
}>

function ExamRoom({ webcamStream }: Props) {
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  const { run } = useAsync()

  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([])

  const channel = useMemo(() => `exam.${code}`, [code])
  const { listen, stopListening, onJoining } = useEchoPresence(channel)

  const videoEl = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoEl && webcamStream) {
      videoEl.current!.srcObject = webcamStream
    }
  }, [videoEl, webcamStream])

  useEffect(() => {
    onJoining(async user => {
      if (user.role === 'proctor') {
        // const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        const peerConnection = new RTCPeerConnection(webrtc.configuration)

        webcamStream?.getTracks().forEach(track => peerConnection.addTrack(track, webcamStream))

        const offer = await peerConnection.createOffer(offerOptions)
        await peerConnection.setLocalDescription(offer)

        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            try {
              await client.post('signalling/ice-candidate', {
                exam_code: code,
                recipient_id: user.id,
                ice: event.candidate
              })
            } catch (error) {
              console.error('Error sending ice-candidate:', error)
            }
          } else {
            console.log("Ice gathering complete")
          }
        }
        peerConnection.onconnectionstatechange = () => {
          console.log('Connection state changed', peerConnection.connectionState)
        }
        peerConnection.oniceconnectionstatechange = () => {
          console.log('ICE connection state changed:', peerConnection.iceConnectionState)
          peerConnection.onicecandidate = null
        }

        setPeerConnections(peerConnections => [
          ...peerConnections,
          { id: user.id, peerConnection }
        ])

        await run(client.post('signalling/offer', {
          exam_code: code,
          recipient_id: user.id,
          offer
        }))
      }
    })
  }, [onJoining, run, code, peerConnections])

  useEffect(() => {
    listen('PeerConnectionAnswer', async (answer: any) => {
      const connection = peerConnections.find(pc => pc.id === answer.senderId)

      if (connection) {
        const peerConnection = connection.peerConnection

        webrtc.fixOfferOrAnswer(answer.answer)
        await peerConnection.setRemoteDescription(answer.answer)
      }

      /* if (answer.answer) {
        if (peerConnection) {
          webrtc.setupEventListeners(peerConnection, answer.senderId)
          peerConnection.ontrack = (e) => {
            ...
          }
        }
      } */
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

const offerOptions: RTCOfferOptions = {
  offerToReceiveVideo: true
}

export default ExamRoom