import Echo from "laravel-echo";
import { useCallback, useEffect, useMemo, useState } from "react";
import useAsync from "../utils/use-async";
import Pusher from "pusher-js";
import client from "../network/client";
import { PusherPresenceChannel } from 'laravel-echo/src/channel'

function useEcho(channel: string) {
  const { run, isLoading } = useAsync();
  const [subscribers, setSubscribers] = useState<any[]>([]);

  /* const echo = useMemo(() => {
    const authRequest = (data: any) =>
      run(client.post("/broadcasting/auth", data));

    const echo = initEcho(authRequest)
    console.log('Echo123', echo)
    return echo
  }, []); */

  useEffect(() => {
    console.log('Register echo callbacks')
    // if (echo) {
      const authRequest = (data: any) =>
      run(client.post("/broadcasting/auth", data));

      const _echo = initEcho(authRequest)
      console.log('eecho', _echo)

      const _channel = _echo
        .join(channel)
        // .here((users: any) => {
        //   console.log('In use-echo', users)
        //   setSubscribers((subscribers) => [...subscribers, ...users]);
        // })
        // console.log(_channel)
        // .joining((user: any) => {
        //   console.log('In use-echo', user)
        //   setSubscribers((subscribers) => [...subscribers, user]);
        // })
        // .leaving((user: any) => {
        //   setSubscribers((subscribers) =>
        //     subscribers.filter((s: any) => s.id !== user.id)
        //   )
        // })
        // @ts-ignore
        // .listen('PeerConnectionOffer', (msg: any) => console.log('In use-echo'));
        // _channel.listen('PeerConnectionOffer', console.log);
        // _echo.listen(`presence-${channel}`, 'PeerConnectionOffer', console.log)
        // console.log('channels', _echo.connector.presenceChannel(channel).listen('presence-proctors.Meaxq', 'PeerConnectionOffer', console.log))
    // }

    // return () => _echo.leave(channel);
  }, [channel]);

  /* const listen = useCallback(
    (event: string, onReceiveMessage: (message: any) => void) => {
      echo.listen(channel, event, onReceiveMessage);
    },
    [channel, echo]
  );

  const leave = useCallback(() => echo.leave(channel), [echo, channel]); */

  return { subscribers, isLoading,/*  listen, leave */ };
}

function useEchoPrivate(channel: string) {
  const { run, isLoading } = useAsync();

  const echo = useMemo(() => {
    const authRequest = (data: any) =>
      run(client.post("/broadcasting/auth", data));

      const echo = initEcho(authRequest);
    return echo
  }, [run]);

  function listen(event: string, callback: (message: any) => void) {
    echo.listen(channel, event, callback)
  }

  return { isLoading, listen }
}

type AuthRequestData = {
  socket_id: any;
  channel_name: any;
};
function initEcho(authRequest: (data: AuthRequestData) => void) {
  const authorizer = (channel: any) => {
    const authorize = (socketId: any, callback: any) => {
      try {
        const res = authRequest({
          socket_id: socketId,
          channel_name: channel.name,
        });
        callback(false, res);
      } catch (error) {
        callback(true, error);
      }
    };

    return { authorize: authorize };
  };

  // @ts-ignore
  window.Pusher = Pusher;

  return new Echo({
    broadcaster: "pusher",
    key: process.env.REACT_APP_PUSHER_APP_KEY,
    cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
    encrypted: true,
    authorizer: authorizer,
  });
}

export default useEcho;
export { useEchoPrivate }
