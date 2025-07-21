import { z } from 'zod';
import { PlaygroundType } from './constants';
export { PlaygroundType };

export const playgroundTypesSchema = z.nativeEnum(PlaygroundType);

const jobPhases = z.enum(['Pending', 'Running', 'Succeeded', 'Failed', 'Unknown']).optional()
export type JobPhases = z.infer<typeof jobPhases>


export const jobStatusSchema = z.object({
    ready: z.boolean(),
    phase: jobPhases,
    lastUpdated: z.string().datetime(),
    podName: z.string().optional(),
});

export const serviceStatusSchema = z.object({
    ready: z.boolean(),
    lastUpdated: z.string().datetime(),
});

export const virtualServiceSchema = z.object({
    ready: z.boolean(),
    hosts: z.array(z.string()),
    lastUpdated: z.string().datetime(),
});

export const playGroundStatusSchema = z.object({
    job: jobStatusSchema,
    service: serviceStatusSchema,
    virtual_service: virtualServiceSchema,
    ready: z.boolean(),
    statusHistory: z.array(z.string()), 
    updateCount: z.number(),
    lastChecked: z.string().datetime(), 
});
export type PlayGroundStatus = z.infer<typeof playGroundStatusSchema>;


export const playGroundCreationResponseSchema = z.object({
    session_name: z.string(),
    status: playGroundStatusSchema
})
export type PlaygroundCreationResponse = z.infer<typeof playGroundCreationResponseSchema>


export const createPlaygroundSchema = z.object({
    playground: playgroundTypesSchema,
});
export type CreatePlayground = z.infer<typeof createPlaygroundSchema>; 

