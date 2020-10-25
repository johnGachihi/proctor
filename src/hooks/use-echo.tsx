import { Channel } from "laravel-echo/dist/channel";
import { useCallback, useEffect, useState } from "react";
import EchoClient from '../network/echo-client'

// TODO: Use useEcho to build this
function useEchoPresence(channel: string) {
  const [subscribers, setSubscribers] = useState([])
  const [presenceChannel, setPresenceChannel] = useState<any>()

  useEffect(() => {
    const presenceChannel = EchoClient.join(channel)
      .here((users: any) => {
        setSubscribers(users)
      })
      .joining(console.log)
      .leaving(console.log)
    
    setPresenceChannel(presenceChannel)

    return () => EchoClient.leave(channel);
  }, [channel]);

  const listen = useCallback(
    (event: string, callback: (message: any) => any) => {
      if (presenceChannel) {
        presenceChannel.listen(event, callback)
      }
    },
    [presenceChannel]
  )

  const stopListening = useCallback((event: string) => {
    if (presenceChannel) {
      presenceChannel.stopListening(event)
    }
  }, [presenceChannel])

  return { subscribers, listen, stopListening };
}

// TODO: Use useEcho to build this
function useEchoPrivate(channel: string) {
  const [privateChannel, setPrivateChannel] = useState<any>()
  
  useEffect(() => {
    const privateChannel = EchoClient.private(channel)
    setPrivateChannel(privateChannel)

    return () => EchoClient.leave(channel)
  }, [channel, setPrivateChannel])

  const listen = useCallback(
    (event: string, callback: (message: any) => any) => {
      if (privateChannel) {
        privateChannel.listen(event, callback)
      }
    },
    [privateChannel]
  )

  const stopListening = useCallback((event: string) => {
    if (privateChannel) {
      privateChannel.stopListening(event)
    }
  }, [privateChannel])

  return { listen, stopListening }
}

// useEcho usage example
/* function useEchoExample(channelName: string) {
  const connect = useCallback(() => {
    return EchoClient.private(channelName)
  }, [channelName])

  const leave = useCallback(() => {
    return EchoClient.leave(channelName)
  }, [channelName])

  return useEcho(connect, leave)
} */

function useEcho(connect: () => Channel, leave: () => void) {
  const [channel, setChannel] = useState<any>()
  
  useEffect(() => {
    const channel = connect()
    setChannel(channel)

    return leave
  }, [channel, connect, leave])

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