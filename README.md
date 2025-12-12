🚧 Urban Insight – AI Powered Infrastructure Issue Reporting System

A modern, AI-enhanced full-stack web application that allows citizens to report and track public infrastructure issues such as damaged roads, streetlight failures, drainage problems, garbage overflow, etc.
The system provides intelligent issue categorization, priority boosting, automated timelines, and role-based dashboards for admins, staff, and citizens.

🌐 Live Website

➡️ Live Client: Add link here
➡️ Live Server: Add link here

👤 Credentials for Testing
🔹 Admin Account

Email: imran@ahmed.com

Password: 1234A@g5678

🔹 Staff Account

Email: rasel@ahmed.com

Password: 1234A@g5678

🔹 Citizen Account

Email: mamun@ahmed.com

Password: 1234A@g5678

✨ Key Features
🏙️ Citizen Features

Report public issues with photo + live location

Track issue lifecycle (Pending → In-Progress → Resolved → Closed)

Upvote issues (others’ issues only)

Edit/Delete own pending issues

Boost issue priority (payment)

Premium users get unlimited submissions

AI suggested issue categories (optional)

🛠️ Staff Features

View admin-assigned issues

Update issue progress & change status

Add work logs with timestamps

Dashboard analytics

Update own profile

🛡️ Admin Features

Manage all public issues

Assign issues to staff

Reject issues

Manage citizens (Block/Unblock)

Manage staff (Add/Update/Delete)

Manage payments & invoices

Role-based protected dashboards

Advanced search, filters & pagination

🌟 System-Level Features

Fully responsive design

Firebase authentication

JWT secured backend

TanStack Query for fast data loading

SweetAlert / Toast notifications

Priority-based issue listing

Real-time history timelines

Clean UI/UX (no lorem ipsum)

🧩 How the System Works

Citizens report an issue with details + image + location

AI suggests category and priority (optional)

Admin verifies and assigns the issue to staff

Staff updates progress

System logs all activities in timeline

Citizen receives instant updates

Priority issues appear at the top

🧩 Technology Stack
Frontend

React.js

TailwindCSS + DaisyUI

React Hook Form

TanStack Query

Axios

SweetAlert2 / Toast

Backend

Node.js

Express.js

MongoDB

JWT Auth

Stripe Payment

Additional

Firebase Auth

imgbb Image Hosting

📊 Dashboard Overview
Citizen Dashboard

Issue counts

Payment history

Chart analytics

Status summary

Staff Dashboard

Assigned issues overview

Today's tasks

Status analytics

Progress log filtering

Admin Dashboard

Total issues

Payment stats

User/staff management

Realtime insights

Priority-based monitoring

🧾 Payments System

Two payment services:

Priority Boost – 100৳

Premium Subscription – 1000৳ (unlimited reports)

Includes:

Payment history

PDF invoice generation

Realtime updates

📁 Project Structure
Client
src/
 ├── components/
 ├── hooks/
 ├── pages/
 ├── layouts/
 ├── routes/
 ├── context/
 ├── utils/
 └── styles/

Server
server/
 ├── routes/
 ├── controllers/
 ├── middleware/
 ├── models/
 ├── config/
 ├── utils/
 └── index.js

🚀 Installation Guide
1️⃣ Clone Repositories
git clone <client-repo>
git clone <server-repo>

2️⃣ Install Dependencies

Client

npm install


Server

npm install

3️⃣ Environment Variables
Client .env
VITE_api_url=YOUR_SERVER_URL
VITE_FIREBASE_API_KEY=
VITE_image_host_KEY=

Server .env
DB_URI=
JWT_SECRET=
STRIPE_SECRET=

▶️ Run the Project
Client
npm run dev

Server
nodemon index.js

📝 License

Created for academic & development use only.