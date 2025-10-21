# CSCI499-hangout_planner
Hangout Planner is a web application that allows users to create, plan, and manage hangout events with friends. Users can sign up, log in, and securely manage their events. The app uses JWT authentication, React on the frontend, and Node.js with PostgreSQL on the backend.
## Features
- User registration and login (JWT authentication)
- Create and manage events
- Invite friends via email
- Dashboard to view upcoming hangouts
- Responsive UI built with React and Tailwind
## Tech Stack
- **Frontend:** React, TailwindCSS, React Router, React Hook Form
- **Backend:** Node.js, Express.js, bcrypt, JWT
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Other:** VS Code, Git, npm
## Getting Started
Aight time for the good part 

### Prerequisites
- Node.js v18+ 
- PostgreSQL installed and running
- npm or yarn

step 1: create a folder (u can call it capstone or whatever)  
step 2: git clone the repo  
step 3: cd CSCI499-hangout_planner  

### Frontend setup
To run the frontend:  
cd client  
npm i - to install all dependencies  
npm run dev  - to start localhost5173  
### Backend Setup
To run the backend:  
open another terminal simultaneously 
Navigate to the `server` folder:  
cd server  
npm i - to install dependencies  

## Inside the server directory 
Create a .env file (copy from .env.example) and add your PostgreSQL credentials and JWT secret: 

PGDATABASE=hangout_planner  
PGHOST=localhost  
PGPORT=5432  
PGUSER=postgres  
PGPASSWORD=yourpassword  
JWT_SECRET=yourjwtsecret  

## finally run npm start in ur terminal
npm start --> to start server on localhost:3001

## some postgres stuff
Now you can go inside models directory and create the tables in your postgres.

To login to postgres:  
Psql -U postgres  
\l —> to see all dbs  
\c nameof db → to connect to db  
\d  name of table -> to see the constraints of the table
