# Project File Structure

## Root Files
- `main.jac` - Backend data structures (Nodes, Edges, Walker declarations)
- `main.impl.jac` - Backend business logic (Walker implementations)
- `main.cl.jac` - Frontend entry point (React Router, app component)
- `global.css` - Tailwind CSS with Ally brand colors
- `jac.toml` - Project configuration and dependencies

## Directories

### `/components/` - UI Components (Pure Presentation)
- `Header.cl.jac` - App header with Ally branding
- `MessageBubble.cl.jac` - Chat message bubbles
- `MessageInput.cl.jac` - Input field with send button
- `LoadingIndicator.cl.jac` - AI thinking animation
- `WelcomeScreen.cl.jac` - Empty state welcome screen

### `/pages/` - Page Components
- `ClaimsPage.cl.jac` - Main claims chat interface

### `/hooks/` - React Hooks (State Management)
- `useClaimsChat.cl.jac` - Chat state and message handlers

### `/service/` - Backend Communication
- `claimsService.cl.jac` - Wraps `root spawn` walker calls

### `/utils/` - Utilities
- `mergeCls.cl.jac` - Tailwind class merging with clsx + tailwind-merge

## Import Patterns

### From root level files:
```jac
import from ./pages.ClaimsPage { ClaimsPage }
import from ./global.css (import CSS)
```

### From subdirectories (e.g., components/, pages/):
```jac
import from ../utils.mergeCls { cn }
import from ../hooks.useClaimsChat { useClaimsChat }
import from ../components.Header { Header }
```

## Key Technologies
- **Jac** - Full-stack language (backend + frontend)
- **Graph Database** - Built-in (nodes + edges)
- **React** - Via jac-client
- **Tailwind CSS** - Utility-first styling
- **Ally Branding** - Primary: #4A154B (purple)
