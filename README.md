# BrightSmile Dental — Angular Frontend

**Dental appointment management | Angular · TypeScript · REST APIs · JWT**

BrightSmile Dental is a full-stack dental management portfolio project with separate Angular and ASP.NET Core repositories. The frontend provides role-oriented interfaces for **patients, dentists and administrators**.

[Live frontend](https://brightsmiledentalfrontend.netlify.app/) · [Backend API repository](https://github.com/AriesMaster/BrightSmileDentalBackEnd) · [Developer portfolio](https://thabo.netlify.app/)

> **Project status:** Active development. The frontend is published on Netlify, but a successful end-to-end connection to the deployed API has not yet been verified. Features described below represent the project's implemented or developing workflows, not a claim that every workflow is production-ready.

## What the application covers

| Area | Workflow |
| --- | --- |
| Authentication | Registration, login, password recovery and protected routes |
| Patients | Patient dashboard, appointments and profile workflows |
| Dentists | Dentist dashboard and assigned-appointment workflows |
| Administration | Administration dashboard, users and dental services |
| Shared UI | Navigation, forms, responsive layouts and API communication |

The backend enforces authorization and booking rules. Frontend route guards improve navigation but **do not replace server-side authorization**.

## Technology

- Angular and TypeScript
- HTML, CSS/SCSS, Angular routing and forms
- HTTP integration with an ASP.NET Core 10 REST API
- JWT bearer authentication and role-aware navigation
- Netlify frontend hosting
- PostgreSQL (Supabase) accessed **through the backend**, not directly from the browser

**Version note:** Confirm the installed Angular/CLI versions against the actual application workspace before pinning version-specific requirements here. The current repository-root `package.json` does not yet contain a complete Angular workspace script/dependency configuration.

## System overview

```text
Browser
  |
  v
Angular SPA (Netlify / local development)
  | HTTPS + JSON + Authorization: Bearer <token>
  v
ASP.NET Core 10 Web API
  | Entity Framework Core / Npgsql
  v
Supabase PostgreSQL
```

See the [backend README](https://github.com/AriesMaster/BrightSmileDentalBackEnd#readme) for the data model, endpoints, role permissions, scheduling rules and manual API verification.

## Run locally

The intended workflow is:

1. Clone this repository:
   ```bash
   git clone https://github.com/AriesMaster/BrightSmileDentalFrontEnd.git
   cd BrightSmileDentalFrontEnd
   ```
2. Install a compatible Node.js version and the Angular CLI.
3. **Verify or restore the complete Angular workspace files** (including its scripts, configuration and dependencies) before attempting an install or build. The repository-root `package.json` currently needs attention.
4. Configure the frontend's API base URL to point to your locally running backend; do not commit secrets.
5. Once the workspace configuration is verified, install dependencies and start the development server using the scripts defined in that workspace.

Typical Angular commands, **once supported by the restored workspace**, are `npm install`, `ng serve`, `ng build` and `ng test`. These commands are not claimed as verified against the current repository state.

## Security and engineering notes

- The API, not the Angular client, is responsible for enforcing role and resource authorization.
- Never embed database credentials or JWT signing keys in frontend code.
- Avoid logging access tokens or sensitive patient information.
- Verify the frontend's environment-specific API URL and CORS settings when deploying.

## Roadmap

- [ ] Verify and repair the committed Angular workspace configuration.
- [ ] Confirm deployed frontend-to-API connectivity and all role workflows.
- [ ] Add project screenshots and an accurate feature walkthrough.
- [ ] Add automated component/service tests and browser end-to-end tests.
- [ ] Add GitHub Actions build/test checks and deployment gates.

Items are unchecked until implemented and verified.

## Related repositories

- [BrightSmile Dental Backend](https://github.com/AriesMaster/BrightSmileDentalBackEnd)
- [Developer GitHub profile](https://github.com/AriesMaster)

## Developer

**Thabo Tankiso Mavundza** — Junior Full-Stack Software Developer  
Angular · TypeScript · C# · ASP.NET Core · EF Core · PostgreSQL

This is an actively developed portfolio project, not a production clinical records system.
