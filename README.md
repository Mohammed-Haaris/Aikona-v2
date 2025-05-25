# Aikona - AI Emotional Support Companion

Aikona is an emotion-aware web application that provides AI-powered emotional support and understanding using the Groq API.

## Project Structure

- `frontend/`: React/Vite application
- `backend/`: Node.js/Express server
- `render.yaml`: Render deployment configuration

## Local Development

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with:
```
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm start
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Deployment

This project is configured for deployment on Render.com using the `render.yaml` configuration.

### Deployment Steps

1. Push your code to GitHub
2. Create a new account on Render.com
3. Connect your GitHub repository
4. Create two services:

#### Backend Service
- Type: Web Service
- Name: aikona-backend
- Environment: Node
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`
- Environment Variables:
  * GROQ_API_KEY
  * NODE_ENV=production
  * PORT=5000
  * FRONTEND_URL=(frontend URL after deployment)

#### Frontend Service
- Type: Static Site
- Name: aikona-frontend
- Build Command: `cd frontend && npm install && npm run build`
- Publish Directory: `frontend/dist`
- Environment Variables:
  * VITE_BACKEND_URL=(backend URL after deployment)

## Environment Variables

### Backend (.env)
- PORT: Server port (default: 5000)
- GROQ_API_KEY: Your Groq API key
- FRONTEND_URL: Frontend application URL
- NODE_ENV: Environment (development/production)

### Frontend (.env)
- VITE_BACKEND_URL: Backend API URL 