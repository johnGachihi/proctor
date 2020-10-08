import axios from 'axios';

const client = axios.create({
  baseURL: 'proctor.local',
  withCredentials: true,
})

export default client;