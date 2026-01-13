# Ally GAP Claims Agent - Frontend

This is the frontend application for the Ally GAP Insurance Claim processing system. Built with React, TypeScript, and TailwindCSS, it provides an intuitive interface for claims analysts to process GAP insurance claims efficiently.

## Features

- **Document Upload & Analysis**: Drag-and-drop interface for claim documents
- **Real-time AI Processing**: Instant extraction of key claim information
- **Ally Branding**: Professional purple/white color scheme matching Ally's brand identity
- **Responsive Design**: Works on desktop and mobile devices
- **User Authentication**: Secure login and registration for claims processors

## Project Info

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React 18** - Modern UI framework
- **shadcn-ui** - High-quality component library
- **TailwindCSS** - Utility-first CSS framework with custom Ally theme
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching

## Ally Branding

The application uses Ally Financial's signature color scheme:
- Primary Purple: `#4A154B` (HSL: 292° 55% 19%)
- White backgrounds for clean, professional look
- Carefully tuned accent colors for optimal contrast and accessibility

## Project Structure

```
client/
├── src/
│   ├── components/     # UI components (JacChatbot → GAP Claims Interface)
│   ├── pages/         # Route pages (Login, Register, Dashboard)
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── services/      # API integrations
│   ├── styles/        # Global styles
│   └── lib/          # Utility functions
├── public/           # Static assets (logo, etc.)
└── index.html       # HTML entry point
```

## Development

After following the installation steps above, you can:

- Run `npm run dev` to start the development server
- Run `npm run build` to create a production build
- Run `npm run preview` to preview the production build locally

## Environment Variables

Create a `.env` file in the client directory with:

```env
VITE_API_URL=http://localhost:3000
```

## Key Components

- **JacChatbot** - Main chat interface for claim processing
- **Sidebar** - Navigation and user menu
- **ChatMessage** - Individual message display component
- **ChatInput** - Message input with file upload support
- **DocumentationPanel** - Context-aware help panel
