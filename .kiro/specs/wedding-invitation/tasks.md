# Implementation Plan: Wedding Invitation Website

## Overview

Incremental implementation of a Next.js wedding invitation website with MongoDB, Google Drive integration, i18n support, and an admin panel. Tasks are ordered to build foundational layers first (data models, DB connection, API routes), then frontend components, then admin panel, and finally i18n wiring.

## Tasks

- [ ] 1. Set up project structure, dependencies, and database connection
  - [x] 1.1 Initialize Next.js project with TypeScript, install dependencies (mongodb, next-intl, bcrypt, jsonwebtoken, fast-check, vitest, @testing-library/react)
    - Create `next.config.js` with image domains for Google Drive
    - Create `.env.local` template with `MONGODB_URI`, `ADMIN_PASSWORD_HASH`, `JWT_SECRET`, `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_SERVICE_ACCOUNT_KEY`
    - _Requirements: 8.2, 8.3, 9.2_

  - [x] 1.2 Create MongoDB connection utility and data models
    - Create `lib/mongodb.ts` with singleton connection pattern
    - Create `lib/models.ts` with TypeScript interfaces for `Wedding`, `RSVP`, `Wish` as defined in the design
    - Create `lib/validation.ts` with validation functions for RSVP and Wish payloads (name max 100 chars, message max 500/1000 chars, attending boolean, numberOfAttendees 1-10)
    - _Requirements: 8.2, 8.5, 5.1, 6.3_

  - [ ]* 1.3 Write property test for validation logic
    - **Property 7: Form submission validation rejects invalid payloads**
    - Use fast-check to generate random payloads with missing/empty/whitespace-only required fields
    - Verify validation returns field-level error details for each invalid field
    - **Validates: Requirements 5.3, 6.3, 8.5**

- [ ] 2. Implement public API routes
  - [x] 2.1 Implement GET `/api/wedding` endpoint
    - Read the single wedding document from MongoDB
    - Return couple info, events, gallery URLs, translations, weddingDate
    - Return HTTP 503 on database connection failure
    - _Requirements: 8.1, 8.2, 8.4_

  - [x] 2.2 Implement POST `/api/rsvp` endpoint
    - Validate payload using `lib/validation.ts`
    - Return HTTP 400 with field-level errors for invalid payloads
    - Store valid RSVP in `rsvps` collection with `createdAt` timestamp
    - Return success confirmation
    - _Requirements: 5.2, 5.3, 5.4, 8.5_

  - [ ]* 2.3 Write property test for RSVP round-trip
    - **Property 6: RSVP submission round-trip**
    - Generate random valid RSVP payloads with fast-check, submit via endpoint, verify data persisted correctly
    - **Validates: Requirements 5.2**

  - [x] 2.4 Implement POST `/api/wishes` and GET `/api/wishes` endpoints
    - POST: Validate name and message, store wish with `approved: true` and `createdAt`
    - GET: Return only `approved: true` wishes, sorted by `createdAt` descending
    - Return HTTP 400 for invalid payloads, HTTP 503 on DB failure
    - _Requirements: 6.1, 6.2, 6.3, 8.1, 8.5_

  - [ ]* 2.5 Write property test for wishes filtering and sorting
    - **Property 8: Wishes are filtered to approved only and sorted newest-first**
    - Generate random wish arrays with mixed approved status and dates, verify filtering and sort order
    - **Validates: Requirements 6.1**

  - [ ]* 2.6 Write property test for wish round-trip
    - **Property 9: Wish submission round-trip**
    - Generate random valid wish payloads, submit and verify persistence
    - **Validates: Requirements 6.2**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement admin authentication and admin API routes
  - [x] 4.1 Implement POST `/api/admin/login` and auth middleware
    - Compare submitted password against `ADMIN_PASSWORD_HASH` env var using bcrypt
    - On success, return signed JWT in httpOnly cookie (24h expiry)
    - On failure, return 401 with "Invalid password" message
    - Create auth middleware that validates JWT on all `/api/admin/*` routes (except login)
    - Return 401 for missing, expired, or malformed tokens
    - _Requirements: 7.2, 7.3, 7.4_

  - [ ]* 4.2 Write property test for authentication correctness
    - **Property 10: Authentication correctness**
    - Generate random password strings, verify login succeeds only when password matches hash
    - **Validates: Requirements 7.3, 7.4**

  - [x] 4.3 Implement PUT `/api/admin/wedding` endpoint
    - Validate and update wedding content (couple info, events) in MongoDB
    - Require valid auth session
    - _Requirements: 7.5, 8.1_

  - [ ]* 4.4 Write property test for wedding content update round-trip
    - **Property 11: Wedding content update round-trip**
    - Generate random valid wedding content, update via PUT, read via GET, verify match
    - **Validates: Requirements 7.5**

  - [x] 4.5 Implement gallery management API routes
    - POST `/api/admin/gallery/upload`: Upload image to Google Drive folder, store URL in wedding document
    - DELETE `/api/admin/gallery/:id`: Remove photo from gallery array and optionally from Google Drive
    - Both require auth
    - _Requirements: 7.5, 8.3_

  - [x] 4.6 Implement GET `/api/admin/rsvps` and DELETE `/api/admin/wishes/:id` endpoints
    - GET `/api/admin/rsvps`: Return all RSVP records with name, attending, numberOfAttendees, message
    - DELETE `/api/admin/wishes/:id`: Set `approved: false` on the wish document
    - Both require auth
    - _Requirements: 7.6, 7.7_

  - [ ]* 4.7 Write property test for admin RSVP completeness
    - **Property 12: Admin RSVPs list returns all submissions**
    - Generate random sets of RSVP records, verify all N are returned
    - **Validates: Requirements 7.6**

  - [ ]* 4.8 Write property test for wish deletion exclusion
    - **Property 13: Deleting a wish excludes it from public listing**
    - Create a wish, delete via admin, verify it no longer appears in GET `/api/wishes`
    - **Validates: Requirements 7.7**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement invitation page frontend components
  - [x] 6.1 Create the Invitation Page layout and HeroSection component
    - Create the root page at `/` using SSR to fetch wedding data via `GET /api/wedding`
    - Implement `HeroSection` displaying couple names, wedding date, and featured background photo using Next.js Image
    - Implement `CountdownTimer` as a client component that updates every second
    - _Requirements: 1.1, 1.2, 1.3, 9.2, 9.3_

  - [ ]* 6.2 Write property test for countdown timer computation
    - **Property 1: Countdown timer computes correct remaining time**
    - Generate random future dates and current timestamps, verify days/hours/minutes/seconds sum back to the wedding date within 1 second
    - **Validates: Requirements 1.3**

  - [x] 6.3 Implement CoupleSection component
    - Display bride name, photo, bio; groom name, photo, bio; love story
    - Use Next.js Image for photos
    - _Requirements: 2.1, 2.2, 2.3, 9.2_

  - [ ]* 6.4 Write property test for couple section data completeness
    - **Property 2: Couple section renders all provided data**
    - Generate random couple data, verify all seven values appear in rendered output
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [x] 6.5 Implement EventSection component
    - Render event cards with date, time, venue name, address
    - Address links to Google Maps via `https://maps.google.com/?q={encoded_address}`
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 6.6 Write property tests for event section
    - **Property 3: Event section renders all events with complete details**
    - Generate random arrays of 1-5 events, verify all cards render with correct details
    - **Property 4: Venue address links to Google Maps**
    - Generate random address strings including special characters, verify link href correctness
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [x] 6.7 Implement GallerySection with lightbox
    - Grid layout with lazy-loaded thumbnails using Next.js Image
    - Click opens full-screen lightbox with prev/next navigation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.2_

  - [ ]* 6.8 Write property test for lightbox navigation
    - **Property 5: Lightbox navigation wraps correctly**
    - Generate random gallery sizes (1-50) and starting indices, verify next/prev wrap correctly
    - **Validates: Requirements 4.3**

  - [x] 6.9 Implement RSVPForm component
    - Form fields: name (required), attending (required radio), numberOfAttendees (1-10 select, shown when attending), message (optional textarea)
    - Client-side validation with inline error messages
    - Submit to POST `/api/rsvp`, show confirmation or error message
    - Disable submit button during request
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.10 Implement WishesSection component
    - Display approved wishes with name, message, date (newest first)
    - Include wish submission form with name and message (both required)
    - Client-side validation with inline error messages
    - Submit to POST `/api/wishes`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 6.11 Make Invitation Page responsive
    - Implement responsive layout: mobile (320-480px) with vertically stacked sections, tablet (481-1024px), desktop (>1024px)
    - Test layout renders correctly across breakpoints
    - _Requirements: 1.4, 1.5_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement admin panel frontend
  - [x] 8.1 Create admin login page and session handling
    - Create `/admin` page with password login form
    - On successful login, store JWT in httpOnly cookie
    - Redirect unauthenticated users to login form
    - Display "Invalid password" error on failed login
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 8.2 Implement admin dashboard with CoupleEditor and EventEditor
    - Tabbed interface for admin sections
    - CoupleEditor: Edit bride/groom names, bios, photos, love story via PUT `/api/admin/wedding`
    - EventEditor: Add/edit/remove events with date, time, venue fields via PUT `/api/admin/wedding`
    - _Requirements: 7.5_

  - [x] 8.3 Implement GalleryManager in admin panel
    - Upload photos via POST `/api/admin/gallery/upload`
    - Delete photos via DELETE `/api/admin/gallery/:id`
    - Drag-and-drop upload support
    - _Requirements: 7.5_

  - [x] 8.4 Implement RSVPList and WishesManager in admin panel
    - RSVPList: Read-only table of all RSVPs (name, status, count, message)
    - WishesManager: List of wishes with delete button, calls DELETE `/api/admin/wishes/:id`
    - _Requirements: 7.6, 7.7_

- [ ] 9. Implement i18n support
  - [x] 9.1 Set up next-intl with Vietnamese and English locale files
    - Create `/messages/vi.json` and `/messages/en.json` with all UI labels
    - Configure next-intl in Next.js app
    - Store language preference in cookie, default to `vi`
    - _Requirements: 10.1_

  - [x] 9.2 Implement LanguageToggle component and content translation
    - Render language toggle only when English translations exist in wedding data
    - On toggle, re-render all UI labels and wedding content in selected language without full page reload
    - _Requirements: 10.2, 10.3_

  - [ ]* 9.3 Write property test for language toggle visibility
    - **Property 14: Language toggle visibility depends on translation configuration**
    - Generate random wedding configs with/without translations, verify toggle visibility
    - **Validates: Requirements 10.2**

  - [ ]* 9.4 Write property test for language switching
    - **Property 15: Language switching renders correct translations**
    - Generate random language selection and translation keys, verify labels match selected language
    - **Validates: Requirements 10.3**

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests use fast-check and validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All code is TypeScript, using Next.js App Router with Vitest + React Testing Library for testing
