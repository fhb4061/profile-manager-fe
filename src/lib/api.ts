import axios from 'axios'
import { userManager } from './auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// The access token is the API credential. The id_token is audience-scoped to the
// app client and is proof of authentication, not authorization — sending it would
// also leak identity claims (email, name, ...) to the API on every request.
api.interceptors.request.use(async (config) => {
  const user = await userManager.getUser()
  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`
  }
  return config
})
