/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/auth-context";
import client from "../../network/client";
import { useEchoPresence } from './../../hooks/use-echo'
import * as webrtc from '../../utils/webrtc'

function ExamRoom() {
  const [peerConnections, setPeerConnections] = useState<PeerConnection[]>([]);
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  const videoEl = useRef<HTMLVideoElement>(null)

  const examChannelName = useMemo(() => `exam.${code}`, [code])
  const { onJoining, listen, stopListening } = useEchoPresence(examChannelName)

  useEffect(() => {
    onJoining(user => {
      console.log('Proctor heard someone join:', user)
    })
  }, [onJoining])

  useEffect(() => {
    listen("PeerConnectionOffer", async (offer: any) => {
      console.log('PeerConnectionOffer', offer)

      // const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const peerConnection = new RTCPeerConnection(webrtc.configuration);
      // stream?.getTracks().forEach(track => peerConnection.addTrack(track, stream))

      setPeerConnections((peerConnections) => [
        ...peerConnections,
        { id: offer.senderId, peerConnection },
      ]);
      
      peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            await client.post('signalling/ice-candidate', {
              exam_code: code,
              recipient_id: offer.senderId,
              ice: event.candidate
            })
          } catch (error) {
            console.error('Error sending ice-candidate:', error)
          }
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
      

      LEFT OFF HERE
      const remoteStream = new MediaStream();
      videoEl.current!.srcObject = remoteStream;

      peerConnection.ontrack = (event: RTCTrackEvent) => {
        if (videoEl.current) {
          remoteStream.addTrack(event.track);
        }
      }



      webrtc.fixOfferOrAnswer(offer.offer)
      await peerConnection.setRemoteDescription(offer.offer);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      client.post("signalling/answer", {
        exam_code: code,
        recipient_id: offer.senderId,
        answer 
      });
    });

    return () => stopListening('PeerConnectionOffer')
  }, [listen, stopListening, code])

  useEffect(() => {
    listen('PeerConnectionICE', async iceMessage => {
      if (iceMessage.recipientId === user.id) {
        webrtc.handleIceCandidateReceived(iceMessage, peerConnections)
      }
    })
    return () => stopListening('PeerConnectionICE')
  }, [peerConnections, listen, stopListening, user.id])

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
