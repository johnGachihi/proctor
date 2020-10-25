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
        const peerConnection = new RTCPeerConnection(webrtc.configuration);

        webrtc.setupEventListeners(peerConnection, offer.senderId)

        await peerConnection.setRemoteDescription(offer.offer);

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


export default ExamRoom;
