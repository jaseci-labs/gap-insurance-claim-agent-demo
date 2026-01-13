# Ally GAP Insurance Claim Agent

An intelligent document processing system for GAP (Guaranteed Asset Protection) insurance claims, designed for internal use by Ally Financial. This AI-powered agent streamlines the claim intake process by automatically extracting key information from documents, identifying missing materials, and generating actionable next steps.

## Overview

This application demonstrates an end-to-end GAP claim intake workflow where business users can:

- Upload claim documents (GAP contracts, insurance settlement letters, payoff letters)
- Have key fields automatically extracted (lienholder, payoff amount, settlement amount, VIN, dates)
- Receive a comprehensive claim intake readiness assessment
- Get template follow-up emails for requesting missing documentation

## Why This Matters

GAP claims are document-heavy and require careful validation of multiple sources. This agent reduces intake time by 50% by automating what analysts currently do manually:

1. **Multi-document reasoning** - Analyzing multiple PDFs simultaneously
2. **Validation steps** - Checking if all required materials are present
3. **Downstream actions** - Generating emails and checklists automatically

## Key Features

### Document Processing
- Multimodal LLM for PDF analysis
- Extract structured data from unstructured documents
- Support for GAP contracts, insurance settlement letters, and payoff statements

### Intelligent Validation
- Automated completeness checks
- Missing document identification
- Compliance verification against claim requirements

### Business Workflow Automation
- Claim readiness assessments
- Auto-generated follow-up email templates
- Structured claim summaries for processors

### Professional Interface
- Ally's signature purple/white branding
- Clean, intuitive chat interface
- Real-time document analysis feedback

## Technology Stack

### Frontend
- React with TypeScript
- TailwindCSS with Ally color scheme
- Vite for build tooling
- shadcn/ui components

### Backend
- Node.js/Express server
- AI/ML integration for document processing
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gap-insurance-claim-agent-demo
```

2. Install dependencies:

**Client:**
```bash
cd client
npm install
# or
bun install
```

**Server:**
```bash
cd server
npm install
# or
bun install
```

3. Set up environment variables:
- Copy `.env.example` to `.env` in both client and server directories
- Configure your API keys and database connections

4. Start the development servers:

**Client (in client directory):**
```bash
npm run dev
# or
bun run dev
```

**Server (in server directory):**
```bash
npm run dev
# or
bun run dev
```

5. Access the application at `http://localhost:5173`

## Docker Deployment

### Development
```bash
docker-compose up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up
```

## Documentation

Comprehensive documentation about GAP insurance claims, processing requirements, and system usage is available in [`server/docs/ally-gap-insurance-claims.md`](server/docs/ally-gap-insurance-claims.md).

This includes:
- GAP insurance overview
- Required documentation for claims
- Processing workflows and timelines
- Claim approval criteria
- Agent best practices
- Branding guidelines

## Demo Flow

1. **Upload Documents**: User drags in sample documents:
   - GAP contract PDF
   - Auto insurance settlement letter
   - Payoff letter from lienholder

2. **AI Processing**: Agent extracts:
   - Vehicle Information (VIN, year, make, model)
   - Financial Details (payoff amount, settlement amount, GAP coverage)
   - Customer Information (name, contact details, policy number)
   - Dates and odometer readings

3. **Validation**: System checks for:
   - Proof of loss documentation
   - Odometer statement
   - All required signatures
   - Consistency across documents

4. **Output Generation**:
   - Claim Intake Readiness Assessment
   - List of complete vs. missing items
   - Suggested next steps
   - Template email for follow-up

## Business Impact

**"This would cut our intake time by 50%."**

**"This is exactly what analysts do today."**

By automating document review and validation, this system allows claims processors to:
- Handle more claims per day
- Reduce manual data entry errors
- Ensure consistency in claim intake
- Focus on complex decision-making rather than data extraction

## Project Structure

```
gap-insurance-claim-agent-demo/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # UI components (rebranded for Ally)
│   │   ├── pages/         # Page components (Login, Register, Dashboard)
│   │   ├── contexts/      # React context providers
│   │   ├── services/      # API service integrations
│   │   └── styles/        # Global styles and themes
│   └── public/            # Static assets
├── server/                # Backend API server
│   ├── docs/             # Documentation (GAP claims guide)
│   └── src/              # Server source code
└── docker-compose.yml    # Docker configuration
```

## Color Theme

The application uses Ally's professional purple/white color scheme:
- **Primary Purple**: `#4A154B` - Ally's signature brand color
- **White Backgrounds**: Clean, professional interface
- **Accent Colors**: Subtle purples for UI elements
- **Typography**: Dark text on light backgrounds for accessibility

## License

This is a demonstration project for internal use by Ally Financial.

## Contact

For questions about GAP claims processing, refer to:
- **Primary Auto Support**: 1-800-631-5590 (M-F, 8am-5pm)
- **Website**: [Ally Claims Support](https://www.ally.com/auto/vehicle-protection/claims-support/)
