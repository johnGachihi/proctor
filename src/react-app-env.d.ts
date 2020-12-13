/// <reference types="react-scripts" />

type PeerConnection = {
  id: number;
  peerConnection: RTCPeerConnection;
  mediaStream?: MediaStream;
};

type User = {
  id: number;
  name: string;
  role: 'proctor' | 'candidate';
}