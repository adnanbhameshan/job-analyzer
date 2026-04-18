# Project Specification Document

**Project Name:** Trackr (Job Application Analyzer)
**Document Version:** 1.0
**Date:** April 2026

---

## 1. Executive Summary

Trackr is a comprehensive, full-stack web application designed to assist job seekers in organizing, visualizing, and systematically tracking their job application pipelines. By providing actionable insights through a rich dashboard, users can track their application progression from the initial submission to the final offer phase, identifying bottlenecks and tracking conversion rates throughout their job search journey.

## 2. System Architecture

The application adopts a standard **Client-Server Architecture** utilizing the **MERN** stack. 
- **Client (Frontend):** A Single Page Application (SPA) responsible for routing, state management, and user interface rendering. Communicates with the backend via RESTful APIs over HTTPS.
- **Server (Backend):** A centralized RESTful API service handling business logic, authentication, data validation, and database operations.
- **Database:** A NoSQL cloud database storing user profiles and highly relational but schema-flexible job pipeline data.

## 3. Technology Stack

### 3.1 Frontend
- **Framework:** React 19 (via Vite for optimized build tooling)
- **Styling:** Tailwind CSS (Utility-first CSS framework for rapid UI development)
- **Routing:** React Router DOM v7
- **Data Visualization:** Recharts (SVG-based charting library for dynamic dashboards)
- **HTTP Client:** Axios (for robust API communication)
- **Icons & Typography:** Lucide React, Google Fonts

### 3.2 Backend
- **Environment:** Node.js
- **Framework:** Express.js 5
- **Database ORM:** Mongoose v9
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for password hashing
- **Security & Middleware:** CORS configuration, Cookie-parser for secure HTTP-only cookies
- **Mailing service:** Nodemailer for potential email notifications and validations

### 3.3 Infrastructure & Deployment
- **Database:** MongoDB Atlas (Cloud Cluster)
- **Backend Hosting:** Render
- **Frontend Hosting:** Vercel

## 4. Functional Requirements

### 4.1 User Authentication & Authorization
- **FR1.1 Registration:** Users must be able to create an account by providing basic credentials. Passwords must be securely hashed before storage.
- **FR1.2 Login:** Users must be able to authenticate using their credentials. The system will issue a secure, HTTP-only JWT for subsequent authenticated requests.
- **FR1.3 Profile Management:** Users can view their profile data on a successful login.
- **FR1.4 Session Management:** The application will handle logging out users by clearing the authentication token cookies securely.

### 4.2 Job Pipeline Management (CRUD)
- **FR2.1 Application Entry:** Authenticated users can log a new job application, including details such as Company, Position, Location, and Application Status (`Applied`, `Interview`, `Offer`, `Rejected`).
- **FR2.2 Pipeline View:** Users can view a list of all their tracked job applications.
- **FR2.3 Application Updates:** Users can update the details and current status of an existing job application to reflect real-world progress.
- **FR2.4 Record Deletion:** Users have the ability to remove job application records from their pipeline.

### 4.3 Dashboard & Analytics
- **FR3.1 Metrics Overview:** Provide high-level statistics including Total Applications, Total Interviews, Success Rates, and Rejection Counts.
- **FR3.2 Visual Analytics:** Render dynamic graphs and charts reflecting application statuses and progression over time utilizing Recharts.

## 5. Non-Functional Requirements

- **NFR1 Security:** Passwords must be salted and hashed. API routes managing user data must be protected and validate JWTs strictly. Sensitive tokens (cookies) must be configured with `httpOnly`, `secure`, and `sameSite` policies.
- **NFR2 Performance:** The frontend must maintain high lighthouse performance scores. Leveraging Vite ensures optimized asset bundling and hot-module replacement during development.
- **NFR3 Usability:** The user interface must be fully responsive across desktop, tablet, and mobile devices. Provide immediate visual feedback (toast notifications/alerts) for user interactions like logging in or adding a job.
- **NFR4 Maintainability:** Code must be modular. The backend utilizes MVC-inspired controller/route patterns. The frontend relies on reusable components and centralized API client logic.

## 6. Database Schema Design (High-Level)

### 6.1 Users Collection
| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier | Primary Key |
| `name` | String | User's full name | Required |
| `email` | String | User's email address | Required, Unique |
| `password` | String | Hashed password string | Required |
| `timestamps` | Date | CreatedAt and UpdatedAt | Auto-generated |

### 6.2 Jobs Collection
| Field | Type | Description | Constraints |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier | Primary Key |
| `user` | ObjectId | Reference to `Users` collection | Required, Foreign Key |
| `company` | String | Name of the company | Required |
| `position` | String | Job title | Required |
| `status` | Enum | E.g., 'Applied', 'Interview', 'Offer', 'Rejected' | Required, Default: 'Applied' |
| `timestamps` | Date | CreatedAt and UpdatedAt | Auto-generated |

## 7. API Endpoints Specification

### 7.1 Authentication Routes (`/api/auth`)
| HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Registers a new user and issues a JWT token. | No |
| `POST` | `/login` | Authenticates user and issues a JWT token. | No |
| `POST` | `/logout` | Clears the JWT cookie to end the session. | No |
| `GET` | `/profile` | Retrieves current logged-in user details. | Yes |

### 7.2 Job Routes (`/api/jobs`)
| HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Retrieves a list of all jobs corresponding to the user. | Yes |
| `POST` | `/` | Creates a new job record for the authenticated user. | Yes |
| `GET` | `/dashboard`| Retrieves calculated analytics metrics for the dashboard. | Yes |
| `PUT` | `/:id` | Updates a specific job application entry by its ID. | Yes |
| `DELETE` | `/:id` | Deletes a specific job application entry by its ID. | Yes |

---
*Generated based on current project schema, dependencies, and routing structures.*
