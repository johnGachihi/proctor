import { useState } from "react"
import useAsync from "../utils/use-async"

function useWebcam() {
  const [webcamStream, setWebcamStream] = useState<MediaStream>()
  const { run, isLoading: isWebcamAccessPending } = useAsync<MediaStream>()

  const requestWebcamStream = async () => {
    try {
      const stream = await run(navigator.mediaDevices.getUserMedia({ video: true }))
      setWebcamStream(stream)
    } catch (error) {
      if (error.name === "NotFoundError") {
        throw Error('Please turn on your webcam')
      } else if (error.name === "NotAllowedError") {
        throw Error('Please grant webcam permissions on your browser')
      }
    }
  }

  return { webcamStream, requestWebcamStream, isWebcamAccessPending }
}

export default useWebcam