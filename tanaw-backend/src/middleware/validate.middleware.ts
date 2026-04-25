import { RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/response.util';

type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body'): RequestHandler {
  return (req, res, next) => {
    try {
      req[target] = schema.parse(req[target]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        sendError(res, 'Validation failed', 422, errors);
        return;
      }
      next(err);
    }
  };
}
