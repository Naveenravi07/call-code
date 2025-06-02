import { z } from 'zod';

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


export type PlayGroundStatus = z.infer<typeof playGroundStatusSchema>
