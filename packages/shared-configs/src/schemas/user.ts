import { z } from 'zod';

const jwtUserSchema = z.object({
    id: z.string(),
    name:z.string(),
    email:z.string(),
    pfp:z.string().nullable()
})
export type JwtUser = z.infer<typeof jwtUserSchema> 