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
      const peerConnection = new RTCPeerConnection(webrtc.configuration)
      const offer = await peerConnection.createOffer(offerOptions)
      setPeerConnectionOffer(offer)
      await run(client.post('/signalling/offer', {offer: offer, exam_code: code}))
    }
    sendOffer()
  }, [code, run])

  useEffect(() => {
    listen('PeerConnectionAnswer', async (answer: any) => {
      if (answer.answer) {
        const peerConnection = new RTCPeerConnection(webrtc.configuration);

        webrtc.setupEventListeners(peerConnection, answer.senderId)

        // Offer ignored intentionally
        // Called to avoid `setLocalDescription called before createOffer` error
        await peerConnection.createOffer(offerOptions)

        await peerConnection.setLocalDescription(peerConnectionOffer)
        await peerConnection.setRemoteDescription(answer.answer)
        
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

  return (
    <div>
      <span>Exam Room</span>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

const offerOptions: RTCOfferOptions = {
  offerToReceiveVideo: true
}

export default ExamRoom