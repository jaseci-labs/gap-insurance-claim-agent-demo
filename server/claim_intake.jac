"""GAP Claim Intake Agent - Helper functions for document processing using multimodal LLM and S3 storage."""

import os;
import json;
import boto3;
import from datetime {datetime}
import from byllm.lib {Model}
import from pypdf {PdfReader}
import from pathlib {Path}
import from io {BytesIO}
import from dotenv {load_dotenv}

with entry {
    load_dotenv(override=True);
}

# Initialize LLM for document analysis
glob llm = Model(model_name="gpt-4o");

"""Structured output for extracted claim fields"""
obj ExtractedFields {
    has lienholder: str;
    has payoffAmount: str;
    has settlementAmount: str;
    has vin: str;
    has policyNumber: str;
    has claimantName: str;
    has dates: list[str];
    has vehicleInfo: str;
    has claimNumber: str;
}

sem ExtractedFields.lienholder = "Lienholder/Finance Company name, or null if not found";
sem ExtractedFields.payoffAmount = "Payoff Amount as string (e.g., '$15,000'), or null if not found";
sem ExtractedFields.settlementAmount = "Settlement Amount from insurance as string, or null if not found";
sem ExtractedFields.vin = "Vehicle Identification Number (VIN), or null if not found";
sem ExtractedFields.policyNumber = "Policy Number, or null if not found";
sem ExtractedFields.claimantName = "Claimant Name, or null if not found";
sem ExtractedFields.dates = "Important dates (claim date, incident date, etc.) as array of strings, empty array if none";
sem ExtractedFields.vehicleInfo = "Vehicle Make/Model/Year (e.g., '2020 Honda Accord'), or null if not found";
sem ExtractedFields.claimNumber = "Claim Number, or null if not found";

"""Document type classification result"""
obj DocumentType {
    has category: str;
    has confidence: float;
}

sem DocumentType.category = "One of: GAP_CONTRACT, INSURANCE_SETTLEMENT, PAYOFF_LETTER, PROOF_OF_LOSS, ODOMETER_STATEMENT, OTHER";
sem DocumentType.confidence = "Confidence score between 0.0 and 1.0";

# S3 Configuration
glob S3_BUCKET = "gap-claim-intake-documents";
glob S3_REGION = "us-east-2";
glob s3_client = boto3.client('s3', region_name=S3_REGION);

# Node for claim processing state
node ClaimSession {
    has session_id: str;
    has s3_keys: list[str] = [];
    has filenames: list[str] = [];
    has assessment: dict = {};
    has status: str = "pending";
    has created_at: str = "";
}

"""Upload file to S3."""
def upload_to_s3(file_content: bytes, s3_key: str) -> str {
    try {
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=file_content,
            ContentType='application/pdf'
        );
        return f"s3://{S3_BUCKET}/{s3_key}";
    } except Exception as e {
        print(f"Error uploading to S3: {e}");
        return "";
    }
}

"""Download file from S3."""
def download_from_s3(s3_key: str) -> bytes {
    try {
        response = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key);
        return response['Body'].read();
    } except Exception as e {
        print(f"Error downloading from S3: {e}");
        return b"";
    }
}

"""Extract text content from PDF bytes."""
def extract_pdf_text_from_bytes(pdf_bytes: bytes) -> str {
    try {
        pdf_file = BytesIO(pdf_bytes);
        reader = PdfReader(pdf_file);
        text = "";
        for page in reader.pages {
            text += page.extract_text() + "\n\n";
        }
        return text.strip();
    } except Exception as e {
        print(f"Error extracting PDF text: {e}");
        return "";
    }
}

"""Analyze GAP claim document and extract key fields using structured output."""
def analyze_claim_document(
    document_text: str,
    document_type: str
) -> ExtractedFields by llm(method="Reason", temperature=0.0);

sem analyze_claim_document = """
You are a GAP insurance claim processing expert. Analyze the provided document text and extract key information.

Extract all fields present in the document. Use null for fields not found in the document.
For dates, return an array of date strings found in the document.

Focus on precision and accuracy. If a field is ambiguous or unclear, return null rather than guessing.
""";

"""Identify what type of document this is using structured output."""
def classify_document(document_text: str) -> DocumentType by llm(method="Reason", temperature=0.1);

sem classify_document = """
Classify this insurance/financial document into one of the following categories:
- GAP_CONTRACT: GAP insurance contract or policy
- INSURANCE_SETTLEMENT: Auto insurance settlement or payout letter
- PAYOFF_LETTER: Vehicle loan payoff statement
- PROOF_OF_LOSS: Proof of loss or total loss documentation
- ODOMETER_STATEMENT: Odometer disclosure or reading document
- OTHER: Other related document

Provide a confidence score for your classification (0.0 to 1.0).
""";

"""Determine what documents/information are missing for a complete claim."""
def identify_missing_items(all_documents_json: str) -> list[str] by llm(
    method="Reason",
    temperature=0.2,
    incl_info=(
        "You are a GAP insurance claim expert. Based on the documents provided, identify what is missing for a complete claim.\n\n"
        "Standard required items for GAP claim:\n"
        "1. GAP insurance contract/policy\n"
        "2. Auto insurance settlement letter showing total loss payout\n"
        "3. Vehicle loan payoff letter from lienholder\n"
        "4. Proof of loss documentation\n"
        "5. Odometer statement/reading at time of loss\n"
        "6. Police report (for theft/accident cases)\n"
        "7. Title documentation\n\n"
        f"Documents provided:\n{all_documents_json}\n\n"
        "Return a JSON array of missing items with clear descriptions.\n"
        "Format: [\"Missing: Proof of loss documentation\", \"Missing: Odometer statement\", ...]"
    )
);

"""Generate follow-up email requesting missing documents."""
def generate_followup_email(
    claimant_name: str,
    missing_items: list[str],
    extracted_fields_json: str
) -> str by llm(
    method="Reason",
    temperature=0.7,
    incl_info=(
        "Generate a professional, PERSONALIZED follow-up email to request missing documents for a GAP insurance claim.\n\n"
        f"Claimant Name: {claimant_name or 'Valued Customer'}\n"
        f"Missing Items: {', '.join(missing_items)}\n"
        f"Extracted Claim Details: {extracted_fields_json}\n\n"
        "CRITICAL - RECIPIENT SALUTATION:\n"
        "- MUST use actual recipient name from Claimant Name field\n"
        "- If full name (e.g., 'John Michael Anderson'): Use 'Dear Mr. Anderson' or 'Dear John'\n"
        "- If first name only: Use 'Dear [FirstName]'\n"
        "- NEVER use placeholder '[Recipient's Name]' - always use the actual name provided\n"
        "- Example: Claimant Name = 'John Michael Anderson' → 'Dear Mr. Anderson,'\n\n"
        "PERSONALIZATION REQUIREMENTS:\n"
        "- Reference the SPECIFIC vehicle information (make, model, year, VIN) from extracted fields\n"
        "- Include the policy number if available\n"
        "- Mention the lienholder name if present\n"
        "- Use claim number if available\n"
        "- List the SPECIFIC missing items with numbered list\n\n"
        "TONE & FORMAT:\n"
        "- Professional yet personable\n"
        "- Clearly list what documents are needed\n"
        "- Suggest a reasonable deadline (e.g., 'within 10 business days')\n"
        "- Include placeholder for sender information\n"
        "- Keep concise (under 300 words)\n\n"
        "Example references:\n"
        "- 'regarding the 2023 Honda Accord EX-L, VIN: 1HGCV1F39PA012345'\n"
        "- 'for policy GAP-2024-789456'\n"
        "- 'with your lienholder Wells Fargo Auto Finance'\n\n"
        "Format as a ready-to-send email with Subject line."
    )
);

"""Calculate completeness score based on extracted fields and missing items."""
def calculate_completeness_score(extracted_fields: dict, missing_items: list[str]) -> int {
    # Count non-null extracted fields
    filled_fields = sum(1 for v in extracted_fields.values() if v is not None and str(v).strip());
    total_expected_fields = 10;
    
    # Base score from field extraction
    field_score = (filled_fields / total_expected_fields) * 70;
    
    # Deduct for missing documents
    missing_penalty = len(missing_items) * 5;
    document_score = max(0, 30 - missing_penalty);
    
    total_score = int(field_score + document_score);
    return min(100, max(0, total_score));
}

"""Generate next steps based on assessment."""
def generate_next_steps(missing_items: list[str], completeness_score: int) -> list[str] by llm(
    method="Reason",
    temperature=0.3,
    incl_info=(
        "Generate a prioritized list of 3-5 next steps for processing this GAP insurance claim.\n\n"
        f"Completeness Score: {completeness_score}%\n"
        f"Missing Items: {json.dumps(missing_items)}\n\n"
        "Consider:\n"
        "- What needs to be obtained first\n"
        "- Any verification steps needed\n"
        "- Internal processing steps\n"
        "- Communication with stakeholders\n\n"
        "Return a JSON array of clear, actionable steps.\n"
        "Format: [\"Step 1: ...\", \"Step 2: ...\", ...]"
    )
);
