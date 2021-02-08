/// <reference types="react-scripts" />

type PeerConnection = {
  id: number;
  user: User;
  peerConnection: RTCPeerConnection;
  mediaStream?: MediaStream;
  dataChannel?: RTCDataChannel;
};

type ProctoringState = 'possibly-cheating' | 'ok'

type Candidate = {
  id: number
  user: User;
  mediaStream?: MediaStream
  dataChannel?: RTCDataChannel
  proctoringState: ProctoringState
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

declare module '*.wav'