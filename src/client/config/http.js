import axios from 'axios'
import { storage } from '@/config'

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', //TODO: deployment link
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Origin': '*',
  },
})

instance.interceptors.request.use((config) => {
  const TOKEN = storage.get('token')
  config.headers['Authorization'] = `Bearer ${TOKEN}`

  return config
})

export const http = {
  get: (url) => instance.get(url).then((response) => response.data),
  post: (url, data = {}) => instance.post(url, data).then((response) => response.data),
  put: (url, data = {}) => instance.put(url, data).then((response) => response.data),
  delete: (url) => instance.delete(url).then((response) => response.data),
}
