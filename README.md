# BrightSmile Dental — Angular Frontend

**Dental appointment management | Angular · TypeScript · REST APIs · JWT**

BrightSmile Dental is a full-stack dental management portfolio project with separate Angular and ASP.NET Core repositories. The frontend provides role-oriented interfaces for **patients, dentists and administrators**.

[Live frontend](https://brightsmiledentalfrontend.netlify.app/) · [Backend API repository](https://github.com/AriesMaster/BrightSmileDentalBackEnd) · [Developer portfolio](https://thabo.netlify.app/)

> **Project status:** Live in production. The Angular frontend is hosted on Netlify and connected to the ASP.NET Core API hosted on Render. BrightSmile Dental is a full-stack portfolio project that continues to receive feature updates and improvements.

## What the application covers

| Area | Workflow |
| --- | --- |
| Public site | Home, dental services catalogue and practice information |
| Authentication | Patient registration, login and role-protected routes |
| Patients | Patient dashboard, availability-based appointment booking and profile management |
| Dentists | Dentist dashboard and assigned-appointment workflows |
| Administration | Admin dashboard, patient and dentist management, service management, and date-filtered analytics with CSV export |
| Shared UI | Navigation, forms, responsive layouts and API communication |

The backend enforces authorization and booking rules. Frontend route guards improve navigation but **do not replace server-side authorization**.

## Technology

- Angular 21.2, Angular Material, TypeScript and RxJS
- HTML, CSS/SCSS, Angular routing and forms
- HTTP integration with an ASP.NET Core 10 REST API
- JWT bearer authentication and role-aware navigation
- Netlify frontend hosting
- PostgreSQL (Supabase) accessed **through the backend**, not directly from the browser

## System overview

```text
Browser
  |
  v
Angular SPA (Netlify / local development)
  | HTTPS + JSON + Authorization: Bearer <token>
  v
ASP.NET Core 10 Web API (Render)
  | Entity Framework Core / Npgsql
  v
Supabase PostgreSQL
```

See the [backend README](https://github.com/AriesMaster/BrightSmileDentalBackEnd#readme) for the data model, endpoints, role permissions, scheduling rules and manual API verification.

## Run locally

Install a Node.js version supported by Angular 21.2 and npm. Run the frontend commands from the nested workspace that contains `angular.json` and `package-lock.json`.

```bash
git clone https://github.com/AriesMaster/BrightSmileDentalFrontEnd.git
cd BrightSmileDentalFrontEnd/BrightSmileDentalFrontEnd
npm ci
```

Start the backend using the [backend setup instructions](https://github.com/AriesMaster/BrightSmileDentalBackEnd#local-development). Set `apiUrl` in `src/assets/environments/environment.ts` to your local backend URL, including the `/api` suffix.

```bash
npm start
```

Open http://localhost:4200. Use `npm run build` for a production build and `npm test` to invoke the configured test runner. The production build uses `src/assets/environments/environment.prod.ts`, which points to the Render API.

## Security and engineering notes

- The API, not the Angular client, is responsible for enforcing role and resource authorization.
- Never embed database credentials or JWT signing keys in frontend code.
- Avoid logging access tokens or sensitive patient information.
- Verify the frontend's environment-specific API URL and CORS settings when deploying.

## Roadmap

- [x] Deploy the frontend and backend and connect them in production.
- [ ] Add project screenshots and an accurate feature walkthrough.
- [ ] Expand automated component/service coverage and browser end-to-end tests.
- [ ] Add GitHub Actions build/test checks and deployment gates.

## Related repositories

- [BrightSmile Dental Backend](https://github.com/AriesMaster/BrightSmileDentalBackEnd)
- [Developer GitHub profile](https://github.com/AriesMaster)

## Developer

**Thabo Tankiso Mavundza** — Junior Full-Stack Software Developer  
Angular · TypeScript · C# · ASP.NET Core · EF Core · PostgreSQL
