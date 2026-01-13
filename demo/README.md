# Ally GAP Insurance Claims Agent

A full-stack Jac application for processing GAP insurance claims with AI-powered document analysis and claim assessment.

## Features

- 🤖 AI-powered conversational interface
- 📄 Document upload and extraction
- ✅ Claim readiness assessment
- 📧 Automated follow-up email generation
- 🎨 Ally brand purple/white theme
- 📱 Responsive design with Tailwind CSS

## Project Structure

```
demo/
├── main.jac                    # Backend: Node and Walker declarations
├── main.impl.jac               # Backend: Walker implementations
├── main.cl.jac                 # Frontend: Main app with routing
├── global.css                  # Tailwind CSS + Ally brand colors
├── jac.toml                    # Project configuration
├── components/                 # React-like UI components
├── pages/                      # Page components
├── hooks/                      # React hooks for state management
├── service/                    # Backend communication layer
└── utils/                      # Utility functions
```

## Installation

```bash
jac install
```

## Running the App

```bash
jac start main.jac
```

The app will be available at http://localhost:8000

## Architecture

### Backend - Nodes (Data):
- User, ClaimSession, ClaimMessage, ClaimDocument, ClaimAssessment

### Backend - Walkers (API):
- get_or_create_session, process_message, upload_document, generate_assessment

### Frontend - Components with Tailwind CSS:
- Header, MessageBubble, MessageInput, LoadingIndicator, WelcomeScreen

## Ally Brand Colors

Primary: #4A154B (purple)
Background: #FFFFFF (white)
Surface: #F8F5F8 (light purple)
