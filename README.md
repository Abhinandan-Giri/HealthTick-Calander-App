# HealthTick Calendar

HealthTick Calendar is a modern, responsive web application designed for health professionals to seamlessly book and manage client calls. It features a daily calendar view, supports both one-time onboarding calls and recurring follow-up appointments, and leverages Firebase Firestore for real-time data persistence.

## Features

- **Daily Calendar View**: A clear, time-slotted interface showing availability from 10:30 AM to 7:30 PM.
- **Dynamic Booking**: Click on an available time slot to open a booking dialog.
- **Two Call Types**:
    - **Onboarding (40 mins)**: One-time calls that occupy two 20-minute slots.
    - **Follow-up (20 mins)**: Recurring weekly calls that appear on the same day and time each week.
- **Client Management**: Select from a predefined list of clients when booking.
- **Persistent Storage**: All bookings are stored in and retrieved from Firebase Firestore.
- **Date Navigation**: Easily move between days or jump to the current date.
- **Responsive Design**: Fully functional on both desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Firebase Setup

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Firestore Database**:
    - In your Firebase project, navigate to **Build > Firestore Database**.
    - Click **Create database**.
    - Start in **test mode** for development. This allows open read/write access for 30 days.
    - Choose a location for your database.
3.  **Get Firebase Config**:
    - In your project's dashboard, go to **Project Overview** and click the **Web** icon (`</>`) to register a new web app.
    - Give your app a nickname and register it.
    - You will be provided with a `firebaseConfig` object.
4.  **Update Local Config**:
    - Open the file `src/lib/firebase.ts`.
    - Replace the placeholder `firebaseConfig` object with the one you copied from your Firebase project.

### Installation & Running the App

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## Project Structure

-   `src/app/`: Main application pages and layouts (using Next.js App Router).
-   `src/components/`: Reusable React components, organized by feature (`health-calendar`) and UI elements (`ui`).
-   `src/hooks/`: Custom React hooks for managing state and logic (e.g., `use-calendar-view.ts`).
-   `src/lib/`: Core utilities, type definitions, and Firebase configuration.
    -   `firebase.ts`: Firebase initialization.
    -   `clients.ts`: Static list of dummy clients.
    -   `types.ts`: TypeScript type definitions for the application.

## Data Model (Firestore)

The application uses two main collections in Firestore to manage bookings efficiently:

### `oneTimeCalls`

Stores one-time appointments, such as onboarding calls.

-   `clientId`: (string) - The ID of the client.
-   `clientName`: (string) - The name of the client.
-   `type`: (string) - Always "onboarding".
-   `startTime`: (Timestamp) - The exact date and time of the call.
-   `duration`: (number) - Duration in minutes (e.g., 40).

### `recurringCalls`

Stores recurring appointments, such as weekly follow-up calls.

-   `clientId`: (string) - The ID of the client.
-   `clientName`: (string) - The name of the client.
-   `type`: (string) - Always "follow-up".
-   `dayOfWeek`: (number) - The day of the week (0 for Sunday, 1 for Monday, etc.).
-   `timeOfDay`: (string) - The time in "HH:mm" format (e.g., "14:30").
-   `duration`: (number) - Duration in minutes (e.g., 20).
