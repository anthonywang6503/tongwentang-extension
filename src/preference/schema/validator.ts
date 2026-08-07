import type { ZodType } from 'zod';

export const vldFn = (schema: ZodType) => (data: unknown) => schema.safeParse(data).success;
