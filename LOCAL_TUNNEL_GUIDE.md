# How to Use Local Tunnel for Remote Access

This guide explains how to expose your local Thrifty development server to the internet using `localtunnel`, allowing you to test on mobile devices or share with others.

## Prerequisites
- Both Backend and Frontend must be running locally.
- `localtunnel` is installed (already done).

## Step 1: Start the Backend Tunnel
1.  Open a **new** terminal.
2.  Run the following command:
    ```bash
    npm run tunnel:backend
    ```
3.  Copy the URL it generates (e.g., `https://shiny-pugs-run.loca.lt`).
    - **Note:** Keep this terminal open.

## Step 2: Update Frontend Configuration
1.  Open the `.env` file in the root directory.
2.  Update `VITE_API_URL` with the backend tunnel URL you just copied:
    ```env
    VITE_API_URL=https://shiny-pugs-run.loca.lt/api
    ```
    *(Make sure to append `/api` at the end)*
3.  Restart the frontend server if it's already running.

## Step 3: Start the Frontend Tunnel (Optional)
If you just want to access the frontend from your phone:
1.  Open another **new** terminal.
2.  Run the following command:
    ```bash
    npm run tunnel:frontend
    ```
3.  Copy the URL it generates (e.g., `https://calm-eagles-fly.loca.lt`).

## Step 4: Accessing the App
1.  Open the **Frontend Tunnel URL** on your mobile device or browse it from another computer.
2.  **Important:** `localtunnel` often shows a specific "Click to Continue" page on the first visit for security.
    - If you see a **404** or **Tunnel** page on the frontend, proceed.
    - If API calls fail, open the **Backend Tunnel URL** directly in your browser once and click "Click to Continue" to whitelist your IP.

## Step 5: Getting the Tunnel Password
When you visit the localtunnel URL for the first time, you may be asked for a **Tunnel Password**. This password is your public IP address.

To get it easily, run this command in a new terminal:
```bash
npm run tunnel:password
```
Copy the IP address shown (e.g., `123.45.67.89`) and paste it into the password field on the website.

## Troubleshooting
- **API Errors:** Ensure `.env` has the correct `https` URL.
- **CORS Issues:** The backend is configured to allow `*.loca.lt` by default.
- **White/Blank Screen:** Check the browser console on your device (if possible) or desktop.
