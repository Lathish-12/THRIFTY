# Quick Start Guide: Running Thrifty Locally

You can run the entire project (Frontend + Backend) using a single command, or run them individually.

## Option 1: The Easy Way (One Command)
Run this command in the root `THRIFTY` folder:

```bash
npm run dev:all
```
*This starts both the React frontend and Django backend at the same time.*

## Option 2: The Manual Way (Separate Terminals)

**1. Start the Backend**
Open a terminal and run:
```bash
cd backend
.venv\Scripts\Activate
python manage.py runserver
```
*Server runs at: `http://localhost:8000`*

**2. Start the Frontend**
Open a **new** terminal and run:
```bash
npm run dev
```
*App runs at: `http://localhost:5173`*

## Configuration Check
Ensure your `.env` file in the root folder connects to localhost:
```env
VITE_API_URL=http://localhost:8000/api
```
*(If you were using a tunnel URL, change it back to the above line for local development)*
