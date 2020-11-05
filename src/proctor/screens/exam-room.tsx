/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const videoEl = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    listen("PeerConnectionOffer", async (offer: any) => {
      console.log('PeerConnectionOffer', offer)
      if (offer.offer && offer.senderId) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        
        const peerConnection = new RTCPeerConnection(webrtc.configuration);
        stream?.getTracks().forEach(track => peerConnection.addTrack(track, stream))

        webrtc.setupEventListeners(peerConnection, offer.senderId)
        peerConnection.ontrack = (event: RTCTrackEvent) => {
          alert('Track')
          console.log('TRACK!!!', event)
          // const remoteStream = new MediaStream()
          if (videoEl.current) {
            // event.track.muted = false
            // remoteStream.addTrack(event.track)
            videoEl.current.srcObject = event.streams[0]
          }
        }

        webrtc.fixOfferOrAnswer(offer.offer)
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
      <video
        autoPlay
        ref={videoEl}
        css={{
          width: "250px",
          height: "auto",
        }}
      ></video>
    </div>
  );
}


export default ExamRoom;
