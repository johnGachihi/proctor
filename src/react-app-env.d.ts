/// <reference types="react-scripts" />

type PeerConnection = {
  id: number;
  peerConnection: RTCPeerConnection;
  mediaStream?: MediaStream;
  dataChannel?: RTCDataChannel;
};

type User = {
  id: number;
  name: string;
  role: 'proctor' | 'candidate';
}

type Message = {
  senderId: number;
  message: string;
}