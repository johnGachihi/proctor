import { Channel, PresenceChannel } from "laravel-echo/dist/channel";
import { useCallback, useEffect, useState } from "react";
import EchoClient from '../network/echo-client'


function useEchoPresence(channelName: string) {
  const [subscribers, setSubscribers] = useState<any[]>([])

  const connect = useCallback(() => {
    return EchoClient.join(channelName)
    .here((users: any) => {
      setSubscribers(users)
    })
    .joining((subscriber: any) => {
      setSubscribers(subscribers => [...subscribers, subscriber])
    })
    .leaving((subscriber: any) => {
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
      channel.subscription.bind('pusher:member_added', callback)
    }
  }, [channel])

  const onJoiningStop = useCallback((callback: Function) => {
    if (channel) {
      channel.subscription.unbind('pusher:member_added', callback)
    }
  }, [channel])

  const onLeaving = useCallback((callback: (user: User) => void) => {
    if (channel) {
      channel.subscription.bind('pusher:member_removed', callback)
    }
  }, [channel])

  const onLeavingStop = useCallback((callback: Function) => {
    if (channel) {
      channel.subscription.unbind('pusher:member_removed', callback)
    }
  }, [channel])

  return {
    listen,
    stopListening,
    subscribers,
    onJoining,
    onJoiningStop,
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