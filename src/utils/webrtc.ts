import client from "../network/client";

async function handleIceCandidateReceived(iceMessage: any, peerConnections: PeerConnection[]) {
  console.log('Ice candidate received__')
  const pc = getRTCPeerConnection(iceMessage.senderId, peerConnections)
  if (pc) {
    const { peerConnection } = pc
    fixIceCandidate(iceMessage.ice)
    try {
      await peerConnection.addIceCandidate(iceMessage.ice);
      console.log('Successfully added ice candidate')
      console.log(peerConnection)
    } catch (e) {
      console.error('Error adding received ice candidate', e);
      console.error('Ice:', iceMessage.ice)
    }
  } else {
    console.log('PeerConnection not found', peerConnections)
  }
}

function getRTCPeerConnection(id: number, peerConnections: PeerConnection[]) {
  return peerConnections.find(pc => pc.id === id)
}

function fixIceCandidate(ice: any) {
  if (ice.candidate === null) {
    ice.candidate = ""
  }
}


async function handleIceCandidateIdentified(
  event: RTCPeerConnectionIceEvent,
  recipientId: number
){
  if (event.candidate) {
    try {
      await client.post('signalling/ice-candidate', {
        recipient_id: recipientId,
        ice: event.candidate
      })
    } catch (error) {
      console.error('Error sending ice-candidate:', error)
    }
  } else {
    console.log("Ice gathering complete")
  }
}


function setupEventListeners(peerConnection: RTCPeerConnection, connectionId: number) {
  peerConnection.onicecandidate = async (event) => {
    handleIceCandidateIdentified(event, connectionId)
  }
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state changed', peerConnection.connectionState)
  }
  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE connection state changed:', peerConnection.iceConnectionState)
    peerConnection.onicecandidate = null
  }
}

function fixOfferOrAnswer(offerOrAnswer: any) {
  offerOrAnswer.sdp += '\n'
}

const configuration: RTCConfiguration = {
  iceServers: [
    {
      urls: 'turn:numb.viagenie.ca',
      username: 'webrtc@live.com',
      credential: 'muazkh'
    },
    {
      urls: 'stun:stun.l.google.com:19302'
    }
  ]
}

export {
  handleIceCandidateReceived,
  setupEventListeners,
  configuration,
  fixOfferOrAnswer,
}