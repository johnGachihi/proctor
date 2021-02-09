import { useCallback, useState } from "react"
import useAsync from "../utils/use-async"

function useWebcam() {
  const [webcamStream, setWebcamStream] = useState<MediaStream>()
  const { run, isLoading: isWebcamAccessPending } = useAsync<MediaStream>()

  const requestWebcamStream = useCallback(async () => {
    try {
      const stream = await run(navigator.mediaDevices.getUserMedia({ video: true }))
      console.log('Stream requested')
      setWebcamStream(stream)
    } catch (error) {
      if (error.name === "NotFoundError") {
        throw Error('Please turn on your webcam')
      } else if (error.name === "NotAllowedError") {
        throw Error('Please grant webcam permissions on your browser')
      } else {
        throw error
      }
    }
  }, [run])

  const stopWebcamStream = useCallback(() => {
    setWebcamStream(webcamStream => {
      webcamStream?.getTracks().forEach(track => {
        track.stop()
      })
      return undefined
    })
  }, [])

  return {
    webcamStream,
    requestWebcamStream,
    isWebcamAccessPending,
    stopWebcamStream
  }
}

export default useWebcam