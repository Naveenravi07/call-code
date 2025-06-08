import { z } from 'zod';
import { constants } from '@repo/shared-config';

export const playgroundTypesSchema = z.enum(constants.playground.meetingTypes.map(type => type.id) as [string, ...string[]]);

export type PlaygroundTypes = z.infer<typeof playgroundTypesSchema>;
