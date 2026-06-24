# BrightSmile Dental Frontend

## Overview

BrightSmile Dental Frontend is a Single Page Application (SPA) built with Angular. The application provides a modern user interface for managing dental appointments, patient records, services, and user authentication. It communicates with the BrightSmile Dental ASP.NET Core Web API through RESTful endpoints and uses JWT authentication for secure access.

## Technologies Used

* Angular 21
* TypeScript
* HTML5
* CSS3 / SCSS
* RxJS
* Angular Router
* Angular Forms
* JWT Authentication
* RESTful API Integration

## Project Structure

```text
src/
│
├── app/
│   ├── core/
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── models/
│   │
│   ├── shared/
│   │   ├── components/
│   │   └── interfaces/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── patient/
│   │   └── dentist/
│   │
│   ├── layouts/
│   │
│   ├── app.routes.ts
│   └── app.config.ts
│
├── assets/
├── environments/
└── styles.scss
```

## Features

### Authentication

* User Registration
* User Login
* JWT Token Authentication
* Role-Based Access Control
* Route Protection with Guards

### Administration

* Dashboard
* User Management
* Service Management

### Patient Management

* Patient Dashboard
* Appointment Booking
* Profile Management

### Dentist Management

* Dentist Dashboard
* Appointment Scheduling
* Profile Management

### Shared Features

* Responsive Navigation
* Reusable Components
* Centralized API Communication
* Error Handling
* Loading Indicators

## Prerequisites

Before running the application, ensure the following are installed:

* Node.js 24+
* npm 11+
* Angular CLI 21+

Verify installation:

```bash
node -v
npm -v
ng version
```

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/BrightSmileDentalFrontEnd.git
```

Navigate to the project folder:

```bash
cd BrightSmileDentalFrontEnd
```

Install dependencies:

```bash
npm install
```

## Environment Configuration

Create the environment file:

```typescript
export const environment = {
  apiUrl: 'http://localhost:5243/api'
};
```

Update the API URL if the backend is hosted elsewhere.

## Running the Application

Start the Angular development server:

```bash
ng serve
```

The application will be available at:

```text
http://localhost:4200
```

## Backend API

This frontend application requires the BrightSmile Dental Backend API to be running.

Default backend URL:

```text
http://localhost:5243
```

The backend provides:

* Authentication
* User Management
* Appointment Management
* Service Management
* Role-Based Authorization

## Authentication Flow

1. User submits login credentials.
2. Angular sends the request to the backend API.
3. ASP.NET Core validates the user credentials.
4. A JWT token is generated and returned.
5. The token is stored locally.
6. Protected requests include the JWT token in the Authorization header.
7. Backend endpoints validate the token before granting access.

## Development Practices

The project follows:

* SOLID Principles
* Separation of Concerns
* Feature-Based Architecture
* Reusable Components
* Dependency Injection
* Strong Typing with TypeScript
* Clean Folder Structure
* RESTful Communication Standards

## Available Scripts

Start development server:

```bash
ng serve
```

Build for production:

```bash
ng build
```

Run unit tests:

```bash
ng test
```

Generate components:

```bash
ng generate component component-name
```

## Author

**Thabo Mavundza**

BSc Information Technology Graduate
Full-Stack Software Developer
Angular | ASP.NET Core | Entity Framework Core | SQL Server | PostgreSQL | REST APIs

## License

This project is intended for educational, portfolio, and professional development purposes.
