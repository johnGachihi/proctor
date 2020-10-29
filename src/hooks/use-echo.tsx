import { Channel, PresenceChannel } from "laravel-echo/dist/channel";
import { useCallback, useEffect, useState } from "react";
import EchoClient from '../network/echo-client'


function useEchoPresence(channel: string) {
  const [subscribers, setSubscribers] = useState([])

  const connect = useCallback(() => {
    return EchoClient.join(channel)
    .here((users: any) => {
      setSubscribers(users)
    })
    .joining(console.log)
    .leaving(console.log)
  }, [channel])

  const leave = useCallback(() => {
    EchoClient.leave(channel)
  }, [channel])

  const { listen, stopListening } = useEcho(connect, leave)

  return {listen, stopListening, subscribers}
}

function useEchoPrivate(channel: string) {
  const connect = useCallback(() => EchoClient.private(channel), [channel])
  const leave = useCallback(() => EchoClient.leave(channel), [channel])

  return useEcho(connect, leave)
}

function useEcho(connect: () => Channel | PresenceChannel, leave: () => void) {
  const [channel, setChannel] = useState<any>()
  
  useEffect(() => {
    const channel = connect()
    setChannel(channel)

    return leave
  }, [connect, leave])

  const listen = useCallback(
    (event: string, callback: (message: any) => any) => {
      if (channel) {
        channel.listen(event, callback)
      }
    },
    [channel]
  )

  const stopListening = useCallback((event: string) => {
    if (channel) {
      channel.stopListening(event)
    }
  }, [channel])

  return { listen, stopListening }
}

export { useEchoPresence, useEchoPrivate };