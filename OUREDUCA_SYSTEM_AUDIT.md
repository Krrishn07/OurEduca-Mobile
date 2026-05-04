# OurEduca: Comprehensive System Audit & Architectural Blueprint

This document provides a high-fidelity audit of the OurEduca mobile application, detailing its design philosophy, component architecture, and operational workflows.

---

## 1. Core Architecture & Tech Stack
OurEduca is built as a high-performance, real-time institutional management platform.

*   **Frontend**: React Native with Expo (Managed Workflow).
*   **Styling**: NativeWind (Tailwind CSS for React Native) with a "Platinum UI" design system.
*   **Backend**: Supabase (PostgreSQL, Realtime, Auth, Storage).
*   **Edge Logic**: Supabase Edge Functions (Deno) for secure third-party integrations.
*   **Payments**: Razorpay Standard Integration (WebView-based for cross-platform stability).

---

## 2. Design Philosophy: "The Platinum System"
The app adheres to a premium, modern aesthetic designed to "WOW" the user while maintaining high utility.

*   **Silhouette**: Mobile-first 540px containerization for consistent rendering across devices.
*   **Typography**: Optimized scale using `AppTypography` tokens (Inter/Outfit).
*   **Visual Language**:
    *   **Glassmorphism**: Subtle blurs and translucent layers for modals and overlays.
    *   **Tactical Grids**: 2x2 card layouts (`w-[48.2%]`) for navigation and action menus.
    *   **Dynamic States**: Numerical counts integrated directly into navigation tabs (removing distracting "pills").
*   **Terminology**: Transitioned from "Technical" to "Normal English" (e.g., "Master Register" -> "School Directory").

---

## 3. Role-Based Dashboards
The system dynamically adapts its interface based on the authenticated user's role.

### A. Student Dashboard
Focuses on academic consumption and financial compliance.
*   **Home**: Personalized greeting, attendance rate, and "Class-at-a-glance".
*   **Classes**: Registry of subjects with teacher avatars and last-topic sync.
*   **Videos**: A tri-tabbed hub (Classroom, Library, Gallery) with a built-in player.
*   **Fees**: Digital invoice list with real-time Razorpay checkout integration.

### B. Teacher/Faculty Dashboard
Focuses on classroom management and broadcasting.
*   **Materials Hub**: Privacy-aware document sharing (Class-wide vs. Section-specific).
*   **Announcements**: Global and targeted broadcasting with a "History" audit log.
*   **Live Streams**: Ability to initiate and manage virtual sessions.

### C. Headmaster (Admin) Dashboard
Focuses on institutional oversight.
*   **School Directory**: Unified management of Students and Teachers.
*   **Curriculum Grid**: 2x2 tactical grid for managing school-wide classes.
*   **Finance Hub**: Oversight of collection trends and recent payments.

---

## 4. Key Components & Features

### Action Components
*   **`ActionTile`**: High-fidelity 2x2 grid cards with HSL-themed icons and subtle shadows.
*   **`AppButton`**: Themed interactive elements with distinct primary/secondary states.
*   **`AppRow`**: Consistent layout for directory lists (School Directory, Notices).

### Specialized Modals
*   **`PaymentGatewayModal`**: A branded "Bridge" between the app and Razorpay, providing secure encryption indicators and method selection.
*   **`VideoPlayerModal`**: Full-screen immersive player for classroom resources.
*   **`RazorpayCheckout`**: A secure WebView container that manages the standard Razorpay payment script and returns success/failure callbacks.

---

## 5. Critical Workflows

### A. The Razorpay Payment Loop (Automated)
1.  **Initiation**: User clicks "Pay Now" -> App invokes `create-razorpay-order` Edge Function.
2.  **Order Generation**: Edge Function talks to Razorpay API -> returns a unique `Order ID`.
3.  **Local Sync**: App logs a `pending` transaction in the `fee_transactions` table.
4.  **Checkout**: App opens `RazorpayCheckout` WebView -> User pays using Test/Real cards.
5.  **Verification (Webhook)**: Razorpay pings `handle-razorpay-webhook`.
6.  **Auto-Update**: Webhook verifies the signature and instantly updates the Fee to `PAID` in the DB.

### B. The Privacy-Aware Resource Sync
Materials and Videos use a strict metadata-gate:
*   **Public Content**: Visible to the entire school.
*   **Section-Specific**: Only visible to students enrolled in that specific Class + Section combination (e.g., "10-A" vs "10-B").

### C. Terminology Standard (Plain English)
| Technical Term | Platinum Term |
| :--- | :--- |
| Faculty / Scholars | Teachers / Students |
| Master Register | School Directory |
| Curriculum | Classes |
| Transaction History | Recent Payments |
| Collection Trends | Collection History |

---

## 6. Maintenance & Future Scalability
*   **Multi-Tenancy**: Built to handle multiple schools by filtering all queries through `school_id`.
*   **Performance**: Uses `useCallback` and `useMemo` in core dashboards to prevent unnecessary re-renders during high-frequency real-time updates.
*   **Security**: Signature verification on all financial webhooks and Row Level Security (RLS) on sensitive database tables.

---

## 7. Strategic Role-Based Workflows (User Perspective)

This section details how different users interact with the same features from their unique perspectives.

### Workflow A: The Announcement Lifecycle
**Goal**: Ensuring critical information reaches the entire school instantly.

1.  **Headmaster Perspective**: 
    *   Navigate to **Management** > **New Announcement**.
    *   Types the message (e.g., "School Holiday tomorrow").
    *   Clicks **Post**. They see an instant confirmation toast and the message appears in their "Announcement History".
2.  **Teacher/Mentor Perspective**:
    *   The app's Home screen updates in real-time. A new banner appears at the top of their dashboard.
    *   They click the banner to read the full details.
3.  **Student Perspective**:
    *   Similar to the Teacher, the home banner updates. 
    *   They can also navigate to their "Notices" tab to see the history of all official communications.

### Workflow B: The Digital Fee Settlement
**Goal**: Frictionless payment collection without manual reconciliation.

1.  **Headmaster Perspective**:
    *   Navigate to **Fees** > **Issue New Invoice**.
    *   Selects a student (e.g., Zain Ahmed) and enters the amount (e.g., ₹2100).
    *   The invoice is logged. They can now see this under "Recent Payments" as "Pending".
2.  **Student Perspective**:
    *   Navigate to the **Fees** tab. They see a vibrant card for the ₹2100 fee with a **Pay Now** button.
    *   They click **Pay Now**, select their method, and complete the Razorpay checkout.
    *   The card immediately changes from "Pending" to "Processing" (and then "Paid" once verified).
3.  **System/Headmaster Perspective (Post-Payment)**:
    *   The Headmaster's dashboard updates automatically. The transaction status flips to **Verified** and the fee flips to **Paid** without any manual clicks.

### Workflow C: Academic Content Delivery
**Goal**: Secure, section-gated material sharing.

1.  **Teacher Perspective**:
    *   Navigate to **Academic Hub** > **Upload Material**.
    *   Selects the **Class** (e.g., "Grade 10 Science") and the **Section** (e.g., "Section A").
    *   Uploads a PDF or Video. They see it listed in their "My Uploads".
2.  **Student Perspective (Section A)**:
    *   Navigate to the **Materials** or **Videos** tab. 
    *   They see the new content immediately because their profile matches "Section A".
3.  **Student Perspective (Section B)**:
    *   Navigate to the same tab. **They do not see the material.** This ensures students only see relevant coursework for their specific section.

### Workflow D: Institutional Communication
**Goal**: Real-time support and coordination.

1.  **Student/Teacher Perspective**:
    *   Navigate to the **Messages** tab. 
    *   Select a contact (e.g., the Headmaster or a Subject Teacher).
    *   Sends a message. It appears in the chat bubble instantly.
2.  **Recipient Perspective**:
    *   A notification toast appears at the top of the screen (regardless of which tab they are on).
    *   The "Messages" tab shows a numerical badge (count).
    *   They open the chat and reply in real-time, creating a seamless feedback loop.
