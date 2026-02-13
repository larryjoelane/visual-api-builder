# Visual API Builder

Visually create REST APIs through drag-and-drop table and column design. Auto-generates API endpoints, database schemas, and Swagger documentation.

## Features

- 🎨 Visual data modeling - Design tables and columns through an intuitive UI
- 🚀 Auto-generated REST APIs - Complete CRUD endpoints created automatically
- 📚 Interactive Swagger docs - Test APIs immediately via built-in Swagger UI
- 💾 SQLite database - Lightweight, file-based data storage
- ⚡ Real-time updates - Changes reflect instantly across the system
- 🔧 TypeScript full-stack - Type-safe frontend and backend

## Tech Stack

### Frontend
- **Lit.js** - Web Components
- **TypeScript** - Type safety
- **Vite** - Fast dev server and build tool

### Backend
- **Fastify** - High-performance Node.js framework
- **SQLite** (better-sqlite3) - Embedded database
- **TypeBox** - Schema validation
- **Swagger/OpenAPI** - API documentation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

The backend will start on http://localhost:3000
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/documentation

3. Start the frontend dev server:
```bash
cd frontend
npm run dev
```

The frontend will start on http://localhost:5173

## Project Structure

```
visual-api-builder/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── errors/          # Custom error classes
│   │   ├── plugins/         # Fastify plugins
│   │   │   ├── database.ts  # SQLite connection
│   │   │   └── swagger.ts   # API documentation
│   │   ├── routes/          # API routes
│   │   │   └── tables.ts    # Table/column management
│   │   ├── services/        # Business logic
│   │   │   └── schema.service.ts
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Main server file
│   ├── data/                # SQLite database (auto-created)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Lit components
│   │   │   ├── app-root.ts
│   │   │   └── designer/
│   │   │       ├── table-list.ts
│   │   │       └── table-designer.ts
│   │   ├── services/        # API client
│   │   ├── styles/          # Global styles
│   │   ├── types/           # TypeScript interfaces
│   │   └── index.ts         # Entry point
│   └── package.json
└── docs/
    └── PRD.md               # Product requirements
```

## Usage

### 1. Create a Table
- Click "New Table" in the sidebar
- Enter a table name (e.g., "users")
- Click "Create Table"

### 2. Add Columns
- Select your table from the list
- Click "Add Column"
- Configure:
  - Column name
  - Data type (string, number, boolean, etc.)
  - Required/Unique constraints
- Click "Add Column"

### 3. Test Your API
- Navigate to http://localhost:3000/documentation
- Your endpoints are auto-generated:
  - `GET /api/v1/{table}` - List all records
  - `GET /api/v1/{table}/{id}` - Get single record
  - `POST /api/v1/{table}` - Create record
  - `PUT /api/v1/{table}/{id}` - Update record
  - `DELETE /api/v1/{table}/{id}` - Delete record
- Use "Try it out" to test each endpoint

## API Examples

### Create a table
```bash
POST /api/v1/tables
Content-Type: application/json

{
  "name": "users",
  "display_name": "Users"
}
```

### Add a column
```bash
POST /api/v1/columns
Content-Type: application/json

{
  "table_id": 1,
  "name": "email",
  "data_type": "string",
  "is_required": true,
  "is_unique": true,
  "position": 0
}
```

## Development

### Backend
```bash
cd backend
npm run dev        # Start dev server with hot reload
npm run build      # Build for production
npm run start      # Start production server
npm test           # Run tests
```

### Frontend
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Supported Data Types

- **string** - Short text (VARCHAR)
- **text** - Long text (TEXT)
- **number** - Integer
- **decimal** - Floating point number
- **boolean** - True/false
- **date** - Date only
- **datetime** - Date and time

## Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
DB_PATH=./data/app.db
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
