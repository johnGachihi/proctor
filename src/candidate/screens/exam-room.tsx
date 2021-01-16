import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
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
    // sendProctoringMessage,
    someConnectionsEstablished,
  } = usePeerConnection(code, webcamStream, user)

  const {
    modelStatus,
    modelLoadingError,
    isModelLoadingError,
    isModelLoading,
    isModelLoaded,
    initiateProctoring,
    terminateProctoring,
  } = useProctorModel()

  // TO BE REMOVED
  useEffect(() => console.log(modelStatus), [modelStatus])

  // TO BE REMOVED
  useEffect(() => {
    console.log(`someConnectionsEstablished: ${someConnectionsEstablished}`)
  }, [someConnectionsEstablished])

  // TO BE REMOVED
  useEffect(() => {
    console.log(peerConnections)
  }, [peerConnections])

  const prepared = useMemo<boolean>(() => {
    return someConnectionsEstablished && isModelLoaded
  }, [isModelLoaded, someConnectionsEstablished])

  useEffect(() => {
    if (prepared && videoEl.current && webcamStream) {
      videoEl.current!.srcObject = webcamStream
    }
  }, [webcamStream, prepared])

  useEffect(() => {
    if (prepared && videoEl.current) {
      videoEl.current.onloadeddata = () => {
        initiateProctoring(videoEl.current!!, console.log)
      }
    }
    return terminateProctoring
  }, [initiateProctoring, terminateProctoring, prepared])

  if (peerConnections.length < 1) {
    return <div>No invigilators in exam.</div>
  }

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