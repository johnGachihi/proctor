import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/auth-context'
import { usePeerConnection } from '../../hooks/use-peerconnection'
import getModel from '../../ml-models/get-model'
import * as tf from '@tensorflow/tfjs'


type Props = PropsWithChildren<{
  webcamStream: MediaStream;
}>

function ExamRoom({ webcamStream }: Props) {
  const { user, logout } = useAuth()
  //@ts-ignore
  const { code } = useParams()
  const {
    peerConnections,
    sendProctoringMessage
  } = usePeerConnection(code, webcamStream, user)
  const videoEl = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoEl && webcamStream) {
      videoEl.current!.srcObject = webcamStream
    }
  }, [videoEl, webcamStream])

  useEffect(() => {
    console.log(peerConnections)
  }, [peerConnections])

  useEffect(() => {
    const intervalId = setInterval(() => {
      sendProctoringMessage('Possibly cheating')
    }, 2000)

    let flag = true

    getModel('custom-model').then(async model => {
      console.log('Model loaded')
      if (videoEl) {
        const webcam = await tf.data.webcam(videoEl.current!)
        while (flag) {
          const img = await webcam.capture()
          const result = await model?.classify(img)
          console.log(result)
          sendProctoringMessage(JSON.stringify(result))
          img.dispose()
          await tf.nextFrame()
        }
        model?.dispose()
      }
    })

    return () => {
      clearInterval(intervalId)
      flag = false
    }
  }, [sendProctoringMessage])

  return (
    <div>
      <span>Exam Room</span>
      <button onClick={logout}>Logout</button>
      <video
        autoPlay
        ref={videoEl}
        width="150"
        height="150"
      ></video>
    </div>
  )
}

export default ExamRoom