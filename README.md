# Multi-Tenant Academic Management System

A web-based academic management platform designed to help multiple educational institutions manage their academic operations through a centralized system with tenant-specific data access.

## Overview

The **Multi-Tenant Academic Management System** is a full-stack web application built to organize and manage academic information for multiple institutions. Each institution operates within its own tenant context, helping ensure that users access data associated with their institution.

The project combines a React frontend, a FastAPI backend, and a MySQL database to provide a foundation for managing students, faculty, departments, courses, attendance, and other academic information.

## Key Features

- **Multi-Tenant Architecture:** Supports multiple educational institutions within one application.
- **Authentication:** Login functionality with token-based authentication using JWT.
- **Role-Based Access:** Supports role-specific access for users such as administrators and students.
- **Student Management:** Organize student records and academic information.
- **Faculty Management:** Maintain faculty-related records.
- **Department Management:** Manage institution-specific departments.
- **Course Management:** Organize course information and academic records.
- **Attendance Management:** Support attendance-related operations.
- **Tenant-Scoped Data Access:** Restrict data access according to the authenticated user's institution.
- **REST API:** Expose backend functionality through FastAPI endpoints.
- **Interactive API Documentation:** Explore available API endpoints through Swagger UI when enabled.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| ORM | SQLAlchemy |
| Database | MySQL |
| Authentication | JWT |
| API Testing | Swagger UI / FastAPI Docs |
| Version Control | Git and GitHub |

## System Architecture

```text
                Users
                  |
                  v
          React Frontend
                  |
            HTTP / REST API
                  |
                  v
          FastAPI Backend
                  |
        Authentication (JWT)
                  |
          Tenant Validation
                  |
                  v
          SQLAlchemy ORM
                  |
                  v
             MySQL DB
                  |
       Multiple Institutions
```

The frontend communicates with the backend through REST APIs. The backend handles authentication, validates user access, processes academic operations, and interacts with the MySQL database through SQLAlchemy.

## Project Structure

```text
multi-tenant-academic-system/
|
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── fix_admin_passwords.py
|
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
|
├── .gitignore
└── README.md
```

## Getting Started

Follow the steps below to run the project locally.

### Prerequisites

Install the following tools before starting:

- Python
- Node.js and npm
- MySQL Server
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/rishav97531/multi-tenant-academic-system.git
cd multi-tenant-academic-system
```

### 2. Set Up the Backend

Open a terminal in the project root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib bcrypt python-dotenv
```

Create a `.env` file inside the `backend/` directory and configure the database connection and application settings required by your code.

**Security note:** Use your own local credentials. Never commit `.env` files, database passwords, JWT secrets, or API keys to GitHub.

Ensure that the MySQL server is running and that the database configured in your application exists.

Start the backend:

```bash
uvicorn main:app --reload
```

The backend should start at:

`http://127.0.0.1:8000`

### 3. Set Up the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal. Open that URL in your browser.

Make sure the frontend API configuration points to the backend URL and that the backend's CORS settings allow the frontend's local origin.

### 4. Explore the API

If the FastAPI application exposes the default documentation routes, open:

- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **OpenAPI schema:** `http://127.0.0.1:8000/openapi.json`

These pages allow you to inspect and test the API endpoints.

## Database Design

The system is designed around academic entities such as:

- **Tenant:** Represents an educational institution.
- **User:** Stores user account and authentication information.
- **Student:** Stores student records.
- **Faculty:** Stores faculty information.
- **Department:** Represents academic departments.
- **Course:** Stores course information.
- **Enrollment:** Represents student course enrollment.
- **Attendance:** Stores attendance records.
- **Exam:** Represents examination information.

The exact relationships and constraints are defined in the project's SQLAlchemy models and database schema.

## Multi-Tenancy and Data Isolation

Multi-tenancy is a core concept of this project. Instead of maintaining a separate application for every institution, the system is designed to serve multiple institutions through a shared application.

The backend uses the authenticated user's tenant context to scope access to institution-specific records.

Important design considerations include:

- Associating users and academic records with the correct tenant.
- Validating tenant access on protected endpoints.
- Avoiding unauthorized cross-tenant data access.
- Enforcing authentication and authorization on the server side.

Tenant isolation should be verified across every API endpoint before the system is used with real institutional data.

## Security Considerations

- Keep secrets and credentials in environment variables.
- Never upload `.env` files to the repository.
- Hash passwords before storing them in the database.
- Protect private endpoints with authentication.
- Validate user permissions and tenant ownership on the backend.
- Use HTTPS and production-grade secret management when deploying.
- Avoid using real student information in public demonstrations.

## Future Enhancements

Potential improvements for future development include:

- Role and permission management with more granular access controls.
- Student and faculty profile enhancements.
- Course enrollment and academic performance tracking.
- Attendance reports and analytics dashboards.
- Examination and result management.
- CSV and PDF report generation.
- Email notifications and password recovery.
- Automated testing and continuous integration.
- Cloud deployment with production database configuration.
- Audit logs and stronger tenant-isolation testing.

## Learning Outcomes

This project provides practical experience with:

- Full-stack web application development.
- REST API design using FastAPI.
- Relational database management using MySQL.
- ORM-based database operations with SQLAlchemy.
- JWT-based authentication.
- Multi-tenant application design.
- Frontend and backend integration.
- Git and GitHub version control.

## Contributing

Contributions, suggestions, and bug reports are welcome. To propose a change:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the changes locally.
5. Submit a pull request with a clear description.

## License

No license has been specified yet. Until a license is added to the repository, reuse and redistribution are subject to applicable copyright law.

---

**Project:** Multi-Tenant Academic Management System  
**Repository:** [rishav97531/multi-tenant-academic-system](https://github.com/rishav97531/multi-tenant-academic-system)
