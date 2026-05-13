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

## 🌐 Live

Visit the store → [**qalarahi.com**](https://qalarahi.com)

---

## 📜 License

This project is proprietary. All rights reserved.