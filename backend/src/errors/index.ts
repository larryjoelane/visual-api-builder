// Custom error classes for application-level errors

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'APP_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: any[]) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class DuplicateError extends AppError {
  constructor(resource: string, field: string) {
    super(409, `${resource} with this ${field} already exists`, 'DUPLICATE_ERROR');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message, 'BAD_REQUEST');
  }
}
