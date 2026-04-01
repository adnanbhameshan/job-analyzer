# Trackr: Job Application Analyzer

Trackr is a full-stack MERN dashboard application built to help job seekers cleanly organize, visualize, and track their job application pipeline from initial application to final offer.

## 🚀 Built With

- **Frontend:** React, Vite, TailwindCSS, Recharts (for Dashboard data visualization)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)

## ✨ Features

- **Personalized Dashboard:** Visualize application conversion rates, success metrics, and a full application pipeline natively handled by Recharts.
- **Job Status Tracking:** Create, edit, and keep statuses organized (`Applied`, `Interview`, `Offer`, `Rejected`).
- **User Authentication:** Fully secure, encrypted user registration and login endpoints. Route protections ensure data privacy.

## 💻 Running Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed and a MongoDB cluster configured (e.g. MongoDB Atlas).

### 1. Clone the repository
```bash
git clone https://github.com/adnanbhameshan/job-analyzer.git
cd job-analyzer
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory with the following variables:
```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```
Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal window inside the root project directory:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

Your app will be automatically running at `http://localhost:3000`.

## 🤝 Contributing
Issues and Pull Requests are welcome! Feel free to open an issue if you'd like to suggest a feature or improvement.
