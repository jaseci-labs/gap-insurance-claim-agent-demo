# GAP Insurance Claim Intake Agent

End-to-end claim processing agent that analyzes GAP insurance documents using AI.

## Features

- **PDF Upload**: Drag-and-drop interface for uploading claim documents
- **S3 Storage**: Secure document storage in AWS S3 (us-east-2)
- **AI Analysis**: Multimodal LLM extracts key fields from documents
- **Completeness Check**: Identifies missing documents/information
- **Smart Recommendations**: Generates next steps and follow-up emails

## Architecture

### Backend (Jac Walkers → FastAPI)

The backend uses **Jac walkers** that automatically convert to FastAPI endpoints:

1. **`upload_claim_documents`** - Uploads PDFs to S3
   - Endpoint: `POST /walker/upload_claim_documents`
   - Accepts multipart form data with files
   - Returns session ID

2. **`process_claim_documents`** - Processes documents from S3
   - Endpoint: `POST /walker/process_claim_documents`
   - Accepts: `{session_id: string}`
   - Downloads from S3, analyzes with LLM, returns assessment

3. **`get_claim_assessment`** - Retrieves stored assessment
   - Endpoint: `GET /walker/get_claim_assessment?session_id=xxx`

### Frontend (React + TypeScript)

- **ClaimIntake.tsx**: Main component with file upload and results display
- **Dashboard.tsx**: Tab navigation between Chat and Claim Intake
- Real-time progress updates during processing

### S3 Integration

- Bucket: `gap-claim-intake-documents`
- Region: `us-east-2`
- Structure: `{session_id}/{filename}.pdf`

## Setup

### Backend

```bash
cd server
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY=your_key
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# Run server
jac serve server.jac
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Document Types Supported

1. **GAP Contract** - GAP insurance policy
2. **Insurance Settlement** - Auto insurance payout letter
3. **Payoff Letter** - Vehicle loan payoff statement
4. **Proof of Loss** - Total loss documentation
5. **Odometer Statement** - Odometer reading
6. **Other** - Related documents

## Extracted Fields

- Lienholder name
- Payoff amount
- Settlement amount
- VIN
- Policy number
- Claimant name
- Important dates
- Vehicle info
- Claim number

## Assessment Output

```json
{
  "extractedFields": {...},
  "missingItems": ["Missing: Proof of loss", ...],
  "completenessScore": 75,
  "nextSteps": ["Step 1: ...", "Step 2: ..."],
  "followUpEmail": "Subject: ...\n\nDear...",
  "documentsAnalyzed": [...],
  "processingSteps": [...]
}
```

## Tech Stack

- **Backend**: Jac (jaclang), byLLM, FastAPI, boto3, pypdf
- **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui
- **AI**: GPT-4o (multimodal)
- **Storage**: AWS S3
- **LLM Framework**: byLLM (native Jac integration)

## Key Innovations

1. **Walkers as APIs**: Jac walkers automatically become REST endpoints
2. **byLLM Integration**: AI logic defined declaratively with `by llm()`
3. **Object-Spatial Programming**: Graph-based state management with nodes
4. **Zero DevOps**: No custom API routing code needed

## Future Enhancements

- [ ] Real-time SSE progress updates
- [ ] Multi-page document support
- [ ] Vision model for scanned/image documents
- [ ] Automated claim routing
- [ ] Integration with claim management systems
