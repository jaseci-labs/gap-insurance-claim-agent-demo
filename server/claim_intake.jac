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

"""Analyze GAP claim document and extract key fields."""
def analyze_claim_document(document_text: str, document_type: str = "unknown") -> str by llm(
    method="Reason",
    temperature=0.1,
    incl_info=(
        "You are a GAP insurance claim processing expert. Analyze the provided document text and extract key information.\n\n"
        "Extract the following fields if present:\n"
        "- Lienholder/Finance Company name\n"
        "- Payoff Amount\n"
        "- Settlement Amount (from insurance)\n"
        "- VIN (Vehicle Identification Number)\n"
        "- Policy Number\n"
        "- Claimant Name\n"
        "- Important Dates (claim date, incident date, etc.)\n"
        "- Vehicle Make/Model/Year\n"
        "- Claim Number\n\n"
        f"Document Type: {document_type}\n"
        f"Document Text:\n{document_text}\n\n"
        "Return a JSON object with the extracted fields. Use null for fields not found.\n"
        "Format: {\"lienholder\": \"...\", \"payoffAmount\": \"...\", \"settlementAmount\": \"...\", etc.}"
    )
);

"""Identify what type of document this is."""
def classify_document(document_text: str) -> str by llm(
    method="Reason",
    temperature=0.1,
    incl_info=(
        "Classify this insurance/financial document into one of the following categories:\n"
        "1. GAP_CONTRACT - GAP insurance contract or policy\n"
        "2. INSURANCE_SETTLEMENT - Auto insurance settlement or payout letter\n"
        "3. PAYOFF_LETTER - Vehicle loan payoff statement\n"
        "4. PROOF_OF_LOSS - Proof of loss or total loss documentation\n"
        "5. ODOMETER_STATEMENT - Odometer disclosure or reading document\n"
        "6. OTHER - Other related document\n\n"
        f"Document Text:\n{document_text}\n\n"
        "Return only the category name (e.g., 'GAP_CONTRACT')."
    )
);

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
        "Generate a professional follow-up email to request missing documents for a GAP insurance claim.\n\n"
        f"Claimant Name: {claimant_name or 'Valued Customer'}\n"
        f"Missing Items: {', '.join(missing_items)}\n"
        f"Claim Details: {extracted_fields_json}\n\n"
        "The email should be:\n"
        "- Professional and courteous\n"
        "- Clearly list missing items\n"
        "- Provide a reasonable deadline\n"
        "- Include contact information placeholder\n"
        "- Be concise but complete\n\n"
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
