/// <reference types="react-scripts" />

type PeerConnection = {
  id: number;
  user: User;
  peerConnection: RTCPeerConnection;
  mediaStream?: MediaStream;
  dataChannel?: RTCDataChannel;
};

type Candidate = {
  id: number
  user: User;
  mediaStream?: MediaStream
  dataChannel?: RTCDataChannel
  proctoringState: 'Possibly cheating' | 'OK'
  cheatingCount: number
  connectionState: string
}

type User = {
  id: number;
  name: string;
  role: 'proctor' | 'candidate';
}

type Message = {
  senderId: number;
  message: string;
}