import { z } from 'zod';
import { playgroundList } from './constants';

export const playgroundTypesSchema = z.enum(playgroundList.map(type => type.id) as [string, ...string[]]);
export type PlaygroundTypes = z.infer<typeof playgroundTypesSchema>;

export const jobStatusSchema = z.object({
    ready: z.boolean(),
    status: z.string(),
    phase: z.enum(['Pending', 'Running', 'Succeeded', 'Failed', 'Unknown']).optional(),
    reason: z.string().optional(),
    error: z.string().nullable().optional(),
    lastUpdated: z.string().datetime(),
    podName: z.string().optional(),
});

export const serviceStatusSchema = z.object({
    ready: z.boolean(),
    status: z.string(),
    error: z.string().nullable().optional(),
    lastUpdated: z.string().datetime(),
});

export const virtualServiceSchema = z.object({
    ready: z.boolean(),
    hosts: z.array(z.string()),
    error: z.string().nullable().optional(),
    lastUpdated: z.string().datetime(),
});

export const playGroundStatusSchema = z.object({
    job: jobStatusSchema,
    service: serviceStatusSchema,
    virtual_service: virtualServiceSchema,
    statusHistory: z.array(z.string()), 
    overallStatus: z.enum(['Initializing', 'Running', 'Ready', 'Failed', 'Deleted']),
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

