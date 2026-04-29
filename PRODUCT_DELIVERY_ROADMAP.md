# OurEduca: Product Delivery & Testing Roadmap

As a Product Delivery Manager, this document serves as the master checklist for the OurEduca platform. It defines what is ready for Quality Assurance (QA), what critical features are missing before launch, and what should be deferred to Version 2.

---

## Part 1: Fully Implemented Workflows (Ready for QA Testing)

### Workflow A: The Announcement & Notice Board Loop
*   **Action**: Headmaster creates a new global or targeted announcement.
*   **Test Criteria**:
    *   [ ] Does the Headmaster see the announcement in their history?
    *   [ ] Do Teachers and Students instantly see the banner on their Home screen?

### Workflow B: The Digital Fee Settlement (Razorpay)
*   **Status**: **VERIFIED FUNCTIONAL**.
*   **Action**: Headmaster issues an invoice; Student pays via Razorpay.
*   **Test Criteria**:
    *   [x] Does the issued invoice appear on the Student's dashboard?
    *   [x] Does the Razorpay Webhook successfully ping the Edge Function?
    *   [x] Does the database auto-update the fee status to "Paid" via the Webhook?

### Workflow C: Academic Content & Privacy Gating
*   **Action**: Teacher uploads a document or video targeted at a specific Section (e.g., 10-A).
*   **Test Criteria**:
    *   [ ] Does the upload succeed and log in the Teacher's "My Uploads"?
    *   [ ] Do students in Section 10-A see the content immediately while 10-B is restricted?

---

## Part 2: Live Video & Streaming Architecture (The Blueprint Phase)

Based on the `video-screen-implemenation.jsx` prototype, the UI logic is fully mapped out but requires integration into the React Native mobile app and connection to a real streaming engine.

### Workflow D: Teacher Live Broadcasting
*   **Action**: A subject teacher initiates a live class.
*   **The Flow**:
    1.  Navigate to the **Go Live** tab.
    2.  Select source (Device Camera, IP CCTV Feed, or Screen Share).
    3.  Select the scheduled class (e.g., Mathematics 10-A) and click **Go Live**.
    4.  The teacher enters the "Live Control Panel" with active viewer counts and an elapsed timer.
    5.  Upon clicking **End & Save**, the teacher is prompted to publish the recording directly to the Video Library.

### Workflow E: Mentor & Headmaster "Silent Monitoring"
*   **Action**: Administrative oversight of live classrooms.
*   **The Flow**:
    1.  Navigate to the **Live Monitor** tab.
    2.  See a pulsing list of all currently active classes across the school.
    3.  Click **Watch/Monitor** to enter the stream.
    4.  *Crucial Feature*: Mentors/Headmasters enter "Read-Only/Silent" mode. The teacher and students are not notified of their presence, ensuring un-interrupted evaluation.

### Workflow F: Student & Parent Viewing
*   **Action**: Attending a live class or reviewing recorded material.
*   **The Flow**:
    1.  Student navigates to **Live Now** and joins active classes for their assigned section.
    2.  **Parent Mode Toggle**: Parents can switch profiles to monitor their child's active streams securely.
    3.  Students navigate to the **Library** to search for and re-watch published recordings.

### Workflow G: Headmaster Staff Meetings
*   **Action**: Conducting secure, internal video conferences.
*   **The Flow**:
    1.  Headmaster clicks **+ New Meeting**.
    2.  Selects specific staff members from the online directory.
    3.  Launches a multi-tile video grid (similar to Zoom/Teams) specifically branded with the Springfield Academy secure watermark.

---

## Part 3: Critical Missing Features ("Must-Haves" for Go-Live)
The app cannot be deployed to production until these foundational systems are built and tested.

### 1. Live Streaming Engine Integration (For Video Hub)
*   **Current State**: The UI is an HTML/React prototype with fake viewfinders.
*   **What Must Be Built**: 
    *   Translate the JSX prototype into React Native (`NativeWind` + `View`/`Text`).
    *   Integrate a real-time communication SDK (e.g., **Agora.io** or **LiveKit**) to handle the actual video/audio transmission for Live Classes and Staff Meetings.
    *   Implement `expo-video` for playback of recorded library items.

### 2. Real Authentication & Session Management
*   **Current State**: Running on `MockAuthContext` (simulated logins).
*   **What Must Be Built**: 
    *   Integration of Supabase Auth (Email/Password or OTP).
    *   Secure JWT token handling for API requests (crucial for Edge Functions).

### 3. Push Notification Infrastructure
*   **Current State**: In-app toasts work, but background push notifications do not exist.
*   **What Must Be Built**:
    *   Expo Push Notification setup.
    *   Supabase Database Webhooks to trigger alerts for "Live Class Starting" or new Announcements.

### 4. User Onboarding & Provisioning Flow
*   **Current State**: Users are manually injected into the database.
*   **What Must Be Built**:
    *   How does a Headmaster create a new Teacher account?
    *   A secure "Invite Link" or bulk CSV upload system.

---

## Part 4: Left-Out / Nice-to-Haves (V2 Roadmap)
These features are valuable but should not block the initial launch.

1.  **Offline Mode**: Caching data (using `AsyncStorage` or WatermelonDB) so students can view downloaded materials without an internet connection.
2.  **Advanced Analytics Export**: Allowing Headmasters to export fee collection trends or attendance reports as PDF/CSV files.
3.  **Automated Reminders**: Cron jobs to automatically send push notifications for "Fee Overdue".
4.  **Razorpay Route**: Upgrading from a single merchant account to Razorpay Route, allowing automatic splitting of platform fees and school revenue.
