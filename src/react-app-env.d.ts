/// <reference types="react-scripts" />

type PeerConnection = {
  id: number;
  peerConnection: RTCPeerConnection;
};

type User = {
  id: number;
  name: string;
  role: 'proctor' | 'candidate';
}