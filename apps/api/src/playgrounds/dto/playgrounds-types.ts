import { z } from 'zod'

export const playgroundTypesSchema = z.enum(["vite","nextjs"])

export type PlaygroundTypes = z.infer<typeof playgroundTypesSchema>
