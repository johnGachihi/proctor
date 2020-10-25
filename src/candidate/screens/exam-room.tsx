import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import client from '../../network/client'
import useAsync from '../../utils/use-async'
import { useEchoPrivate } from '../../hooks/use-echo'
import * as webrtc from '../../utils/webrtc'

function ExamRoom() {
  const { user, logout } = useAuth()
  const { code } = useParams()
  const { run } = useAsync()
  const channel = useMemo(() => `candidate.${user.id}`, [user.id])
  const { listen, stopListening } = useEchoPrivate(channel)
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([])
  const [peerConnectionOffer, setPeerConnectionOffer] = useState<any>()

  useEffect(() => {
    async function sendOffer() {
      const configuration = { iceServers: servers };
      const peerConnection = new RTCPeerConnection(configuration)
      const offer = await peerConnection.createOffer({
        offerToReceiveVideo: true
      })
      setPeerConnectionOffer(offer)
      await run(client.post('/signalling/offer', {offer: offer, exam_code: code}))
    }
    sendOffer()
  }, [code, run])

  useEffect(() => {
    listen('PeerConnectionAnswer', async (answer: any) => {
      if (answer.answer) {
        const configuration = {iceServers: servers};
        const peerConnection = new RTCPeerConnection(configuration);

        peerConnection.onicecandidate = async (event) => {
          webrtc.handleIceCandidateIdentified(event, answer.senderId)
        }
        peerConnection.onconnectionstatechange = (event) => {
          console.log('Connection state changed', peerConnection.connectionState)
        }
        peerConnection.oniceconnectionstatechange = (event) => {
          console.log('ICE connection state changed:',
                      peerConnection.iceConnectionState,
                      peerConnection.connectionState)
        }

        await peerConnection.createOffer({
          offerToReceiveVideo: true
        })
        await peerConnection.setLocalDescription(new RTCSessionDescription(peerConnectionOffer))
        answer.answer.sdp += '\n'
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer.answer))
        
        setPeerConnections(peerConnections => [
          ...peerConnections,
          { id: answer.senderId, peerConnection }
        ])

      }
    })

    return () => stopListening('PeerConnectionAnswer')
  }, [listen, stopListening, peerConnectionOffer])

  useEffect(() => {
    listen('PeerConnectionICE', async (iceMessage) => {
      webrtc.handleIceCandidateReceived(iceMessage, peerConnections)
    })
    return () => stopListening('PeerConnectionICE')
  }, [listen, peerConnections, stopListening])

  useEffect(() => {console.log(peerConnections)}, [peerConnections])

  return (
    <div>
      <span>Exam Room</span>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

const servers: RTCIceServer[] = [
  {
    urls: 'turn:numb.viagenie.ca',
    username: 'webrtc@live.com',
    credential: 'muazkh'
  },
  {
    urls: 'stun:stun.l.google.com:19302'
  }
]

export default ExamRoom