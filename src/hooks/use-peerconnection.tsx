import { useCallback, useState } from 'react'
import client from '../network/client'
import * as webrtc from '../utils/webrtc'


const offerOptions: RTCOfferOptions = {
  offerToReceiveVideo: true
}

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

function usePeerConnection(
  examCode: string,
  mediaStream: MediaStream,
) {
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([])

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

  }, [examCode, mediaStream, setPeerConnections])

  const destroyConnection = useCallback((peerId: number) => {
    const connection = peerConnections.find(pc => pc.id === peerId)
    if (connection) {
      connection.peerConnection.close()
      setPeerConnections(peerConnections.filter(pc => pc.id !== peerId))
    }
  }, [peerConnections, setPeerConnections])

  return { initiateConnection, destroyConnection, peerConnections }
}


export { usePeerConnection }