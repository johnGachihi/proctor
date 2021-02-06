/** @jsx jsx */
import { jsx } from '@emotion/core'
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { usePeerConnection } from '../../hooks/use-peerconnection'
import useProctorModel from '../../hooks/use-ml-model'
import { FullPageErrorFallback, FullPageMessage, FullPageSpinner } from '../../components/lib'
import { Body1 } from '@material/react-typography'
import { Button } from '@material/react-button'


type Props = PropsWithChildren<{
  webcamStream?: MediaStream
  requestWebcamStream: () => void
  stopWebcamStream: () => void
}>

function ExamRoom({ webcamStream, requestWebcamStream, stopWebcamStream }: Props) {
  const { user } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  const videoEl = useRef<HTMLVideoElement>(null)

  const [isCheating, setIsCheating] = useState<boolean>(false)

  const {
    peerConnections,
    // sendProctoringMessage,
    someConnectionsEstablished,
    membersInExam,
    pendingConnections,
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
    console.log(`ExamRoom: someConnectionsEstablished: ${someConnectionsEstablished}`)
  }, [someConnectionsEstablished])

  // TO BE REMOVED
  useEffect(() => {
    console.log(peerConnections)
  }, [peerConnections])

  // TO BE REMOVED
  useEffect(() => {
    if (pendingConnections.length > 0) {
      console.log('ExamRoom: Connecting to:', pendingConnections)
    } else {
      console.log('ExamRoom: No pending connections')
    }
    console.log('ExamRoom:', peerConnections)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingConnections])

  useEffect(() => {
    if (! webcamStream) {
      requestWebcamStream()
    }
  }, [requestWebcamStream, webcamStream])

  useEffect(() => {
    return () => {
      stopWebcamStream()
    }
  }, [stopWebcamStream])

  const prepared = useMemo<boolean>(() => {
    return someConnectionsEstablished && isModelLoaded
  }, [isModelLoaded, someConnectionsEstablished])

  // TO BE REMOVED
  useEffect(() => {
    console.log('ExamRoom: prepared', prepared)
  }, [prepared])

  useEffect(() => {
    if (prepared && videoEl.current && webcamStream) {
      console.log('ExamRoom: showing videoStream', prepared)
      videoEl.current!.srcObject = webcamStream
    }
  }, [webcamStream, prepared])

  const isConnectionsPending = useMemo(() => {
    return pendingConnections.length > 0
  }, [pendingConnections])

  useEffect(() => {
    const onPredict = (result: any) => {
      // console.log(result[0])
      setIsCheating(result[0] < 0.5)
    }
    if (prepared && videoEl.current) {
      videoEl.current.onloadeddata = () => {
        if (isConnectionsPending) {
          initiateProctoring(videoEl.current!!, onPredict, 'slow')
        } else {
          initiateProctoring(videoEl.current!!, onPredict)
        }
      }
    }
    return terminateProctoring
  }, [initiateProctoring, terminateProctoring, prepared, isConnectionsPending])

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
    <div
      css={{
        height: '100vh',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        css={{
          width: 'calc(100vw - 40px)',
          position: 'absolute',
          top: 0,
          padding: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isCheating ? 'red' : '',
        }}
      >
        <Body1 css={{ margin: 0 }}>Exam in Session</Body1>
        <Button outlined>Leave Exam</Button>
      </div>
      <video
        autoPlay
        ref={videoEl}
        width="350"
        css={{
          alignSelf: 'center',
          borderRadius: '10px'
        }}
      ></video>
    </div>
  )
}

export default ExamRoom