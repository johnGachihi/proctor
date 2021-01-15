import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { usePeerConnection } from '../../hooks/use-peerconnection'
import useProctorModel from '../../hooks/use-ml-model'
import { FullPageErrorFallback, FullPageSpinner } from '../../components/lib'


type Props = PropsWithChildren<{
  webcamStream: MediaStream;
}>

function ExamRoom({ webcamStream }: Props) {
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  const videoEl = useRef<HTMLVideoElement>(null)

  const {
    peerConnections,
    // sendProctoringMessage
  } = usePeerConnection(code, webcamStream, user)

  const {
    modelStatus,
    modelLoadingError,
    isModelLoadingError,
    isModelLoading,
    initiateProctoring,
    terminateProctoring,
  } = useProctorModel()

  // TO BE REMOVED
  useEffect(() => console.log(modelStatus), [modelStatus])

  useEffect(() => {
    if (videoEl && webcamStream) {
      videoEl.current!.srcObject = webcamStream
    }
  }, [videoEl, webcamStream])

  // TO BE REMOVED
  useEffect(() => {
    console.log(peerConnections)
  }, [peerConnections])

  useEffect(() => {
    if (videoEl.current) {
      initiateProctoring(videoEl.current, console.log)
    }
    return terminateProctoring
  }, [initiateProctoring, terminateProctoring])

  if (isModelLoading) {
    return <FullPageSpinner />
  }

  if (isModelLoadingError) {
    return <FullPageErrorFallback error={modelLoadingError} />
  }

  return (
    <div>
      <span>Exam Room</span>
      <button onClick={logout}>Logout</button>
      <video
        autoPlay
        ref={videoEl}
        width="300"
        height="300"
      ></video>
    </div>
  )
}

export default ExamRoom