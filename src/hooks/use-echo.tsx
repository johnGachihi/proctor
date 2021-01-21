import { Channel, PresenceChannel } from "laravel-echo/dist/channel";
import { useCallback, useEffect, useState } from "react";
import EchoClient from '../network/echo-client'


function useEchoPresence(channelName: string) {
  const [subscribers, setSubscribers] = useState<any[]>([])

  useEffect(() => {
    console.log(`useEchoPresence: Subscribers`, subscribers)
  }, [subscribers])

  const connect = useCallback(() => {
    return EchoClient.join(channelName)
    .here((users: any) => {
      setSubscribers(users)
    })
    .joining((subscriber: any) => {
      console.log('useEchoPresence: joining', subscriber)
      setSubscribers(subscribers => [...subscribers, subscriber])
    })
    .leaving((subscriber: any) => {
      console.log('useEchoPresence: leaving', subscriber)
      setSubscribers(subscribers => {
        return subscribers.filter(_subscriber => _subscriber.id !== subscriber.id)
      })
    })
  }, [channelName])

  const leave = useCallback(() => {
    EchoClient.leave(channelName)
  }, [channelName])

  const { listen, stopListening, channel } = useEcho(connect, leave)

  const onJoining = useCallback((callback: (user: User) => void) => {
    if (channel) {
      channel.joining(callback)
    }
  }, [channel])

  const onLeaving = useCallback((callback: (user: User) => void) => {
    if (channel) {
      channel.leaving(callback)
    }
  }, [channel])

  const onLeavingStop = useCallback(() => {
    if (channel) {
      channel.stopListening('.pusher:member_removed')
    }
  }, [channel])

  return {
    listen,
    stopListening,
    subscribers,
    onJoining,
    onLeaving,
    onLeavingStop
  }
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
    console.log('useEcho: Connecting to channel')
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