import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: ZodSchema) { }

    transform(value: any, metadata: ArgumentMetadata) {
        if (!this.schema) return value;

        const parsed = this.schema.safeParse(value);

        if (parsed.success) {
            return parsed.data;
        }
        const issues = parsed.error.issues;

        const message = issues
            .map((issue) => {
                const path = issue.path.join('.') || '[root]';
                return `${path} - ${issue.message}`;
            })
            .join('; ');

        throw new BadRequestException(`Validation failed: ${message}`);
    }
}

