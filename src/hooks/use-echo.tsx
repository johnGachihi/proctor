import { Channel, PresenceChannel, PusherPresenceChannel } from "laravel-echo/dist/channel";
import { useCallback, useEffect, useState } from "react";
import EchoClient from '../network/echo-client'


function useEchoPresence(channelName: string) {
  const [subscribers, setSubscribers] = useState([])

  const connect = useCallback(() => {
    return EchoClient.join(channelName)
    .here((users: any) => {
      setSubscribers(users)
    })
    // .joining(console.log)
    // .leaving(console.log)
  }, [channelName])

  const leave = useCallback(() => {
    EchoClient.leave(channelName)
  }, [channelName])

  const { listen, stopListening, channel } = useEcho(connect, leave)

  const onJoining = useCallback((callback: (user: User) => void) => {
    if (channel) {
      channel.joining(callback)
      console.log(channel)
    }
  }, [channel])

  return {listen, stopListening, subscribers, onJoining}
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

  return { listen, stopListening, channel }
}

export { useEchoPresence, useEchoPrivate };