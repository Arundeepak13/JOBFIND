# JobFind — Full Stack

A Spring Boot backend + vanilla HTML/CSS/JS frontend for a job-finding platform
(job seekers browse & apply, recruiters post jobs & review applicants).

## What was wrong, and what I fixed

Your backend had grown from a "microservices" plan (separate Gateway / Eureka /
Config Server apps) that was never actually wired up, plus a handful of typos
and logic slips. None of it was unfixable — here's everything that changed:

**Would have crashed on startup:**
- Four separate `@SpringBootApplication` classes (`Jobfind`, `ApiGateway`,
  `EurekaServer`, `ConfigServer`) lived in the same package with overlapping
  component scans. Removed the unused gateway/eureka/config-server apps and
  their configs — you now have one working Spring Boot app on port `8081`.
- `JobPostController` had four `@GetMapping("/search/{var}")` methods mapped
  to the exact same URL pattern (Spring doesn't care what you name the path
  variable) — an ambiguous mapping error. Split into `/search/company/{}`,
  `/search/type/{}`, `/search/title/{}`, `/search/location/{}`, `/search/remote/{}`.

**Broken security/auth:**
- The JWT check had inverted logic (`startsWith("Bearer")` rejected valid
  tokens instead of accepting them) and was written as a reactive
  `GatewayFilter`, which can't run inside a normal servlet app. Replaced with
  a real `OncePerRequestFilter` (`Security/JwtAuthFilter.java`) wired into
  `SecurityConfiguration`.
- Added CORS support so the frontend (running on a different origin) can
  actually call the API.
- `RecruiterController`'s path variable name (`{email}`) didn't match its
  parameter name (`recruiterEmail`) — Spring throws at runtime on that
  mismatch. Fixed.

**Typos that silently broke routing:**
- `/api/apllications` → `/api/applications`
- `/api/dashBoarads` → `/api/dashboard`
- Payment controller was mapped at `payment` instead of `/api/payment`
- `WebSocketConfig`'s override methods were misspelled
  (`registerStompEndpoint`, `configureMessgeBroker`) so Spring never called
  them — STOMP chat was silently never configured. Fixed the names and added
  `@Override`.

**Data-model bugs:**
- `Application.jobSeekerEmail` and `Application.recruiterEmail` were marked
  `@Column(unique = true)` — meaning, system-wide, each job seeker could ever
  submit exactly **one** application and each recruiter could ever receive
  exactly **one**. Removed; the real uniqueness rule (one application per
  job seeker *per job*) was already enforced correctly in the service layer.
- `JobPostDTO` and `ApplicationDTO` never exposed their `id` field, so there
  was no way for a client to say "apply to *this* job" or "update *this*
  application's status." Added `id` to both DTOs and their mappers.
- `JobPostService.mapToDTO` set `jobCategory` from itself instead of from the
  entity (always came back `null`). Fixed. Also: new job posts never got
  `active = true` or a real `postedAt` timestamp — now set server-side.
- `ApplicationRepository.findByJobTitle` / `findByJobType` returned
  `Optional<Application>` (max one result) even though callers wanted every
  matching row. Changed to `List<Application>`.
- `CourseController`'s "add course" endpoint used the literal path segment
  `/add/adminId` instead of a `{adminId}` path variable; fixed and simplified.
- `PaymentController`: a handler was missing its `public` modifier (Spring
  can't invoke non-public handler methods), a route was missing its path,
  and the `Content-Disposition` download header had a typo and wrong format.

**Not fixed (worth knowing about):**
- `DashBoardService` returns **hardcoded mock numbers**, not real database
  aggregates. The frontend dashboard will show a static demo. Wiring it to
  real repository counts is a small, separate follow-up.
- Security is intentionally simple right now: the JWT filter authenticates
  *identity* (so `authenticated()` works), but there's no role-based access
  control yet (e.g. nothing currently stops a job seeker from calling the
  "post a job" endpoint directly). Fine for a learning project or MVP; add
  `@PreAuthorize` / role checks before this touches real users.
- There's no "edit profile" endpoint on the backend — the frontend profile
  forms call `POST` again, which works because Hibernate will just insert a
  new row (there's no upsert). If you want real editing, add a `PUT` endpoint
  that updates the existing row by email.

## Running the backend

1. Make sure MySQL is running locally and create the database:
   ```sql
   CREATE DATABASE job_find;
   ```
2. Check `src/main/resources/application.properties` — update
   `spring.datasource.username` / `password` and the mail credentials to
   match your own setup (the committed values were someone's real Gmail
   credentials, which is worth rotating).
3. Run it:
   ```bash
   ./mvnw spring-boot:run
   ```
   The API comes up on `http://localhost:8081`.

## Running the frontend

The `frontend/` folder is plain HTML/CSS/JS — no npm install, no build step.
Because it calls `fetch()` against `localhost:8081`, serve it over HTTP
rather than opening the file directly (browsers restrict `fetch` from
`file://`):

```bash
cd frontend
python3 -m http.server 5500
```

Then open `http://localhost:5500`. If your backend runs somewhere other than
`localhost:8081`, update `API_BASE_URL` in `frontend/config.js`.

### What's in the frontend

- **Auth** — register (job seeker or recruiter) and log in; JWT stored in
  `localStorage`.
- **Job seeker view** — browse/search jobs, apply, track application status
  on a simple pipeline (Applied → Shortlisted/Rejected), manage profile.
- **Recruiter view** — post jobs, manage/close your listings, review
  applicants and update their status.
- **Admin view** — a dashboard reading from `/api/dashboard/*` (currently
  mock data, see note above). There's no self-registration for admins — the
  register form only offers job seeker/recruiter, matching how the backend
  is set up. Create an admin by registering normally, then updating that
  user's `role` column to `ADMIN` directly in the database.
