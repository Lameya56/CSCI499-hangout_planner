# CSCI499-hangout_planner
Hangout Planner is a full-stack web application designed to simplify social coordination by helping users plan, organize, and manage hangouts with friends. Users can create events, invite friends, vote on activities and dates, and stay updated with real-time notifications. The platform also encourages community engagement through an Explore tab, where users can share and discover activity ideas, and a Memories tab to preserve moments after each event.

Built with a modern tech stack, Hangout Planner ensures a responsive, secure, and interactive experience: React + TailwindCSS on the frontend, Node.js + Express on the backend, PostgreSQL for data storage, and JWT for authentication.

Key highlights include automatic final decision generation for group events, live group chat, post likes and comments, searchable and sortable community content, and personalized notifications for upcoming or pending events.

Whether coordinating with friends or exploring new hangout ideas, Hangout Planner streamlines the process and enhances social engagement.

[https://lets-go.site/](https://lets-go.site/)

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

## To Build Locally

### Prerequisites
- Node.js v18+ 
- PostgreSQL installed and running
- npm or yarn

step 1: create a folder (u can call it capstone or whatever)
```
mkdir capstone
cd capstone
```
step 2: git clone the repo  
```
git clone <url>
```
step 3: navigate into the project  
```
cd CSCI499-hangout_planner
```

### Postgres
Go inside the `models` directory under `server` and create the tables found in `schema.sql` in your postgres.

To login to postgres:  
```
Psql -U postgres  
\l → to see all dbs  
\c hangout_planner → to connect to hangout_planner  
\d name_of_table → to see the constraints of the table
```

### Inside the `server` directory 
Create an `.env` file with the contents below and add your PostgreSQL credentials and JWT secret: 
```
PGDATABASE=hangout_planner  
PGHOST=localhost  
PGPORT=5432  
PGUSER=postgres  
PGPASSWORD=yourpassword  
JWT_SECRET=yourjwtsecret  
FRONTEND_URL=http://localhost:5173  
EMAIL_USER=letsgo.noreply.bot@gmail.com  
EMAIL_PASSWORD=pwfp mbjc sxpd fhag  
```

### Frontend setup
To run the frontend:  
```
cd client  
npm i        // to install all dependencies  
npm run dev  // to start http://localhost:5173
```

### Backend Setup
To run the backend:  
open another terminal simultaneously:  
```
cd server  
npm i      // to install dependencies  
npm start  // to start server on localhost:3001
```    

## To update on a EC2 instance
To begin, close the back end first. So start of with doing pm2 status\
then do pm2 delete followed by the name of the status to close.\
And also pm2 flush to clear logs if you want.\
Upload the new files with github.\
Cd into the server folder, and run \
pm2 start npm --name "server" -- start\
After CD back into the client folder and instead of npm run dev, we do npm run build.\
Then update nginx by doing: Sudo systemctl restart nginx
