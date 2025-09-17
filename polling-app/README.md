# Polling App Backend

This is a real-time polling application backend built with Node.js, Express, Prisma ORM, and PostgreSQL. It supports user registration, login, poll creation, voting, and real-time updates via WebSocket.

---

## Project Structure

- `server.js` - Entry point, sets up HTTP server and WebSocket
- `src/app.js` - Express app setup with routes and middleware
- `src/controllers/` - Controllers for users, polls, votes
- `src/routes/` - Express route definitions
- `src/middleware/auth.js` - JWT authentication middleware
- `prisma/schema.prisma` - Prisma schema defining database models
- `docker-compose.yml` - Docker setup for PostgreSQL database
- `.env` - Environment variables (not included, create manually)

---

## Prerequisites

- Node.js (v16+ recommended)
- PostgreSQL database (can use Docker or local installation)
- npm package manager

---

## Setup Instructions

1. **Clone the repository**

2. **Create `.env` file** in `polling-app/` with the following variables:

   ```
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/polling_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   ```

3. **Start PostgreSQL database**

   - Using Docker:

     ```bash
     docker-compose up -d
     ```

   - Or ensure local PostgreSQL is running and database `polling_db` exists.

4. **Install dependencies**

   ```bash
   cd polling-app
   npm install
   ```

5. **Generate Prisma client**

   ```bash
   npm run db:generate
   ```

6. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

7. **Start the server**

   ```bash
   npm run dev
   ```

---

## API Endpoints

### Health Check

- `GET /health`  
  Returns server status.

### User Routes

- `POST /api/users/register`  
  Register a new user.  
  Payload: `{ "name": "John", "email": "john@example.com", "password": "password123" }`

- `POST /api/users/login`  
  Login user.  
  Payload: `{ "email": "john@example.com", "password": "password123" }`

- `GET /api/users` (Protected)  
  Get all users. Requires `Authorization: Bearer <token>` header.

### Poll Routes

- `GET /api/polls`  
  Get all published polls.

- `GET /api/polls/:id`  
  Get poll by ID.

- `POST /api/polls` (Protected)  
  Create a poll.  
  Payload: `{ "question": "Your question?", "options": ["Option1", "Option2"], "isPublished": true }`

- `PUT /api/polls/:id` (Protected)  
  Update poll question or publish status.

### Vote Routes

- `POST /api/votes` (Protected)  
  Submit a vote.  
  Payload: `{ "pollOptionId": "option_id_here" }`

- `GET /api/votes/poll/:pollId` (Protected)  
  Get votes for a poll.

---

## Testing with Curl

1. **Register User**

```bash
curl -X POST http://localhost:3000/api/users/register \
-H "Content-Type: application/json" \
-d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

2. **Login User**

```bash
curl -X POST http://localhost:3000/api/users/login \
-H "Content-Type: application/json" \
-d '{"email":"john@example.com","password":"password123"}'
```

Save the returned JWT token for authenticated requests.

3. **Create Poll**

```bash
curl -X POST http://localhost:3000/api/polls \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <JWT_TOKEN>" \
-d '{"question":"What is your favorite color?","options":["Red","Blue","Green"],"isPublished":true}'
```

4. **Submit Vote**

```bash
curl -X POST http://localhost:3000/api/votes \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <JWT_TOKEN>" \
-d '{"pollOptionId":"<OPTION_ID>"}'
```

5. **Get Polls**

```bash
curl http://localhost:3000/api/polls
```

---

## Notes

- Replace `<JWT_TOKEN>`, `<OPTION_ID>`, and other placeholders with actual values from responses.
- Protected routes require JWT token in `Authorization` header.
- Use `npm run db:studio` to open Prisma Studio for database inspection.

---

## Dependencies (from package.json)

- express
- prisma
- @prisma/client
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- socket.io
- nodemon (dev)

---

## Prisma Schema

Located at `prisma/schema.prisma`, defines models for User, Poll, PollOption, and Vote with relations and constraints.

---

This README provides all necessary information to set up, run, and test the polling application backend.
