import type { RequestHandler } from 'express';
import { z } from 'zod';
import { HttpError } from './error-handler.js';

// Replaces req.body with the parsed (trimmed, normalized) data, or responds 400.
export function validateBody(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new HttpError(400, 'Validation failed', z.flattenError(result.error)));
      return;
    }
    req.body = result.data;
    next();
  };
}
