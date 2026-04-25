import multer, { MulterError } from 'multer';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { sendError } from '../utils/response.util';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB per image
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

const imageFileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    return;
  }
  cb(null, true);
};

const baseUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: imageFileFilter,
});

function handleMulterErrors(inner: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    inner(req, res, (err: unknown) => {
      if (err instanceof MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return sendError(res, 'Image exceeds 8MB limit', 413);
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return sendError(res, 'Only JPEG and PNG images are allowed', 415);
        }
        return sendError(res, err.message, 400);
      }
      if (err) return next(err);
      next();
    });
  };
}

export function uploadSingleImage(fieldName: string): RequestHandler {
  return handleMulterErrors(baseUpload.single(fieldName));
}

export function uploadManyImages(fieldName: string, maxCount: number): RequestHandler {
  return handleMulterErrors(baseUpload.array(fieldName, maxCount));
}
