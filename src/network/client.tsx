import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const client = axios.create({
  baseURL: `${apiUrl}/api`,
  withCredentials: true,
});

client.interceptors.response.use(response => response.data);

client.interceptors.response.use(
  response => response,
  error =>
    error.response?.status === 401
      ? Promise.reject({ unauthenticated: true })
      : Promise.reject(error)
);

/* If request returns with 422 (invalid data submission)
  fields with errors will be in `error.fields`
  e.g, `error.fields.email` gives array of errors */
client.interceptors.response.use(
  response => response,
  error =>
    error.response?.status === 422
      ? Promise.reject({ fields: error.response?.data?.errors })
      : Promise.reject(error)
);

export default client;
