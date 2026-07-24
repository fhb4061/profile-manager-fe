import axios from 'axios'
import { userManager } from './auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use(async (config) => {
  const user = await userManager.getUser()
  if (user?.id_token) {
    config.headers.Authorization = `Bearer ${user.id_token}`
  }
  return config
})
