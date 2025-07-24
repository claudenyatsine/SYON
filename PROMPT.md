## Prompt for Developing and Extending the LearnetIQ Platform

### Overview

You are an expert AI software developer tasked with building and extending **LearnetIQ**, an all-in-one, feature-rich online learning platform. LearnetIQ is designed to provide a comprehensive and engaging educational experience for students, with tools for tutors and insights for parents. The platform combines personalized learning, collaborative features, and interactive content to help students achieve academic success. The tech stack is Next.js, React, TypeScript, Tailwind CSS, ShadCN for UI components, and Genkit for AI-powered features.

### Target Audience

1.  **Students (K-12/Higher Education):** The primary users who consume content, track progress, and interact with tutors and peers.
2.  **Tutors/Educators:** Professionals who create content, manage courses, and provide support to students through live classes and messaging.
3.  **Parents:** Guardians who can monitor their child's progress, and understand their learning journey.

### Core Application Sections & Features

#### 1. Public-Facing Landing Page (`/`)

This is the main entry point for unregistered users. It should be visually engaging and clearly communicate the platform's value.

*   **Hero Section:** A full-screen, impactful introduction with a clear call-to-action (CTA) to sign up.
*   **Features Carousel:** A dynamic, full-screen, autoplaying carousel that showcases the key features of the platform (e.g., Course Management, Assessment System, Live Classroom, AI Enhancements).
*   **Statistics Section:** Visually appealing cards and charts displaying key metrics that build trust and show platform impact (e.g., Active Students, Completion Rate, Student Growth Charts).
*   **Testimonials:** Quotes from satisfied students and parents to provide social proof.
*   **Footer:** Contains links to important pages, company information, and a final sign-up CTA.
*   **Authentication Modals:** Sign-up and Login forms are presented in modals, accessible from the header and various CTAs. Authentication must support both email/password and Google Sign-In.

#### 2. Main Application (Authenticated Routes)

This is the core of the platform, accessible after a user logs in. It's wrapped in a consistent layout with a collapsible sidebar for navigation and a header.

*   **Layout (`/app/layout.tsx`):**
    *   A persistent, collapsible sidebar for navigation between all main sections (Dashboard, Resources, Forums, etc.).
    *   A header containing a global search bar, theme toggler (light/dark), notifications, and a user profile dropdown.

*   **Dashboard (`/app/dashboard`):**
    *   The user's personalized homepage.
    *   Displays progress cards for different subjects.
    *   Features an "AI Tutor Assistant" card where students can select their grade level and a subject to receive AI-generated learning resource recommendations.
    *   Shows a card for an "Upcoming Live Class" to encourage participation.

*   **Resources (`/app/resources`):**
    *   A curated library of learning materials.
    *   Resources are grouped by subject (e.g., Mathematics, Physics) in expandable accordion sections.
    *   Within each subject, resources are further categorized into "Media" and "Documents."
    *   Each resource is displayed as a card with an image, title, description, and a "View Resource" button.

*   **Forums (`/app/forums`):**
    *   The community hub for discussions.
    *   The main page lists all available subject forums (e.g., Mathematics, History).
    *   An AI-powered feature generates a concise summary of recent activity for each forum, displayed directly on this page.
    *   Clicking "Enter Forum" navigates the user to a dedicated page for that subject (`/app/forums/[subject]`).
    *   The subject forum page allows users to post new questions and view existing discussions.

*   **Messages (`/app/messages`):**
    *   A real-time direct messaging feature.
    *   A responsive layout with a contact list (filterable by Tutors/Peers) and a chat window.
    *   Users can select a contact to view their conversation history and send new messages.

*   **Progress (`/app/progress`):**
    *   A dedicated section for tracking performance.
    *   Features key metric cards (Courses Completed, Average Score, Study Time).
    *   Includes two main charts:
        1.  **Overall Progress:** A line chart showing learning completion over time.
        2.  **Subject Performance:** A bar chart comparing scores across different subjects.

*   **Live Classes (`/app/live-classes`):**
    *   A page to browse and join live sessions.
    *   Displays class cards with an image, title, tutor, and status (On going, Upcoming, Completed).
    *   Includes tabs to filter classes by their status.
    *   The "Join Class" button on an ongoing class navigates to the virtual classroom (`/app/live-classes/[classId]`).

*   **Virtual Classroom (`/app/live-classes/[classId]`):**
    *   A feature-rich page for participating in a live class.
    *   **Main View:** Shows the tutor's video stream.
    *   **Controls:** Buttons for toggling mic/camera, ending the call, and entering full-screen mode.
    *   **Participants View:** A grid showing videos of other participants.
    *   **Chat Room:** A sidebar for sending and viewing messages during the session.
    *   **Class Resources:** A section for uploading and downloading relevant class materials.

### AI and Genkit Integration

Genkit is used for all generative AI functionalities.

*   **Resource Recommendations (`recommend-learning-resources.ts`):** A flow that takes a student's grade level and subject to recommend relevant learning materials.
*   **Forum Summaries (`generate-subject-forum-summaries.ts`):** A flow that processes recent forum posts and generates a concise summary for each subject.
*   **Welcome Email (`send-welcome-email.ts`):** A flow that uses an AI tool to compose and "send" a welcome email to new users upon registration.