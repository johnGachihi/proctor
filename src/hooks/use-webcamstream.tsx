import useAsync from '../utils/use-async'

type R = {
  getWebcamStream: () => (Promise<MediaStream | undefined>),
  webcamStream: MediaStream
}

function useWebcamStream(): R {
  const { run, data: webcamStream } = useAsync()

  const getWebcamStream = async () => {
    try {
      return await run(navigator.mediaDevices.getUserMedia({ video: true }))
    } catch (error) {
      if (error.name === "NotFoundError") {
        throw Error('Please turn on your webcam')
      } else if (error.name === "NotAllowedError") {
        throw Error('Please grant webcam permissions on your browser')
      }
    }
  }
    
  return { webcamStream, getWebcamStream }
}

export default useWebcamStream