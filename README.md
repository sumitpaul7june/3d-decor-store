# QALARAHI — Premium Home Decor E-Commerce

A full-stack e-commerce platform for premium home decor and interior design products, featuring a modern storefront, secure authentication, and a powerful admin dashboard.

---

## ✨ Features

### Storefront
- **Product Catalog** — Browse curated home decor collections with rich product details
- **Product Search & Filtering** — Find products quickly with intuitive search
- **Shopping Cart & Checkout** — Seamless cart management with Razorpay payment integration
- **User Authentication** — Email/password and Google OAuth sign-in
- **Responsive Design** — Fully optimized for desktop, tablet, and mobile

### Admin Dashboard
- **Product Management** — Create, edit, and delete products with rich text descriptions and image galleries
- **Order Management** — Track and manage customer orders
- **Hero Banner CMS** — Dynamic homepage hero section management
- **Analytics** — Sales and order insights with interactive charts

---

## 🛠 Tech Stack

### Frontend
- **React 18** — Component-based UI
- **Vite** — Lightning-fast dev server and build tool
- **Redux Toolkit** — Global state management
- **React Router v6** — Client-side routing
- **Recharts** — Data visualization for admin analytics
- **Axios** — HTTP client

### Backend
- **Express 5** — REST API server
- **MongoDB + Mongoose** — Database and ODM
- **JWT + Passport.js** — Authentication (email/password + Google OAuth)
- **Razorpay** — Payment gateway integration
- **Nodemailer** — Transactional emails
- **bcryptjs** — Password hashing

---

## 📁 Project Structure

```
3d-decor-store/
├── frontend/          # React + Vite storefront & admin dashboard
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level page components
│   │   ├── store/        # Redux slices and store config
│   │   └── utils/        # Helper functions and API client
│   └── public/           # Static assets
├── backend/           # Express REST API
│   ├── config/           # Database and auth configuration
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth and validation middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route definitions
│   ├── utils/            # Utility functions
│   └── validators/       # Request validation
└── docs/              # Internal documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **Razorpay** account (for payments)
- **Google Cloud Console** project (for OAuth)

### 1. Clone the repository
```bash
git clone https://github.com/sumitpaul7june/3d-decor-store.git
cd 3d-decor-store
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

Start the backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📜 License

This project is proprietary. All rights reserved.

---

<p align="center">Built with ❤️ by <a href="https://github.com/sumitpaul7june">Sumit Paul</a></p>