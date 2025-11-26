import { z } from 'zod'

const envSchema = z.object({
	VITE_WEBSOCKET: z.string(),
	VITE_HTTP_API_URL: z.string(),
	VITE_STORAGE_URL: z.string(),
	VITE_ABLY_API_KEY: z.string(),
})

export const env = envSchema.parse(import.meta.env)
