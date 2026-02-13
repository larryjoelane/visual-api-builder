# GitHub Copilot Instructions

## Project Overview
This is a full-stack application with a modern web frontend and a TypeScript-based API backend.

## Tech Stack

### Frontend
- **Framework**: Lit.js (Web Components)
- **Language**: TypeScript
- **Styling**: CSS (with CSS custom properties for theming)
- **Build Tool**: Vite

### Backend
- **Framework**: Fastify (Node.js)
- **Language**: TypeScript
- **API Documentation**: Swagger/OpenAPI (via @fastify/swagger plugin)
- **Type Safety**: Use TypeScript types throughout

## Code Style & Conventions

### Frontend (Lit.js + TypeScript)

#### Component Structure
- Use Lit 3.x decorators (`@customElement`, `@property`, `@state`, `@query`)
- Define components as TypeScript classes extending `LitElement`
- Use reactive properties for data binding
- Implement proper TypeScript types for all properties and methods

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('my-component')
export class MyComponent extends LitElement {
  @property({ type: String }) name = '';
  @state() private _count = 0;

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`<div>Hello ${this.name}</div>`;
  }
}
```

#### TypeScript Guidelines
- Use strict mode (`"strict": true` in tsconfig.json)
- Define interfaces for all data models and API responses
- Avoid `any` type - use `unknown` if type is truly unknown
- Use async/await for asynchronous operations
- Export types that are used across multiple files

#### CSS Guidelines
- Use component-scoped styles via `static styles` property
- Leverage CSS custom properties for theming and reusability
- Use semantic class names (BEM methodology recommended)
- Prefer CSS Grid and Flexbox for layouts
- Make components responsive

#### File Naming
- Component files: `kebab-case.ts` (e.g., `user-profile.ts`)
- Utility files: `camelCase.ts` (e.g., `apiClient.ts`)
- Type definition files: `*.types.ts` or `*.interface.ts`

### Backend (Fastify + TypeScript)

#### API Structure
- Use Fastify plugins to organize routes
- Implement proper schema validation with JSON Schema or TypeBox
- Define TypeScript interfaces for request/response types
- Include proper HTTP status codes and error handling

```typescript
import { FastifyPluginAsync } from 'fastify';
import { Type, Static } from '@sinclair/typebox';

const ItemCreateSchema = Type.Object({
  name: Type.String(),
  description: Type.Optional(Type.String())
});

type ItemCreate = Static<typeof ItemCreateSchema>;

const itemRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: ItemCreate }>(
    '/api/v1/items',
    {
      schema: {
        body: ItemCreateSchema,
        response: { 201: ItemSchema }
      }
    },
    async (request, reply) => {
      // Implementation
      return reply.code(201).send(item);
    }
  );
};
```

#### TypeScript Guidelines
- Use strict mode in tsconfig.json
- Define interfaces for all data models and request/response types
- Use async/await for I/O operations
- Implement proper error handling with Fastify's error handlers
- Use Fastify decorators and hooks for dependency injection

#### Object Pooling & Resource Management
- Use connection pooling for database connections (SQLite with better-sqlite3)
- Reuse expensive objects (HTTP clients, database connections, cache connections)
- Implement proper cleanup in `onClose` hooks
- For SQLite, use a single connection with proper serialization for writes

```typescript
// SQLite database connection example
import Database from 'better-sqlite3';
import { DatabaseSync } from 'node:sqlite';

// Using better-sqlite3 (recommended for synchronous operations)
const db = new Database(process.env.DB_PATH || './data/app.db', {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Register database cleanup
fastify.addHook('onClose', async () => {
  db.close();
});

// Decorate Fastify with database
fastify.decorate('db', db);

// For async operations, create a pool wrapper
class AsyncDatabase {
  constructor(private db: Database.Database) {}
  
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      try {
        const stmt = this.db.prepare(sql);
        const result = params ? stmt.all(...params) : stmt.all();
        resolve(result as T[]);
      } catch (err) {
        reject(err);
      }
    });
  }
  
  async run(sql: string, params?: any[]): Promise<Database.RunResult> {
    return new Promise((resolve, reject) => {
      try {
        const stmt = this.db.prepare(sql);
        const result = params ? stmt.run(...params) : stmt.run();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  }
}

fastify.decorate('db', new AsyncDatabase(db));
```

#### Error Handling
- Implement custom error classes for different error types
- Use Fastify's `setErrorHandler` for centralized error handling
- Log errors with appropriate context (request ID, user ID, etc.)
- Return consistent error response format
- Handle async errors with try-catch or error handlers

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

// Global error handler
fastify.setErrorHandler(async (error, request, reply) => {
  // Log error with context
  request.log.error({
    err: error,
    requestId: request.id,
    url: request.url,
    method: request.method,
  });

  // Handle known errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  // Handle validation errors
  if (error.validation) {
    return reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.validation,
      },
    });
  }

  // Handle unexpected errors
  return reply.status(500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});

// Route-level error handling
fastify.get('/api/v1/items/:id', async (request, reply) => {
  const { id } = request.params as { id: number };
  
  try {
    const item = await findItemById(id);
    if (!item) {
      throw new NotFoundError('Item');
    }
    return reply.send({ data: item });
  } catch (error) {
    // Error will be caught by global error handler
    throw error;
  }
});
```

#### Project Structure
```
backend/
├── src/
│   ├── server.ts            # Fastify app initialization
│   ├── plugins/             # Fastify plugins
│   ├── routes/              # API route handlers
│   ├── types/               # TypeScript types and schemas
│   ├── schemas/             # Request/response schemas
│   ├── services/            # Business logic
│   ├── db/                  # Database configuration, pools
│   ├── errors/              # Custom error classes
│   └── config/              # Configuration, environment
├── tests/
├── tsconfig.json
└── package.json

frontend/
├── src/
│   ├── components/          # Lit components
│   ├── services/            # API clients, utilities
│   ├── types/               # TypeScript interfaces
│   ├── styles/              # Global styles, themes
│   └── index.ts             # Entry point
├── public/
├── tsconfig.json
└── package.json
```

## API Integration

### Frontend API Calls
- Create a centralized API client service
- Use fetch API or a library like `@lit/task` for async data loading
- Handle loading, error, and success states in components
- Type all API responses with TypeScript interfaces

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
}

async function fetchItems(): Promise<Item[]> {
  const response = await fetch('/api/v1/items');
  if (!response.ok) throw new Error('Failed to fetch items');
  const result: ApiResponse<Item[]> = await response.json();
  return result.data;
}
```

### Backend CORS Configuration
- Configure CORS properly for frontend-backend communication
- Use environment variables for allowed origins

```typescript
import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: 'http://localhost:5173',  // Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
```

## Swagger/OpenAPI Documentation

### Backend
- Use @fastify/swagger and @fastify/swagger-ui plugins
- Define comprehensive schemas using TypeBox or JSON Schema
- Add tags and descriptions to routes
- Access docs at `/documentation` (Swagger UI)

```typescript
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

await fastify.register(swagger, {
  openapi: {
    info: {
      title: 'API Documentation',
      version: '1.0.0'
    }
  }
});

await fastify.register(swaggerUi, {
  routePrefix: '/documentation'
});

fastify.get<{ Params: { itemId: number } }>(
  '/api/v1/items/:itemId',
  {
    schema: {
      description: 'Retrieve a single item by its unique identifier',
      tags: ['items'],
      params: Type.Object({ itemId: Type.Number() }),
      response: {
        200: ItemSchema,
        404: ErrorSchema
      }
    }
  },
  async (request, reply) => {
    // Implementation
  }
);
```

## Testing

### Frontend
- Use Playwright for testing Lit components and user interactions
- Write unit and integration tests for components
- Test component rendering, events, and state changes
- Test accessibility and cross-browser compatibility

### Backend
- Use Playwright for API endpoint testing
- Use Fastify's built-in inject method for unit testing
- Achieve good test coverage for API endpoints and services

```typescript
import { test, expect } from '@playwright/test';

test('GET /api/v1/items returns items', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/v1/items');
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
});
```

## Best Practices

### General
- Use environment variables for configuration (`.env` files)
- Implement proper error logging with structured logging (pino for Fastify)
- Write clear, self-documenting code with meaningful names
- Add comments for complex business logic only
- Keep functions small and focused on a single responsibility
- Use object pooling for database connections and expensive resources
- Implement graceful shutdown to clean up resources properly

### Backend-Specific
- Always use connection pooling for database access
- Implement circuit breakers for external service calls
- Use request IDs for tracing requests through the system
- Set appropriate timeouts for all external calls
- Validate all inputs with schemas before processing
- Handle errors at the appropriate level (route vs global handler)
- Clean up resources in `onClose` and `onRequest` hooks

### Security
- Validate all inputs (Pydantic handles this on backend)
- Sanitize outputs to prevent XSS
- Use HTTPS in production
- Implement proper authentication/authorization
- Never commit secrets or API keys

### Performance
- Lazy load components when appropriate
- Optimize bundle sizes (code splitting)
- Use async operations for I/O
- Implement proper caching strategies
- Monitor and optimize database queries

## Version Control
- Write clear, descriptive commit messages
- Use feature branches for development
- Keep commits atomic and focused
- Include type definitions in commits

## When Generating Code

1. **Always use TypeScript** for both frontend and backend code (not JavaScript)
2. **Use strict TypeScript types** throughout the codebase
3. **Follow the component patterns** shown above
4. **Include error handling** in all async operations
5. **Add JSDoc comments** for public APIs
6. **Use semantic HTML** and ARIA attributes for accessibility
7. **Implement responsive design** from the start
8. **Write testable code** with dependency injection
9. **Follow REST principles** for API design
10. **Define TypeBox schemas** for all request/response validation
