# Requirements Document

## Introduction

A single-customer wedding invitation website inspired by Vietnamese wedding invitation platforms (e.g., biihappy.com). The site serves as a digital wedding invitation where guests can view wedding details, browse the couple's photo gallery, confirm attendance via RSVP, and leave wishes for the couple. This initial version targets one specific wedding with static configuration, laying the groundwork for future multi-tenant expansion.

## Glossary

- **Invitation_Page**: The main landing page of the wedding invitation website that displays all wedding information in a single scrollable layout
- **Hero_Section**: The top visual area of the Invitation_Page displaying the couple's names, wedding date, and a featured photo
- **Couple_Section**: A section of the Invitation_Page that introduces the bride and groom with individual photos and short biographies
- **Event_Section**: A section displaying wedding event details including ceremony and reception times, dates, and venue locations
- **Gallery_Section**: A section showcasing the couple's photos in a grid or carousel layout
- **RSVP_Form**: A form allowing guests to confirm their attendance, specify the number of attendees, and leave a personal message
- **Wishes_Section**: A section displaying congratulatory messages and wishes submitted by guests
- **Countdown_Timer**: A visual component showing the remaining time until the wedding date
- **Admin_Panel**: A protected interface for the couple to manage wedding content, view RSVPs, and moderate guest wishes
- **Guest**: A visitor to the Invitation_Page, typically someone invited to the wedding
- **CMS**: Content Management System — the backend data layer storing all wedding content (couple info, events, photos, wishes, RSVPs)
- **API_Server**: The Next.js API routes backend that serves wedding data and handles form submissions

## Requirements

### Requirement 1: Display Wedding Invitation Landing Page

**User Story:** As a guest, I want to see a beautiful wedding invitation page, so that I can learn about the couple's wedding details at a glance.

#### Acceptance Criteria

1. WHEN a Guest navigates to the website root URL, THE Invitation_Page SHALL render the Hero_Section, Couple_Section, Event_Section, Gallery_Section, RSVP_Form, and Wishes_Section in a single scrollable layout
2. THE Hero_Section SHALL display the couple's names, wedding date, and a featured background photo
3. THE Invitation_Page SHALL include a Countdown_Timer showing days, hours, minutes, and seconds remaining until the wedding date
4. THE Invitation_Page SHALL be responsive and render correctly on mobile devices with viewport widths from 320px to 480px, tablets from 481px to 1024px, and desktops above 1024px
5. WHEN the Invitation_Page is loaded on a mobile device, THE Invitation_Page SHALL display a mobile-optimized layout with vertically stacked sections

### Requirement 2: Display Couple Information

**User Story:** As a guest, I want to see information about the bride and groom, so that I can learn more about the couple.

#### Acceptance Criteria

1. THE Couple_Section SHALL display the bride's full name, photo, and a short biography
2. THE Couple_Section SHALL display the groom's full name, photo, and a short biography
3. THE Couple_Section SHALL display the couple's love story or relationship summary

### Requirement 3: Display Wedding Event Details

**User Story:** As a guest, I want to see the wedding event schedule and venue information, so that I know when and where to attend.

#### Acceptance Criteria

1. THE Event_Section SHALL display the ceremony date, time, and venue name with address for each wedding event
2. WHERE multiple events are configured (e.g., ceremony and reception), THE Event_Section SHALL display each event as a separate card with its own date, time, and venue
3. WHEN a Guest taps on a venue address, THE Event_Section SHALL open the location in Google Maps or an equivalent map application

### Requirement 4: Display Photo Gallery

**User Story:** As a guest, I want to browse the couple's photos, so that I can enjoy their memories together.

#### Acceptance Criteria

1. THE Gallery_Section SHALL display photos in a grid layout
2. WHEN a Guest clicks on a photo in the Gallery_Section, THE Gallery_Section SHALL open a full-screen lightbox view of the selected photo
3. WHILE the lightbox is open, THE Gallery_Section SHALL allow the Guest to navigate between photos using previous and next controls
4. THE Gallery_Section SHALL load photo thumbnails using lazy loading to optimize page performance

### Requirement 5: Submit RSVP

**User Story:** As a guest, I want to confirm my attendance, so that the couple can plan for the correct number of attendees.

#### Acceptance Criteria

1. THE RSVP_Form SHALL collect the guest's name, attendance confirmation (attending or not attending), number of attendees (1 to 10), and an optional personal message
2. WHEN a Guest submits a valid RSVP_Form, THE API_Server SHALL store the RSVP data in the CMS and display a confirmation message to the Guest
3. IF a Guest submits the RSVP_Form with a missing name or missing attendance selection, THEN THE RSVP_Form SHALL display a validation error message next to the invalid field
4. IF the API_Server fails to store the RSVP data, THEN THE RSVP_Form SHALL display an error message asking the Guest to try again

### Requirement 6: Display and Submit Guest Wishes

**User Story:** As a guest, I want to leave a congratulatory message for the couple, so that I can share my happiness with them.

#### Acceptance Criteria

1. THE Wishes_Section SHALL display all approved guest wishes with the guest's name, message, and submission date, ordered from newest to oldest
2. WHEN a Guest submits a wish with a name and message, THE API_Server SHALL store the wish in the CMS
3. IF a Guest submits a wish with an empty name or empty message, THEN THE Wishes_Section SHALL display a validation error message
4. THE Wishes_Section SHALL display newly submitted wishes after the page is refreshed

### Requirement 7: Manage Wedding Content via Admin Panel

**User Story:** As the couple, I want to manage my wedding content, so that I can update information, photos, and review guest responses.

#### Acceptance Criteria

1. THE Admin_Panel SHALL be accessible at the "/admin" URL path
2. WHEN an unauthenticated user navigates to the Admin_Panel, THE Admin_Panel SHALL display a password login form
3. WHEN the couple enters the correct password, THE Admin_Panel SHALL grant access to the management interface
4. IF an incorrect password is entered, THEN THE Admin_Panel SHALL display an "Invalid password" error message
5. WHILE authenticated, THE Admin_Panel SHALL allow the couple to update couple information (names, bios, photos), event details (dates, times, venues), and gallery photos
6. WHILE authenticated, THE Admin_Panel SHALL display a list of all RSVP submissions with guest name, attendance status, number of attendees, and message
7. WHILE authenticated, THE Admin_Panel SHALL allow the couple to delete inappropriate guest wishes

### Requirement 8: Store and Serve Wedding Data

**User Story:** As a developer, I want a reliable data backend, so that all wedding content and guest submissions are persisted and served efficiently.

#### Acceptance Criteria

1. THE API_Server SHALL expose RESTful endpoints to read wedding content (couple info, events, gallery) and to create RSVP and wish submissions
2. THE API_Server SHALL store all wedding data in a MongoDB database
3. THE API_Server SHALL serve gallery images from Google Drive
4. IF the database connection fails, THEN THE API_Server SHALL return an HTTP 503 status code with a descriptive error message
5. THE API_Server SHALL validate all incoming request payloads and return HTTP 400 with field-level error details for invalid requests

### Requirement 9: Optimize Page Load Performance

**User Story:** As a guest, I want the invitation page to load quickly, so that I have a smooth browsing experience even on slow mobile connections.

#### Acceptance Criteria

1. THE Invitation_Page SHALL achieve a Lighthouse Performance score of 80 or above on mobile
2. THE Invitation_Page SHALL use Next.js Image optimization for all displayed photos
3. THE Invitation_Page SHALL use server-side rendering for the initial page load to ensure wedding content is visible without client-side JavaScript execution

### Requirement 10: Support Vietnamese and English Content

**User Story:** As the couple, I want to display wedding content in Vietnamese (primary) with the option for English, so that all guests can understand the invitation.

#### Acceptance Criteria

1. THE Invitation_Page SHALL render all UI labels and static text in Vietnamese by default
2. WHERE the couple configures English translations in the Admin_Panel, THE Invitation_Page SHALL display a language toggle allowing guests to switch between Vietnamese and English
3. WHEN a Guest selects a language, THE Invitation_Page SHALL re-render all UI labels and wedding content in the selected language without a full page reload
