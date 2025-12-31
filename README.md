 

# 🚧 Urban Insight – Infrastructure Issue Reporting System

A modern full-stack web application that allows citizens to report and track public infrastructure issues such as damaged roads, streetlight failures, drainage problems, garbage overflow, etc.
The system provides intelligent issue categorization, priority boosting, automated timelines, and role-based dashboards for admins, staff, and citizens.

---
## Website Screenshot: 
<img width="1900" height="800" alt="image" src="https://github.com/user-attachments/assets/c3247915-2ce2-4eba-bc2e-fdfcc2d86a7a" />
<img width="1900" height="800" alt="image" src="https://github.com/user-attachments/assets/38004132-faef-440c-b3da-2384f8805c64" />
<img width="1900" height="800" alt="image" src="https://github.com/user-attachments/assets/52861f1c-94d3-4b0c-a3e4-82f86e98a625" />

 <img width="1900" height="800" alt="image" src="https://github.com/user-attachments/assets/77887913-13f9-4bbd-a52f-ade9e6022dba" />

<img width="1900" height="800" alt="image" src="https://github.com/user-attachments/assets/a44288ab-67fd-4368-8353-fe50a7addde3" />


## 🌐 Live Website

* 🔗 **Live Link:** [https://zap-shift-44e49.web.app](https://zap-shift-44e49.web.app)
* 🔗 **Live Server:** [https://urban-insight-server-side-api.vercel.app/issues](https://urban-insight-server-side-api.vercel.app/issues)

---

## 👤 Credentials for Testing

### 🔹 Admin Account

* **Email:** [imran@ahmed.com](mailto:imran@ahmed.com)
* **Password:** 1234A@g5678

### 🔹 Staff Account

* **Email:** [rasel@ahmed.com](mailto:rasel@ahmed.com)
* **Password:** 1234A@g5678

### 🔹 Citizen Account

* **Email:** [mamun@ahmed.com](mailto:mamun@ahmed.com)
* **Password:** 1234A@g5678

---

## ✨ Key Features

### 🏙️ Citizen Features

* Report public issues with photo + live location
* Track issue lifecycle (Pending → In-Progress → Resolved → Closed)
* Upvote issues (others’ issues only)
* Edit/Delete own pending issues
* Boost issue priority (payment)
* Premium users get unlimited submissions
* AI suggested issue categories (optional)

---

### 🛠️ Staff Features

* View admin-assigned issues
* Update issue progress & change status
* Add work logs with timestamps
* Dashboard analytics
* Update own profile

---

### 🛡️ Admin Features

* Manage all public issues
* Assign issues to staff
* Reject issues
* Manage citizens (Block/Unblock)
* Manage staff (Add/Update/Delete)
* Manage payments & invoices
* Role-based protected dashboards
* Advanced search, filters & pagination

---

## 🌟 System-Level Features

* Fully responsive design
* Firebase authentication
* JWT secured backend
* TanStack Query for fast data loading
* SweetAlert / Toast notifications
* Priority-based issue listing
* Real-time history timelines
* Clean UI/UX (no lorem ipsum)

---

## 🧩 How the System Works

1. Citizens report an issue with details + image + location
2. AI suggests category and priority (optional)
3. Admin verifies and assigns the issue to staff
4. Staff updates progress
5. System logs all activities in timeline
6. Citizen receives instant updates
7. Priority issues appear at the top

---

## 🧩 Technology Stack

### 🎨 Frontend

* React.js
* TailwindCSS + DaisyUI
* React Hook Form
* TanStack Query
* Axios
* SweetAlert2 / Toast

### ⚙️ Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* Stripe Payment

### 🔐 Additional Services

* Firebase Authentication
* imgbb Image Hosting

---

## 📊 Dashboard Overview

### 👤 Citizen Dashboard

* Issue counts
* Payment history
* Chart analytics
* Status summary

### 🛠️ Staff Dashboard

* Assigned issues overview
* Today's tasks
* Status analytics
* Progress log filtering

### 🛡️ Admin Dashboard

* Total issues
* Payment stats
* User & staff management
* Realtime insights
* Priority-based monitoring

---

## 🧾 Payments System

### 💳 Two Payment Services

* **Priority Boost:** 100৳
* **Premium Subscription:** 1000৳ (Unlimited reports)

### 📌 Includes

* Payment history
* PDF invoice generation
* Realtime updates

---

## 📁 Project Structure

### 🖥️ Client

```
src/
 ├── components/
 ├── hooks/
 ├── pages/
 ├── layouts/
 ├── routes/
 ├── context/
 ├── utils/
 ├── styles/
```

### 🌐 Server

```
server/
 ├── routes/
 ├── controllers/
 ├── middleware/
 ├── models/
 ├── config/
 ├── utils/
 └── index.js
```

---

## 🚀 Installation Guide

### 1️⃣ Clone Repositories

```bash
git clone <client-repo>
git clone <server-repo>
```

---

### 2️⃣ Install Dependencies

#### Client

```bash
npm install
```

#### Server

```bash
npm install
```

---

### 3️⃣ Environment Variables

#### Client `.env`

```env
VITE_api_url=YOUR_SERVER_URL
VITE_FIREBASE_API_KEY=
VITE_image_host_KEY=
```

#### Server `.env`

```env
DB_URI=
JWT_SECRET=
STRIPE_SECRET=
```

---

### ▶️ Run the Project

#### Client

```bash
npm run dev
```

#### Server

```bash
nodemon index.js
```

---

 
