import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { usePeerConnection } from '../../hooks/use-peerconnection'
import useProctorModel from '../../hooks/use-ml-model'
import { FullPageErrorFallback, FullPageMessage, FullPageSpinner } from '../../components/lib'


type Props = PropsWithChildren<{
  webcamStream?: MediaStream
  requestWebcamStream: () => void
}>

function ExamRoom({ webcamStream, requestWebcamStream }: Props) {
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  const videoEl = useRef<HTMLVideoElement>(null)

  const {
    peerConnections,
    // sendProctoringMessage,
    someConnectionsEstablished,
    membersInExam
  } = usePeerConnection(code, webcamStream! /*Look into this*/, user)

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

  useEffect(() => {
    if (! webcamStream) {
      requestWebcamStream()
    }
  }, [requestWebcamStream, webcamStream])

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

  const presentProctors = useMemo(() => {
    return membersInExam.filter(member => member.role === 'proctor')
  }, [membersInExam])

  if (isModelLoadingError) {
    return <FullPageErrorFallback error={modelLoadingError} />
  }

  if (presentProctors.length < 1) {
    return <FullPageMessage message="No invigilators in exam!"/>
  }

  if (isModelLoading) {
    return <FullPageSpinner />
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