# LearnetIQ - AI-Powered Learning Management System

LearnetIQ is a modern, single-school Learning Management System (LMS) designed to empower students, tutors, parents, and administrators through a personalized and collaborative educational experience.

## 🚀 Key Features

- **Multi-Role Portals**: Dedicated dashboards for Students, Tutors, Parents, and Admins.
- **AI Study Buddy**: Personalized learning recommendations and study assistance powered by Google Gemini and Genkit.
- **Virtual Classrooms**: Real-time peer-to-peer video classes using WebRTC and Firebase signaling.
- **Community Forums**: Collaborative discussion spaces for different subjects and interests.
- **Resource Library**: A centralized hub for educational materials (PDFs, Videos, etc.).
- **Progress Tracking**: Visual analytics for academic performance and growth.
- **Secure Authentication**: Google Sign-In integration via Firebase Auth.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Components**: ShadCN UI + Tailwind CSS
- **Icons**: Lucide React
- **Backend/Auth**: Firebase (Authentication, Firestore)
- **AI**: Genkit + Google Generative AI (Gemini)
- **Video/RTC**: WebRTC

## 🏁 Getting Started

### Prerequisites

- Node.js (Latest LTS version)
- A Firebase Project
- A Google Cloud API Key (with Generative Language API enabled)

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd nextn
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   GOOGLE_GENAI_API_KEY=your_google_ai_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) with your browser.

## 📤 Pushing to GitHub

To push this project to your own GitHub repository, follow these steps in your local terminal:

1. **Initialize Git**:
   ```bash
   git init
   ```

2. **Add all files**:
   ```bash
   git add .
   ```

3. **Commit the changes**:
   ```bash
   git commit -m "Initial commit: LearnetIQ prototype"
   ```

4. **Add your remote repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   ```

5. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## 🌐 Deployment

This app is ready to be deployed on **Vercel**. Ensure you add your environment variables in the Vercel project settings.
