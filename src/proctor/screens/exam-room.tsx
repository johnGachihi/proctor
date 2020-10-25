/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import client from "../../network/client";
import { useEchoPresence, useEchoPrivate } from './../../hooks/use-echo'
import * as webrtc from '../../utils/webrtc'

function ExamRoom() {
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([]);
  const { user, logout } = useAuth()
  const echoChannel = useMemo(() => `proctor.${user.id}`, [user.id]);
  const { 
    listen: privateListen,
    stopListening: privateStopListen
  } = useEchoPrivate(echoChannel);
  const { code } = useParams()
  const proctorsChannel = useMemo(() => `proctors.${code}`, [code])
  const { listen, stopListening } = useEchoPresence(proctorsChannel)

  useEffect(() => {
    listen("PeerConnectionOffer", async (offer: any) => {
      console.log('PeerConnectionOffer', offer)
      if (offer.offer && offer.senderId) {
        const configuration = { iceServers: servers };
        const peerConnection = new RTCPeerConnection(configuration);

        peerConnection.onicecandidate = (event) => {
          webrtc.handleIceCandidateIdentified(event, offer.senderId)
        }
        peerConnection.onconnectionstatechange = () => {
          console.log('Connection state changed', peerConnection.connectionState)
        }
        peerConnection.oniceconnectionstatechange = () => {
          console.log('ICE connection state changed:',
                      peerConnection.iceConnectionState,
                      peerConnection.connectionState)
        }

        offer.offer.sdp += '\n'
        peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer.offer)
        );

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        setPeerConnections((peerConnections) => [
          ...peerConnections,
          { id: offer.senderId, peerConnection },
        ]);

        client.post("signalling/answer", {
          candidate_id: offer.senderId, answer 
        });
      }
    });

    return () => stopListening('PeerConnectionOffer')
  }, [listen, peerConnections, stopListening])

  useEffect(() => {
    privateListen('PeerConnectionICE', async iceMessage => {
      webrtc.handleIceCandidateReceived(iceMessage, peerConnections)
    })
    return () => privateStopListen('PeerConnectionICE')
  }, [peerConnections, privateListen, privateStopListen])

  return (
    <div>
      Invigilate
      <button onClick={logout}>Logout</button>
    </div>
  );
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

export default ExamRoom;
