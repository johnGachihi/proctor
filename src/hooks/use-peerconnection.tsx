import { useCallback, useEffect, useMemo, useState } from 'react'
import client from '../network/client'
import * as webrtc from '../utils/webrtc'
import { useEchoPresence } from './use-echo'


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

function usePeerConnection(
  examCode: string,
  mediaStream: MediaStream,
  user: User,
) {
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([])

  // TODO: Remove useMemo
  const channel = useMemo(() => `exam.${examCode}`, [examCode])
  const {
    listen,
    stopListening,
    onJoining,
    onLeaving,
    onLeavingStop,
  } = useEchoPresence(channel)

  const initiateConnection = useCallback(async (peer: User) => {
    const peerConnection = new RTCPeerConnection(webrtc.configuration)

    for (const track of mediaStream.getTracks()) {
      peerConnection.addTrack(track, mediaStream)
    }

    const offer = await peerConnection.createOffer(offerOptions)
    await peerConnection.setLocalDescription(offer)

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        sendIceCandidate(event.candidate, peer.id, examCode)
      } else {
        console.log("Ice gathering complete")
      }
    }
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed', peerConnection.connectionState)
    }
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed:', peerConnection.iceConnectionState)
    }

    setPeerConnections(peerConnections => [
      ...peerConnections,
      {id: peer.id, peerConnection}
    ])

    sendOffer(offer, peer.id, examCode)

  }, [examCode, mediaStream])
  
  const destroyConnection = useCallback((peerId: number) => {
    const connection = peerConnections.find(pc => pc.id === peerId)
    if (connection) {
      connection.peerConnection.close()
      setPeerConnections(peerConnections.filter(pc => pc.id !== peerId))
    }
  }, [peerConnections])


  useEffect(() => {
    onJoining(async peer => {
      if (user.role !== peer.role) {
        await initiateConnection(peer)
      }
    })
  }, [initiateConnection, onJoining, user.role])

  useEffect(() => {
    onLeaving(peer => {
      if (user.role !== peer.role) {
        destroyConnection(peer.id)
      }
    })
    return onLeavingStop
  }, [destroyConnection, onLeaving, onLeavingStop, user.role])

  useEffect(() => {
    listen('PeerConnectionAnswer', async (answer: any) => {
      if (answer.recipientId === user.id) {
        const connection = peerConnections.find(pc => pc.id === answer.senderId)
        if (connection) {
          const peerConnection = connection.peerConnection

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
        console.log('iceMessage', iceMessage)
        if (iceMessage.recipientId === user.id) {
          webrtc.handleIceCandidateReceived(iceMessage, peerConnections)
        }
      }
    })
    return () => stopListening('PeerConnectionICE')
  }, [listen, peerConnections, stopListening, user.id])

  useEffect(() => {
    listen("PeerConnectionOffer", async (offer: any) => {
      if (offer.recipientId === user.id) {
        const peerConnection = new RTCPeerConnection(webrtc.configuration);
        const connection: PeerConnection = { id: offer.senderId, peerConnection }

        setPeerConnections((peerConnections) => [
          ...peerConnections,
          connection,
        ]);
        
        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            await sendIceCandidate(event.candidate, offer.senderId, examCode)
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

        peerConnection.ontrack = (event: RTCTrackEvent) => {
          const remoteStream = new MediaStream();
          console.log('Track added')
          remoteStream.addTrack(event.track);
          connection.mediaStream = remoteStream
          // setPeerConnections(peerConnections => peerConnections)
          setPeerConnections(peerConnections => {
            const pcs = peerConnections.map(pc => {
              if (pc.id === offer.senderId) {
                pc.mediaStream = remoteStream
              }
              return pc
            })
            return pcs
          })
        }

        webrtc.fixOfferOrAnswer(offer.offer)
        await peerConnection.setRemoteDescription(offer.offer);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        await sendAnswer(answer, offer.senderId, examCode)
      }
    })
    return () => stopListening('PeerConnectionOffer')
  }, [examCode, listen, stopListening, user.id])

  return { peerConnections }
}

export { usePeerConnection }