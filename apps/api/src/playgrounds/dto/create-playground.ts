import {z} from 'zod'
import { playgroundTypesSchema } from './playgrounds-types'


export const createPlaygroundSchema = z.object({
    playground: playgroundTypesSchema,
})


export type CreatePlayground = z.infer<typeof createPlaygroundSchema>
