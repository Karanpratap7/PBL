# Healthcare Alert App

This is a healthcare alert application that allows users to send alerts to nearby hospitals in case of an emergency. It also includes a chatbot for answering user queries and a system for organ donation.

## Live Demo

You can view a live demo of the project here: [https://medi-bridge-healthcare.vercel.app/](https://medi-bridge-healthcare.vercel.app/)

## Features

-   User authentication (sign up, login)
-   Send alerts to nearby hospitals based on user's location
-   Hospital dashboard to view and manage alerts
-   Chatbot for answering user queries
-   Organ donation registration

## Technologies Used

-   [Next.js](https://nextjs.org/) - React framework for production
-   [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
-   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
-   [Supabase](https://supabase.io/) - Open source Firebase alternative
-   [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   pnpm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/Karanpratap7/PBL.git
    ```
2.  Install NPM packages
    ```sh
    pnpm install
    ```
3.  Set up your environment variables in a `.env.local` file. You will need to provide your Supabase URL and anon key.
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  Run the database migrations from the `scripts` folder.

### Running the application

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.