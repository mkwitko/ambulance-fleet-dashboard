import Axios, { type AxiosRequestConfig } from 'axios'
import { env } from '@/env'

export const AXIOS_INSTANCE = Axios.create({
  baseURL: env.VITE_HTTP_API_URL,
  withCredentials: true,
})

// add a second `options` argument here if you want to pass extra options to each generated query
export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig
): Promise<T> => {
  const source = Axios.CancelToken.source()
  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  })
    .then(({ data }) => data)
    .catch((error: any) => {
      console.log('API ERROR:', error)
      // if (error.) {
      //   if (error.response.status === 401 || error.response.status === 500)
      //     return
      //   toast.error(
      //     `Erro: ${error?.response?.data.message || 'Um erro ocorreu.'}`
      //   )
      // } else if (error.request) {
      //   // The request was made but no response was received
      //   // toast.error("Erro: Nenhuma resposta foi recebida.");
      // } else {
      //   // Something happened in setting up the request that triggered an Error
      //   toast.error(`Erro: ${error.message}`)
      // }
      throw error // Re-throw the error so it can be handled by the calling code
    })

  // @ts-expect-error
  promise.cancel = () => {
    source.cancel('Query was cancelled')
  }

  return promise
}
