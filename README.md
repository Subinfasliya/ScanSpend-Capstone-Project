# ScanSpend Smart Expense Manager

ScanSpend is an AI-powered receipt scanner and smart expense manager designed for users who want to track spending without manual data entry. The project combines a React frontend with an Express + MongoDB backend to support receipt uploads, OCR extraction, expense management, analytics, and premium subscription workflows.

## Project Overview

- Client folder: `ScanSpend_Smart_Expense_Manager`
- Backend folder: `Receipt-Scanner-Smart-Expense-Manager-Backend`
- Project Type: Full-stack SaaS web application
- Category: Personal finance, receipt OCR, analytics, AI insights
- Target: Entri Elevate / Full Stack Web Development

## Core Objectives

1. Allow users to register and log in securely.
2. Upload and scan receipt images.
3. Extract merchant, date, amount, and text using OCR.
4. Verify OCR results before storing expense records.
5. Save expenses, receipts, and analytics in MongoDB.
6. Provide dashboard insights and category-based spending analysis.
7. Support Free and Premium subscription plans.
8. Integrate payment and premium authorization flows.
9. Enable exports and advanced reporting for premium users.
10. Prepare the project for real-world SaaS deployment.

## Functional Requirements Summary

### User Roles

#### Free User
- Register and log in
- Manage personal expenses
- Upload limited receipts
- Watch dashboard metrics
- Search and filter expenses
- View basic analytics

#### Premium User
- Access premium features
- Increase receipt processing limits
- Use advanced analytics and AI insights
- Export reports in CSV, Excel, and PDF
- Manage budgets and recurring expenses
- Generate custom reports

#### Administrator
- Manage users and subscriptions
- Monitor activity and payment events
- View application-level statistics and admin analytics

### Key Features

- User registration and authentication using JWT
- Password hashing with secure storage
- Receipt upload with validation for type, size, and MIME
- OCR processing to detect merchant, date, amount, and text
- Expense CRUD with ownership protection
- Search, filtering, pagination, and categorization
- Dashboard summary and spending trends
- Payment integration with Razorpay
- Premium subscription checks and webhook verification
- CSV, Excel, and PDF export support for premium users
- Budgeting and recurring expense support
- AI-powered insights as a future premium enhancement

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Formik + Yup
- Recharts
- Tesseract.js

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Multer
- Cloudinary
- Razorpay
- Joi
- Helmet + CORS + rate limiting

## Repository Structure

```text
Module-6/
├── README.md
├── PROJECT_REQUIREMENTS.md
├── ScanSpend_Smart_Expense_Manager/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules/
│   └── src/
├── Receipt-Scanner-Smart-Expense-Manager-Backend/
│   ├── app.js
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── node_modules/
│   ├── src/
│   ├── scripts/
│   └── test/
```

## MVP Scope

The initial MVP focuses on the core user flow:

1. Register / login
2. Dashboard access
3. Receipt upload
4. OCR extraction
5. Manual verification
6. Expense creation and storage
7. Search and filters
8. Basic analytics

## Business Model

The application follows a freemium SaaS model:

- Free plan: essential expense tracking features
- Premium plan: advanced analytics, exports, budgets, recurring expenses, AI insights, and premium reporting

## Security and Quality Expectations

The system should include:

- JWT authentication and protected endpoints
- Ownership validation for user data
- MIME type and file size validation
- Environment-based secrets and credentials
- Centralized error handling
- Secure payment verification via webhook validation
- Logging without exposing sensitive values

## Roadmap

### Phase 1
- Planning, SRS, user flow, and database design

### Phase 2
- Frontend MVP with auth and dashboard

### Phase 3
- OCR and receipt parsing

### Phase 4
- Backend API and MongoDB integration

### Phase 5
- Security, authorization, and subscriptions

### Phase 6
- Cloud storage and export features

### Phase 7
- Production hardening and deployment

## Local Development

Install and run the frontend from its project directory:

```bash
cd ScanSpend_Smart_Expense_Manager
npm install
npm run dev
```

Install and run the backend in a separate terminal:

```bash
cd Receipt-Scanner-Smart-Expense-Manager-Backend
npm install
npm run dev
```

Run the frontend production build with `npm run build` from the frontend directory. Run backend tests with `node --test` from the backend directory.

## Notes

This repository already contains the working frontend and backend infrastructure for the ScanSpend project. The project requirements documented here are intended to guide implementation, feature refinement, and future extension toward a polished SaaS product.
