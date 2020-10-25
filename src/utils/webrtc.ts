import client from "../network/client";

async function handleIceCandidateReceived(iceMessage: any, peerConnections: PeerConnection[]) {
  console.log('Ice candidate received')
  const pc = getRTCPeerConnection(iceMessage.sender_id, peerConnections)
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

export { handleIceCandidateReceived, handleIceCandidateIdentified }