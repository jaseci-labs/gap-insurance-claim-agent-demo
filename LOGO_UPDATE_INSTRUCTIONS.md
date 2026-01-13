# Logo Update Instructions

## Current Status
The application is configured to use `/logo.png` from the public directory for the Ally branding.

## Required Action
Replace the existing logo file with the Ally logo:

1. Save the Ally logo image (purple "ally" wordmark on white/transparent background) as:
   - **Path**: `client/public/logo.png`
   - **Recommended size**: 512x512px or similar square format for best display
   - **Format**: PNG with transparent background preferred

2. The logo is currently referenced in these files:
   - `client/src/components/JacChatbot.tsx` (line 15)
   - `client/src/components/Sidebar.tsx` (line 16)
   - `client/src/pages/Login.tsx` (line 38)
   - `client/src/pages/Register.tsx` (line 138)

## Ally Logo Details
- **Color**: Purple (#4A154B or similar - Ally's signature purple)
- **Style**: Modern wordmark with distinctive lowercase "a" with circular element
- **Background**: White or transparent
- **Usage**: Official Ally Financial branding

## Alternative: Multiple Logo Formats
If you need different logo formats for different contexts:

- `logo.png` - Main logo for general use
- `logo-icon.png` - Square icon version for favicons
- `logo-light.png` - Light version for dark backgrounds (if needed)
- `logo-dark.png` - Dark version for light backgrounds

Currently, the app uses a light theme with dark text/logos, so a single purple logo on transparent background works best.

## Verification
After replacing the logo, verify it appears correctly in:
1. Sidebar header
2. Main chat interface header
3. Login page
4. Registration page
5. Browser favicon (if configured)

## Notes
- The image you provided shows the perfect Ally branding
- Simply save that image as `client/public/logo.png` and it will automatically be used throughout the app
- No code changes needed - all references already point to `/logo.png`
