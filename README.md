# CSCI499-hangout_planner
Hangout Planner is a web application that allows users to create, plan, and manage hangout events with friends. Users can sign up, log in, and securely manage their events. The app uses JWT authentication, React on the frontend, and Node.js with PostgreSQL on the backend.
## Features
  ### 🔐 Authentication
- Secure user registration and login
- JWT (JSON Web Token) based session management
- Password encryption using bcrypt

### 🗓️ Event Planning
- Create hangout plans with title, description, date, time, and location
- Automatically creates groups when users are invited
- Dashboard to view:
  - Upcoming events
  - Pending invitations
  - Confirmed plans

### 🗳️ Voting System
- Invitees can suggest activities
- Vote on dates and times
- Real-time vote tracking

### 📧 Email Invitations
- Automated email invites to participants
- Personalized invitation links

### ⚙️ Smart Final Decision Generator
- Automatically selects best time based on group availability
- Chooses the most popular activity

### ✅ Final Decision Notifications
- Users receive notifications when events are finalized
- Ability to confirm or decline attendance

### 🗓️ Calendar View
- Displays pending and confirmed events
- Personal schedule overview

### 🌍 Explore Tab (Community Feed)
- Create, edit, and delete hangout idea posts (full CRUD)
- Like and comment on posts
- Search posts by title, tags, location, and keywords
- Sort posts by:
  - Newest
  - Oldest
  - Most liked
  - Most commented

### 📸 Memories Tab
- Upload images from hangouts
- Add notes and reflections
- Associate memories with specific events
- Personal timeline of past hangouts

### 💬 Group Chat
- Live, real-time chat for event participants
- Enables quick coordination
- Note: Messages are not currently persisted

### 🔔 Reminders & Notifications
- Automated reminders for users who haven’t voted
- Notifications for upcoming hangouts
  
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
FRONTEND_URL=http://localhost:5173  
EMAIL_USER=letsgo.noreply.bot@gmail.com  
EMAIL_PASSWORD=pwfp mbjc sxpd fhag  

## finally run npm start in ur terminal
npm start --> to start server on localhost:3001

## some postgres stuff
Now you can go inside models directory and create the tables in your postgres.

To login to postgres:  
Psql -U postgres  
\l —> to see all dbs  
\c nameof db → to connect to db  
\d  name of table -> to see the constraints of the table

To update on a EC2 instance\
To begin, close the back end first. So start of with doing pm2 status\
then do pm2 delete followed by the name of the status to close.\
And also pm2 flush to clear logs if you want.\
Upload the new files with github.\
Cd into the server folder, and run \
pm2 start npm --name "server" -- start\
After CD back into the client folder and instead of npm run dev, we do npm run build.\
Then update nginx by doing: Sudo systemctl restart nginx
