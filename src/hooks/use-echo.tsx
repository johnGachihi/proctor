import { PresenceChannel } from "pusher-js";
import { useCallback, useEffect, useState } from "react";
import EchoClient from '../network/echo-client'


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

  const listen = useCallback((event: string, callback: (message: any) => any) => {
    if (presenceChannel) {
      presenceChannel.listen(event, callback)
    }
  },[presenceChannel])

  return { subscribers, listen };
}

export { useEchoPresence };