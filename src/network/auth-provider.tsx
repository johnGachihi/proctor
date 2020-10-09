import { LoginCredentials } from "../types/auth";
import client from './client'
const apiUrl = process.env.REACT_APP_API_URL

// request csrf (Laravel Sanctum)
async function requestCsrf() {
  return await client.get(`${apiUrl}/sanctum/csrf-cookie`)
}

async function login(credentials: LoginCredentials){
  await requestCsrf()
  await client.post(`${apiUrl}/login`, credentials)
  return await client.get('me')
}

async function logout() {
  return await client.get('logout')
}

export {login, logout};