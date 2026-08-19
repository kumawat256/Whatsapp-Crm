import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`)
  }
  return config
})

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<{ accessToken: string }>("/auth/refresh")
      .then((res) => {
        setAccessToken(res.data.accessToken)
        return res.data.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthEndpoint = config?.url?.startsWith("/auth/")

    if (error.response?.status !== 401 || !config || config._retried || isAuthEndpoint) {
      throw error
    }

    config._retried = true
    try {
      const token = await refreshAccessToken()
      config.headers.set("Authorization", `Bearer ${token}`)
      return apiClient(config)
    } catch (refreshError) {
      setAccessToken(null)
      throw refreshError
    }
  },
)
