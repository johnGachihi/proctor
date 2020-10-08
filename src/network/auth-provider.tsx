import { LoginCredentials } from "../types/auth";

import client from './client'

// request csrf (Laravel Sanctum)
async function requestCsrf() {
  return await client.get('/sanctum/csrf-cookie')
}

async function login(credentials: LoginCredentials){
  await requestCsrf()
  return await client.post('/login', credentials)
}

async function logout() {
  return await client.get('/logout')
}

export {login, logout};