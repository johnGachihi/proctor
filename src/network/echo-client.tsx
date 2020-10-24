import Echo from 'laravel-echo'
import client from './client'
import Pusher from 'pusher-js'

const authorizer = (channel: any) => {
  const authorize = async (socketId: any, callback: any) => {
    try {
      const data = await client.post("/broadcasting/auth", {
        socket_id: socketId,
        channel_name: channel.name,
      })
      callback(false, data);
    } catch (error) {
      callback(true, error)
    }
  };
  return { authorize: authorize };
};

// @ts-ignore
window.Pusher = Pusher

const EchoClient = new Echo({
  broadcaster: "pusher",
  key: process.env.REACT_APP_PUSHER_APP_KEY,
  cluster: process.env.REACT_APP_PUSHER_APP_CLUSTER,
  encrypted: true,
  authorizer: authorizer,
})

export default EchoClient