# 🚀 Multi-Tenant SaaS Platform

A production-ready Multi-Tenant SaaS Platform built with Django, Django REST Framework, React, PostgreSQL, Celery, Redis, and Razorpay.

This application allows multiple organizations (tenants) to use the same platform while keeping their data completely isolated and secure. Organizations can manage projects, invite team members, handle subscriptions, and collaborate within their own workspace.

---

## 📖 Overview

Modern SaaS products need to support multiple customers on a single platform without compromising security or scalability.

This project implements:

- Multi-Tenant Architecture
- JWT Authentication
- Role-Based Access Control (RBAC)
- Team & Workspace Management
- Project Management
- Subscription & Billing System
- Background Task Processing
- RESTful APIs
- Production-Ready Deployment Architecture

The platform follows an API-first approach, making it easy to integrate with web, mobile, and third-party applications.

---

## ✨ Features

### 🔐 Authentication & Security

- User Registration
- Secure Login System
- JWT Authentication
- Access & Refresh Tokens
- Password Validation
- Protected API Endpoints
- Role-Based Access Control (RBAC)

### 🏢 Multi-Tenancy

- Organization Creation
- Tenant Isolation
- Separate Workspace for Every Organization
- Tenant-Aware APIs
- Secure Data Segregation

### 👥 Team Management

- Invite Team Members
- Manage Organization Users
- Assign Roles & Permissions
- Workspace Ownership Management

### 📁 Project Management

- Create Projects
- Update Projects
- Delete Projects
- Project Ownership
- Tenant-Specific Project Access

### 💳 Subscription & Billing

- Razorpay Integration
- Subscription Plans
- Payment Verification
- Billing Management
- Subscription Tracking

### ⚡ Background Tasks

Powered by Celery & Redis:

- Email Processing
- Member Invitations
- Asynchronous Jobs
- Scheduled Tasks
- Long Running Background Operations

---

## 🏗️ System Architecture

```text
┌──────────────────────┐
│    React Frontend    │
│       (Vite)         │
└──────────┬───────────┘
           │
           │ REST APIs
           ▼
┌──────────────────────┐
│ Django REST Backend  │
│        (DRF)         │
└──────────┬───────────┘
           │
     ┌─────┼─────┐
     │     │     │
     ▼     ▼     ▼
   JWT   Celery Razorpay
  Auth  Workers Payments

     │
     ▼
   Redis

     │
     ▼
 PostgreSQL
   (Neon)
```

---

## 🛠️ Tech Stack

### Backend

- Python
- Django
- Django REST Framework (DRF)
- Simple JWT
- Celery
- Redis

### Frontend

- React
- Vite
- Axios
- React Router

### Database

- PostgreSQL (Neon)

### Payments

- Razorpay

### Deployment

- Railway (Backend)
- Vercel (Frontend)
- Neon (Database)

### DevOps & Tools

- Docker
- Docker Compose
- Git
- GitHub
- Environment Variables
- CI/CD Ready Setup

---

## 📂 Project Structure

```text
saas_project/
│
├── accounts/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│
├── tenants/
│   ├── models.py
│   ├── middleware.py
│   ├── serializers.py
│   ├── views.py
│
├── projects/
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│
├── billing/
│   ├── models.py
│   ├── views.py
│
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── celery.py
│
├── frontend/
│
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing
- Protected API Routes
- Tenant Isolation
- Environment-Based Configuration
- Secure Payment Verification
- CORS Protection
- Production Security Settings

---

## ⚡ Background Task Flow

```text
User Invites Team Member
           │
           ▼
      API Request
           │
           ▼
     Celery Task
           │
           ▼
      Redis Queue
           │
           ▼
     Celery Worker
           │
           ▼
      Email Sent
```

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/saas_project.git

cd saas_project
```

### 2. Create Virtual Environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### Linux / Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
SECRET_KEY=your-secret-key

DEBUG=True

DATABASE_URL=postgresql://username:password@host/database

REDIS_URL=redis://localhost:6379

RAZORPAY_KEY_ID=your_key

RAZORPAY_KEY_SECRET=your_secret

EMAIL_HOST_USER=your_email

EMAIL_HOST_PASSWORD=your_password
```

### 5. Apply Database Migrations

```bash
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

### 8. Start Celery Worker

```bash
celery -A config worker -l info
```

---

## 📡 API Modules

### Authentication

```text
/api/auth/register/
/api/auth/login/
/api/auth/token/refresh/
```

### Tenants

```text
/api/tenants/
/api/tenants/invite/
```

### Projects

```text
/api/projects/
```

### Billing

```text
/api/billing/
```

### Users

```text
/api/users/
```

---

## 🌍 Deployment Architecture

### Backend

- Railway

### Frontend

- Vercel

### Database

- Neon PostgreSQL

### Background Workers

- Celery + Redis

### Static Files

- WhiteNoise

---

## 📈 Scalability Features

- Multi-Tenant Design
- Modular Architecture
- RESTful APIs
- Background Task Processing
- PostgreSQL Database
- Redis Queue System
- Docker Support
- Cloud Deployment Ready
- Horizontal Scaling Friendly

---

## 🔮 Future Enhancements

- Stripe Integration
- AI-Powered Features
- Elasticsearch Integration
- Audit Logs
- Activity Tracking
- Analytics Dashboard
- SaaS Metrics
- Real-Time Notifications
- WebSocket Support
- Advanced Permission System

---

## 👨‍💻 Developer

### Sagar Shukla

Backend Developer passionate about building scalable SaaS applications using modern technologies.

**Core Skills**

- Python
- Django
- Django REST Framework
- React
- PostgreSQL
- Celery
- Redis
- Docker
- REST APIs
- Cloud Deployment

---

## ⭐ Key Highlights

✔ Multi-Tenant Architecture

✔ JWT Authentication

✔ Role-Based Access Control (RBAC)

✔ Background Task Processing with Celery

✔ Payment Gateway Integration

✔ RESTful API Design

✔ Dockerized Development Environment

✔ PostgreSQL Database Design

✔ Production Deployment Ready

✔ Scalable SaaS Architecture

---

If you found this project useful, consider giving it a ⭐ on GitHub.
