import { useCallback, useEffect, useMemo, useState } from 'react'
import client from '../network/client'
import * as webrtc from '../utils/webrtc'
import { createEchoCallback, useEchoPresence } from './use-echo'


const offerOptions: RTCOfferOptions = {
  offerToReceiveVideo: true
}

// TODO: DRY!!
async function sendIceCandidate (
  iceCandidate: RTCIceCandidate,
  peerId: number,
  examCode: string
) {
  try {
    await client.post('signalling/ice-candidate', {
      exam_code: examCode,
      recipient_id: peerId,
      ice: iceCandidate
    })
  } catch (error) {
    console.error('Error sending ice-candidate:', error)
  }
}

// TODO: DRY!!
async function sendOffer(
  offer: RTCSessionDescriptionInit,
  peerId: number,
  examCode: string
) {
  await client.post('signalling/offer', {
    exam_code: examCode,
    recipient_id: peerId,
    offer
  })
}

// TODO: DRY!!
async function sendAnswer(
  answer: RTCSessionDescriptionInit,
  peerId: number,
  examCode: string
) {
  await client.post('signalling/answer', {
    exam_code: examCode,
    recipient_id: peerId,
    answer
  })
}

function getPeerConnectionById(
  peerConnections: PeerConnection[],
  id: number
) {
  return peerConnections.find(pc => pc.id === id)
}


function usePeerConnection(
  examCode: string,
  mediaStream: MediaStream,
  user: User,
  onProctoringMessageCallback?: (event: MessageEvent) => void
) {
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([])
  /* const [
    someConnectionsEstablished,
    setSomeConnectionsEstablished
  ] = useState<boolean>(false) */

  // TODO: Remove useMemo
  const channel = useMemo(() => `exam.${examCode}`, [examCode])
  const {
    listen,
    stopListening,
    onJoining,
    onJoiningStop,
    onLeaving,
    onLeavingStop,
    subscribers: membersInExam
  } = useEchoPresence(channel)

  const handleIceCandidateIdentified = useCallback(async (
    event: RTCPeerConnectionIceEvent,
    peerId: number
  ) => {
    if (event.candidate) {
      await sendIceCandidate(event.candidate, peerId, examCode)
    } else {
      console.log("Ice gathering complete")
    }
  }, [examCode])

  const handleRemoteTrackReceived = useCallback((
    event: RTCTrackEvent,
    peerId: number
  ) => {
    const remoteStream = new MediaStream();
    remoteStream.addTrack(event.track);

    setPeerConnections(peerConnections =>
      peerConnections.map(pc => ({
        ...pc,
        mediaStream: pc.id === peerId ? remoteStream : pc.mediaStream
      }))
    )
  }, [])

  const setUpPeerConnectionListeners = useCallback((
    peerConnection: RTCPeerConnection,
    peerId: number
  ) => {
    // TODO: Do I need to await
    peerConnection.onicecandidate = async (event) => {
      handleIceCandidateIdentified(event, peerId)
    }
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed', peerConnection.connectionState)
      setPeerConnections(peerConnections => peerConnections.map(pc => pc))
    }
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed:', peerConnection.iceConnectionState)
      // setSomeConnectionsEstablished(true)
    }
    peerConnection.ontrack = (event) => {
      handleRemoteTrackReceived(event, peerId)
    }
  }, [handleIceCandidateIdentified, handleRemoteTrackReceived])

  const initiateConnection = useCallback(async (peer: User) => {
    const peerConnection = new RTCPeerConnection(webrtc.configuration)

    for (const track of mediaStream.getTracks()) {
      peerConnection.addTrack(track, mediaStream)
    }

    const dataChannel = peerConnection.createDataChannel('proctoringChannel')
    if (onProctoringMessageCallback) {
      dataChannel.onmessage = onProctoringMessageCallback
    }

    const offer = await peerConnection.createOffer(offerOptions)
    await peerConnection.setLocalDescription(offer)

    setUpPeerConnectionListeners(peerConnection, peer.id)

    setPeerConnections(peerConnections => [
      ...peerConnections,
      {id: peer.id, user: peer, peerConnection, dataChannel}
    ])

    sendOffer(offer, peer.id, examCode)

  }, [examCode, mediaStream, onProctoringMessageCallback, setUpPeerConnectionListeners])
  
  const destroyConnection = useCallback((peerId: number) => {
    const connection = peerConnections.find(pc => pc.id === peerId)
    if (connection) {
      connection.peerConnection.close()
      setPeerConnections(peerConnections.filter(pc => pc.id !== peerId))
    }
  }, [peerConnections])

  const sendProctoringMessage = useCallback((message: string) => {
    for (const connection of peerConnections) {
      if (connection.dataChannel &&
          connection.dataChannel.readyState === 'open'
      ) {
        const msg: Message = { senderId: user.id, message }
        connection.dataChannel.send(JSON.stringify(msg))
      }
    }
  }, [peerConnections, user.id])


  useEffect(() => {
    const callback = createEchoCallback((peer: User) => {
      if (user.role !== peer.role) {
        initiateConnection(peer)
      }
    })
    onJoining(callback)

    return () => {
      onJoiningStop(callback)
    }
  }, [initiateConnection, onJoining, onJoiningStop, user.role])

  useEffect(() => {
    const callback = createEchoCallback((peer: User) => {
      console.log(`usePeerConnection:`, peer)
      destroyConnection(peer.id)
    })
    onLeaving(callback)

    return () => {
      onLeavingStop(callback)
    }
  }, [destroyConnection, onLeaving, onLeavingStop, user.role])

  useEffect(() => {
    listen('PeerConnectionAnswer', async (answer: any) => {
      if (answer.recipientId === user.id) {
        const connection = getPeerConnectionById(peerConnections, answer.senderId)
        if (connection) {
          const { peerConnection } = connection
          webrtc.fixOfferOrAnswer(answer.answer)
          await peerConnection.setRemoteDescription(answer.answer)
        }
      }
    })
    return () => stopListening('PeerConnectionAnswer')
  }, [listen, peerConnections, stopListening, user.id])

  useEffect(() => {
    listen('PeerConnectionICE', async (iceMessage) => {
      if (iceMessage.recipientId === user.id) {
        webrtc.handleIceCandidateReceived(iceMessage, peerConnections)
      }
    })
    return () => stopListening('PeerConnectionICE')
  }, [listen, peerConnections, stopListening, user.id])

  useEffect(() => {
    listen("PeerConnectionOffer", async (offer: any) => {
      if (offer.recipientId === user.id) {
        const peerConnection = new RTCPeerConnection(webrtc.configuration);

        // TODO: Could this be made better?
        //       Maybe have the server send the sender's
        //       User details in the offer message 
        const peer: User = membersInExam.find(member => {
          console.log('usePeerConnections: PeerConnectionOffer', member)
          return member.id === offer.senderId
        })
        const connection: PeerConnection = { id: offer.senderId, user: peer, peerConnection }

        for (const track of mediaStream.getTracks()) {
          peerConnection.addTrack(track, mediaStream)
        }

        setPeerConnections((peerConnections) => [
          ...peerConnections,
          connection,
        ]);
        
        setUpPeerConnectionListeners(peerConnection, offer.senderId)

        peerConnection.ondatachannel = (event) => {
          const { channel } = event
          if (onProctoringMessageCallback) {
            channel.onmessage = onProctoringMessageCallback
          }
    
          setPeerConnections(peerConnections =>
            peerConnections.map(pc => ({
              ...pc,
              dataChannel: pc.id === offer.senderId ? channel : undefined
            }))
          )
        }

        webrtc.fixOfferOrAnswer(offer.offer)
        await peerConnection.setRemoteDescription(offer.offer);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        await sendAnswer(answer, offer.senderId, examCode)
      }
    })
    return () => stopListening('PeerConnectionOffer')
  }, [examCode, handleRemoteTrackReceived, listen, mediaStream, membersInExam, onProctoringMessageCallback, setUpPeerConnectionListeners, stopListening, user.id])

  const pendingConnections = useMemo(() => {
    return peerConnections.filter(pc =>
      pc.peerConnection.connectionState !== 'connected')
  }, [peerConnections])

  const someConnectionsEstablished = useMemo(() => {
    return pendingConnections.length === 0 && peerConnections.length > 0
  }, [peerConnections.length, pendingConnections.length])

  return {
    peerConnections,
    sendProctoringMessage,
    someConnectionsEstablished,
    membersInExam,
    pendingConnections
  }
}

export { usePeerConnection }