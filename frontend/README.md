# M Intergraph - CRM & Tender Management (Full-Stack)

This is a full-stack MERN (MongoDB, Express, React, Node.js) application. The frontend is built with React and TypeScript, and the backend is a Node.js/Express server connected to a MongoDB database.

## Project Structure

- **`/` (Root Directory):** Contains the React frontend application.
- **`/backend`:** Contains the Node.js, Express, and MongoDB backend server.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally, or a connection string for a cloud instance (like MongoDB Atlas).

## Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create Environment File:**
    Create a file named `.env` in the `/backend` directory and add your MongoDB connection string and a port number.

    ```env
    PORT=5001
    MONGO_URI=mongodb://127.0.0.1:27017/mintergraph
    ```
    *Replace `MONGO_URI` with your actual MongoDB connection string if it's different.*

4.  **Seed the Database (One-time setup):**
    To populate the database with the initial set of mock data, run the seed script.
    
    **Import data:**
    ```bash
    npm run seed:import
    ```

    You can also destroy all data using `npm run seed:destroy` if needed.

## Frontend Setup

1.  **Navigate to the root directory:**
    (If you are in the `backend` directory, go back: `cd ..`)

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

You need to run two separate commands in two separate terminal windows.

1.  **Terminal 1: Start the Backend Server**
    ```bash
    # In the /backend directory
    npm run dev
    ```
    The backend server will start (usually on `http://localhost:5001`).

2.  **Terminal 2: Start the Frontend Development Server**
    ```bash
    # In the / (root) directory
    npm start
    ```
    The React application will start and open in your browser (usually on `http://localhost:3000`). The frontend is configured to make API calls to your backend server.
