# Coaching Management System

A multi-branch coaching management system designed to streamline academic administration, student management, teacher coordination, fee collection and operational activities across multiple coaching center branches.

The project is being developed as a practical full-stack software engineering project using Python, FastAPI, Angular and PostgreSQL. It follows a modular architecture intended to support maintainability, scalability, security and future feature expansion.

## Project Objectives

- Manage multiple coaching center branches from a unified system.
- Maintain student, teacher and staff records.
- Organize courses, batches, subjects and class schedules.
- Track student enrollment, attendance and academic performance.
- Manage fee collection, payment records and outstanding balances.
- Provide role-based access for administrators, branch managers, teachers, accountants and students where applicable.
- Generate reports for academic and administrative decision-making.
- Maintain secure and consistent data across branches.

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Python |
| Backend Framework | FastAPI |
| Frontend | Angular |
| Database | PostgreSQL |
| API Communication | REST API |
| API Documentation | OpenAPI / Swagger UI |
| Version Control | Git and GitHub |
| Development Environment | Visual Studio Code |

Use the versions and dependencies already established in the project unless a change is necessary and approved.

## Core Modules

The following modules represent the planned system scope. Implement them incrementally according to the existing project structure and development priorities.

1. Authentication and Authorization
2. Branch Management
3. Student Management
4. Teacher and Staff Management
5. Course and Subject Management
6. Batch and Class Scheduling
7. Student Enrollment
8. Attendance Management
9. Examination and Result Management
10. Fee and Payment Management
11. Dashboard and Analytics
12. Reports and Data Export
13. Notifications
14. User Profile and Account Settings
15. System Administration and Audit Logs

## System Architecture

The system follows a frontend-backend-database architecture.

- **Frontend:** Angular provides the user interface, forms, navigation, dashboards and API integration.
- **Backend:** FastAPI handles business logic, input validation, authentication, authorization and REST API endpoints.
- **Database:** PostgreSQL stores application data using relational tables, constraints and appropriate indexes.
- **API Communication:** The Angular frontend communicates with the FastAPI backend through HTTP requests using JSON.
- **API Documentation:** FastAPI provides interactive API documentation through Swagger UI.

Expected request flow:

Angular Frontend → FastAPI REST API → PostgreSQL Database

The frontend must not connect directly to PostgreSQL. All database operations must be performed through the backend.

## AI Agent Development Guidelines

These instructions apply to any AI coding agent working on this repository through Visual Studio Code.

### 1. Understand the Existing Project First

Before making changes:

- Inspect the existing repository structure.
- Read existing README files, configuration files and dependency manifests.
- Review the backend entry point, API routes, database configuration and frontend application structure.
- Identify which features are already implemented and which are incomplete.
- Check the current Git status before editing files.
- Reuse existing code and conventions wherever practical.

Do not recreate the project from scratch when a working implementation already exists.

Do not claim that a feature exists unless the code confirms it.

### 2. Follow the Technology Stack

Use the following technologies for their intended purposes:

- Python and FastAPI for backend development.
- Angular and TypeScript for frontend development.
- PostgreSQL for persistent relational data.
- REST APIs for frontend-backend communication.
- Git for version control.

Do not replace Angular with React or another framework. Do not replace FastAPI or PostgreSQL without an explicit requirement.

Avoid adding unnecessary frameworks, dependencies or services.

### 3. Maintain a Clean Project Structure

Keep frontend and backend responsibilities separate.

A suggested structure, subject to the existing repository, is:

    coaching-management-system/
    ├── backend/
    │   ├── app/
    │   │   ├── api/
    │   │   ├── core/
    │   │   ├── models/
    │   │   ├── schemas/
    │   │   ├── services/
    │   │   ├── repositories/
    │   │   ├── db/
    │   │   └── main.py
    │   ├── tests/
    │   ├── requirements.txt
    │   └── .env.example
    ├── frontend/
    │   ├── src/
    │   ├── angular.json
    │   └── package.json
    ├── docs/
    ├── .gitignore
    ├── AGENTS.md
    └── README.md

Adapt this structure to the actual repository. Do not move or rename existing files unnecessarily.

Keep API routes, business logic, database operations and request/response schemas organized according to their responsibilities.

### 4. Write Maintainable Code

- Use clear and descriptive names for variables, functions, classes and files.
- Prefer small functions and focused modules.
- Follow Python conventions and standard Angular and TypeScript practices.
- Use type hints in Python wherever appropriate.
- Use Pydantic schemas to validate API request and response data.
- Use Angular services for API communication and keep components focused on presentation and user interaction.
- Avoid duplicated business logic.
- Add comments when they explain non-obvious decisions rather than restating the code.
- Handle errors explicitly and return appropriate HTTP status codes.
- Avoid placeholder implementations when a working feature is required.

### 5. Database Design Rules

- Use PostgreSQL as the primary application database.
- Define appropriate primary keys, foreign keys, unique constraints and indexes.
- Use proper relationships between branches, users, students, courses, batches and payments.
- Store monetary amounts using appropriate exact numeric types rather than floating-point types.
- Use database transactions when multiple related changes must succeed or fail together.
- Create database migrations for schema changes using the migration system adopted by the project.
- Avoid destructive schema changes without assessing their impact.
- Use consistent timestamps and define how dates and times are handled.
- Add branch ownership or branch-scoping rules to relevant records.
- Enforce data integrity at both the application and database levels where appropriate.

Do not hardcode database credentials or connection strings in source code.

### 6. Multi-Branch Business Rules

Multi-branch support is a core requirement.

- Each branch must have a unique identifier.
- Branch-specific records must be associated with the appropriate branch.
- Users should access only the branches and data permitted by their assigned roles.
- Branch managers must not automatically receive organization-wide access.
- Organization-wide administrators may access multiple branches according to their permissions.
- Branch filters must be enforced on the backend, not only in the Angular interface.
- Prevent unauthorized cross-branch access through direct API requests.
- Define how shared users, courses and organizational settings behave across branches.

Never rely on a branch ID supplied by the frontend without verifying the authenticated user's permission to access it.

### 7. Authentication and Security

- Implement secure authentication using established practices.
- Hash passwords with a suitable password-hashing algorithm.
- Enforce authorization on protected backend endpoints.
- Validate and sanitize untrusted input appropriately.
- Store secrets in environment variables.
- Keep real `.env` files, credentials, tokens and private keys out of Git.
- Configure CORS for the intended frontend origins rather than allowing unrestricted access by default.
- Avoid exposing sensitive information in API responses, logs or error messages.
- Protect payment and student information with appropriate access controls.
- Add audit records for sensitive administrative actions where appropriate.

Never disable authentication or authorization simply to make a feature work during development.

### 8. API Development Standards

- Use consistent REST endpoint naming.
- Use appropriate HTTP methods and status codes.
- Validate input and return predictable response formats.
- Provide clear error messages without exposing internal stack traces.
- Add pagination, filtering and sorting to list endpoints when appropriate.
- Keep database logic out of route handlers when a service or repository layer is warranted.
- Document endpoints through FastAPI's OpenAPI support.
- Configure API prefixes consistently, such as `/api/v1`, if appropriate for the existing application.

### 9. Frontend Development Standards

- Use Angular components, services, routing and dependency injection appropriately.
- Keep API requests inside suitable Angular services.
- Create reusable UI components for common patterns.
- Implement loading, empty, success and error states.
- Validate forms on the frontend for usability and on the backend for security.
- Make layouts responsive across desktop, tablet and mobile screens.
- Use consistent navigation, typography, spacing and form styles.
- Protect restricted routes in the frontend while retaining backend authorization.
- Keep environment-specific configuration separate from application code.
- Avoid putting secrets in frontend environment files because frontend configuration may be exposed to users.

### 10. Testing and Quality Assurance

For each feature:

- Add or update backend tests for business logic, API behavior and authorization.
- Test branch-level data isolation.
- Test valid requests, invalid input, missing records and unauthorized requests.
- Test frontend interactions and API integration where practical.
- Test database relationships and important constraints.
- Run relevant existing tests and build commands before considering a task complete.
- Fix regressions caused by the changes.
- Report any tests that could not be executed and explain why.

Never claim that tests passed unless they were actually run successfully.

### 11. Development Workflow

Follow this workflow for each development task:

1. Inspect the existing implementation.
2. Identify the requirements and affected files.
3. Create a concise implementation plan.
4. Implement the smallest complete solution.
5. Update database migrations and API schemas if necessary.
6. Update the Angular interface and API integration where required.
7. Run relevant tests, lint checks and build commands.
8. Fix errors introduced by the changes.
9. Update documentation when behavior or setup changes.
10. Summarize modified files, implemented behavior, test results and remaining issues.

Avoid unrelated refactoring during focused tasks.

### 12. Git and GitHub Rules

- Preserve existing Git history and project conventions.
- Check `git status` before making changes.
- Never overwrite unrelated user changes.
- Never commit `.env` files, credentials, build outputs or virtual environments.
- Use descriptive commit messages.
- Keep `.gitignore` updated.
- Do not force-push, reset shared history or delete branches without explicit authorization.
- Do not create commits or push changes unless requested or clearly authorized by the established workflow.
- Keep the README and setup instructions synchronized with the actual implementation.

### 13. Dependency Management

- Use the existing dependency manager and lockfiles where available.
- Add only dependencies that solve a real requirement.
- Prefer stable, maintained packages.
- Document new dependencies and their purpose.
- Avoid unnecessary major-version upgrades.
- Keep backend and frontend dependency instructions separate.
- Never claim compatibility without checking the actual installed versions and configuration.

### 14. Documentation Requirements

When introducing or modifying a major feature, update the relevant documentation.

Document:

- Feature purpose and business rules.
- API endpoints and request/response expectations.
- Database changes and migrations.
- Required environment variables.
- Installation and startup instructions.
- Testing commands.
- Known limitations.

Maintain `.env.example` with placeholder values for required environment variables. Never include real credentials.

### 15. Definition of Done

A task is complete only when:

- The requested behavior has been implemented.
- The code follows the existing project structure and conventions.
- Relevant input validation and authorization are implemented.
- Database changes are handled safely.
- Relevant tests have been run where possible.
- The frontend and backend integrate correctly when both are affected.
- No known regression introduced by the change remains unresolved.
- Documentation has been updated when necessary.
- Any limitations or unverified behavior are reported honestly.

## Local Development Setup

The following commands are a starting point. Verify the repository structure and available scripts before running them.

### Backend

1. Install a compatible Python version.
2. Create and activate a virtual environment.
3. Install the project's Python dependencies.
4. Configure the required environment variables.
5. Ensure PostgreSQL is running and the development database exists.
6. Apply the project's database migrations if configured.
7. Start the FastAPI development server.

Example for Windows PowerShell:

    cd backend
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    uvicorn app.main:app --reload

If the actual backend entry point differs, adjust the Uvicorn command accordingly.

### Frontend

From the frontend directory, use the package manager and scripts configured in `package.json`.

Example:

    cd frontend
    npm install
    npm start

If the project uses a different Angular startup script, use the command defined in `package.json`.

### API Documentation

When the backend is running, FastAPI commonly provides:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

These URLs depend on the application's configuration.

## Environment Configuration

Create a local `.env` file based on `.env.example`.

Typical backend configuration may include:

    APP_NAME=Coaching Management System
    APP_ENV=development
    DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/DATABASE_NAME
    SECRET_KEY=replace_with_a_secure_local_secret
    CORS_ORIGINS=http://localhost:4200

These are illustrative placeholders, not verified names of variables already used by the application. Align them with the actual settings implementation. Use a suitable database driver and URL format for the selected SQLAlchemy or PostgreSQL integration.

## Project Status

Phase 1 backend foundations are in place:

- FastAPI application metadata and environment-based settings.
- Versioned `GET /api/v1/health` endpoint.
- Configurable CORS origins through `CORS_ORIGINS`.
- Preserved root and demo student endpoints.
- Initial backend tests.
- SQLAlchemy models for organizations, branches, users, branch assignments and students.
- JWT login and authenticated user profile endpoints.
- Backend-enforced branch access and branch-scoped student listing/creation.
- Organization-wide courses with branch-scoped batches.
- Student enrollments, attendance records and payment records with branch isolation.
- Teacher directory and branch-scoped timetable scheduling.
- Marks book validation and fee charge/outstanding-balance reporting.

Migration automation, advanced administration, reports and additional domain workflows remain pending.

### Current API slice

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/health`
- `GET /api/v1/branches`
- `GET /api/v1/branches/{branch_id}/students`
- `POST /api/v1/branches/{branch_id}/students`
- `GET|POST /api/v1/branches/{branch_id}/courses`
- `GET|POST /api/v1/branches/{branch_id}/batches`
- `POST /api/v1/branches/{branch_id}/enrollments`
- `POST /api/v1/branches/{branch_id}/attendance`
- `POST /api/v1/branches/{branch_id}/payments`
- `GET|POST /api/v1/branches/{branch_id}/teachers`
- `GET|POST /api/v1/branches/{branch_id}/timetable`
- `GET|POST /api/v1/branches/{branch_id}/marks`
- `POST /api/v1/branches/{branch_id}/fee-charges`
- `GET /api/v1/branches/{branch_id}/fee-balances`

The dashboard includes add controls for students, courses, batches, teachers,
class timetable entries, attendance, marks, fee charges and payments. Remove
buttons archive operational records where history should be retained (students,
teachers, courses and batches) or delete non-financial records. Payment records
are intentionally retained as an auditable ledger and are not silently deleted.

### Frontend

The initial Angular application is available under `frontend/`. It provides a
portfolio landing page at `/`, a protected login flow at `/login`, and the
management portal at `/dashboard`. It provides a bearer-token HTTP interceptor,
branch selector, student registration/listing, and course/batch overview. Run
`npm install` and then `npm start` from that directory after starting the
FastAPI backend.

### Public deployment on Render

The repository includes a `Dockerfile` and `render.yaml` for deploying the
Angular frontend, FastAPI backend, and PostgreSQL database as one Render
service. In Render, choose **New > Blueprint**, connect this repository, and
apply the `render.yaml` configuration. Render will provide the public HTTPS
URL; the app uses same-origin API requests in production, so it does not
depend on your local computer or `localhost`.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://dashboard.render.com/blueprint/new?repo=https://github.com/mdriad-dev/coaching-management-system)

**[Deploy Coaching Management System on Render](https://dashboard.render.com/blueprint/new?repo=https://github.com/mdriad-dev/coaching-management-system)**

After the first deployment, run the seed command once from a Render shell if
you want the demo administrator:

    python -m app.seed

Then change the demo password before sharing the public URL.

The default local configuration uses SQLite so the foundation can be tested without
external services. Set `DATABASE_URL` to a PostgreSQL URL for development environments
that have PostgreSQL available. Production schema changes must be managed through
Alembic migrations; the current development table creation is intentionally disabled
when `APP_ENV=production`.

### Verified backend commands

From the `backend` directory:

    python -m pytest
    uvicorn app.main:app --reload

To initialize a PostgreSQL or local SQLite database with the current schema:

    alembic upgrade head

For a repeatable local demo dataset:

    python -m app.seed

The development seed creates `admin@example.com` with password `Admin123!`,
one branch, one course, one batch and one demo student. Change or remove this
account before using a shared or production environment.

Copy `.env.example` to `.env` and adjust values for local development before starting the server.

## Future Improvements

Potential future enhancements include:

- Advanced analytics and dashboards.
- Online payment gateway integration.
- Automated SMS, email and in-app notifications.
- Student and guardian portals.
- Advanced attendance reporting.
- Backup and recovery automation.
- Deployment using a production-ready hosting environment.
- CI workflows for automated testing and code quality checks.

These are possible extensions and are not claims about existing functionality.

## License

A license has not yet been specified. Add an appropriate license before distributing or reusing the project publicly.

## Contribution Guidelines

Contributors and AI coding agents should follow the development guidelines in this README and any additional repository-level instructions in `AGENTS.md`. Changes should be focused, tested and documented before being considered complete.
