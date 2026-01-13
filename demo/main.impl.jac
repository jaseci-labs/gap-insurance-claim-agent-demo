"""
Ally GAP Insurance Claims Agent - Walker Implementations
Business logic for processing GAP insurance claims
"""

import from byllm.lib { Model }

glob llm = Model(model_name="gpt-4.1-mini");

# ============================================================================
# WALKER: Get or Create Session
# ============================================================================

impl get_or_create_session.navigate_to_user {
    # Find existing user or create new one
    all_users = [-->](`?User);

    user_node = None;
    for u in all_users {
        if u.email == self.user_email {
            user_node = u;
            break;
        }
    }

    # Create user if not exists
    if user_node == None {
        import from datetime { datetime }
        user_node = here ++> User(
            username=self.user_email.split("@")[0],
            email=self.user_email,
            created_at=str(datetime.now())
        );
    }

    visit user_node;
}

impl get_or_create_session.get_session {
    import from datetime { datetime }

    # Look for existing active session
    sessions = [-->](`?ClaimSession);

    active_session = None;
    for s in sessions {
        if s.status == "active" {
            active_session = s;
            break;
        }
    }

    # Create new session if none exists
    if active_session == None {
        timestamp = str(datetime.now().timestamp());
        active_session = here ++> ClaimSession(
            session_id=f"session_{timestamp}",
            created_at=str(datetime.now()),
            status="active",
            last_updated=str(datetime.now())
        );
    }

    report {
        "session_id": active_session.session_id,
        "created_at": active_session.created_at,
        "status": active_session.status
    };
}

# ============================================================================
# WALKER: Process Message
# ============================================================================

impl process_message.navigate_to_session {
    # First get to the user
    all_users = [-->](`?User);

    user_node = None;
    for u in all_users {
        if u.email == self.user_email {
            user_node = u;
            break;
        }
    }

    if user_node {
        # Find the session
        sessions = [user_node-->](`?ClaimSession);
        for s in sessions {
            if s.session_id == self.session_id {
                visit s;
                return;
            }
        }
    }
}

impl process_message.handle_message {
    import from datetime { datetime }

    # Add user message to conversation
    user_msg = here ++> ClaimMessage(
        content=self.user_message,
        is_user=True,
        timestamp=str(datetime.now()),
        message_type="text"
    );

    # Generate AI response based on message content
    response_text = generate_response(self.user_message);

    # Create timestamp for AI response
    ai_timestamp = str(datetime.now());

    # Add AI response to conversation
    ai_msg = here ++> ClaimMessage(
        content=response_text,
        is_user=False,
        timestamp=ai_timestamp,
        message_type="text"
    );

    # Update session timestamp
    here.last_updated = str(datetime.now());

    report {
        "response": response_text,
        "timestamp": ai_timestamp
    };
}

# LLM-powered response generation for GAP insurance claims
def:priv generate_response(user_message: str) -> str by llm();

sem generate_response = """
You are Ally's GAP Insurance Claims Assistant. Generate helpful, professional responses about GAP insurance claims.

Context: GAP (Guaranteed Asset Protection) insurance covers the difference between a vehicle's actual cash value and the outstanding loan balance in case of total loss.

Response guidelines:
- Be warm, professional, and empathetic
- Provide clear, actionable guidance
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for lists
- Always guide the user toward next steps

Key information to reference:
- Required documents: GAP contract, insurance settlement letter, payoff letter, vehicle title
- Processing timeline: 2-3 weeks with complete documentation
- Contact: 1-888-925-2559, gapclaims@ally.com

Common scenarios:
- Explaining GAP coverage
- Listing required documents
- Answering timeline questions
- Providing contact information
- Guiding document upload process

Generate a natural, conversational response that addresses the user's message appropriately.
""";

# ============================================================================
# WALKER: Get Messages
# ============================================================================

impl get_messages.navigate_to_session {
    all_sessions = [-->](`?ClaimSession);

    for s in all_sessions {
        if s.session_id == self.session_id {
            visit s;
            return;
        }
    }
}

impl get_messages.retrieve_messages {
    # Get all messages connected to this session
    messages = [-->](`?ClaimMessage);

    # Build message list
    message_list = [];
    for msg in messages {
        message_list.append({
            "content": msg.content,
            "is_user": msg.is_user,
            "timestamp": msg.timestamp,
            "message_type": msg.message_type
        });
    }

    report {
        "messages": message_list,
        "count": message_list.length
    };
}

# ============================================================================
# WALKER: Upload Document
# ============================================================================

impl upload_document.navigate_to_session {
    all_sessions = [-->](`?ClaimSession);

    for s in all_sessions {
        if s.session_id == self.session_id {
            visit s;
            return;
        }
    }
}

impl upload_document.process_document {
    import from datetime { datetime }

    # Create document node
    doc_node = here ++> ClaimDocument(
        filename=self.filename,
        document_type=self.document_type,
        upload_date=str(datetime.now()),
        file_data=self.file_data,
        extracted_data=self.extract_document_info(self.document_type, self.filename)
    );

    # Generate response message
    response = f"Successfully uploaded {self.filename}. Extracting key information...";

    # Add confirmation message
    here ++> ClaimMessage(
        content=response,
        is_user=False,
        timestamp=str(datetime.now()),
        message_type="document"
    );

    report {
        "success": True,
        "filename": self.filename,
        "extracted_data": doc_node.extracted_data
    };
}

# Helper to extract mock document information
def:priv extract_document_info(doc_type: str, filename: str) -> dict {
    # Mock extraction (in real app, use OCR/NLP)
    if doc_type == "gap_contract" {
        return {
            "contract_number": "GAP-2024-123456",
            "policy_holder": "John Doe",
            "coverage_amount": "$5,000",
            "effective_date": "2023-01-15"
        };
    } elif doc_type == "insurance_settlement" {
        return {
            "claim_number": "CLM-987654",
            "actual_cash_value": "$18,500",
            "settlement_date": "2024-12-01",
            "vehicle_vin": "1HGCM82633A123456"
        };
    } elif doc_type == "payoff_letter" {
        return {
            "lienholder": "Ally Financial",
            "payoff_amount": "$22,750",
            "good_through_date": "2024-12-31",
            "account_number": "****5678"
        };
    } else {
        return {
            "document_type": doc_type,
            "filename": filename,
            "status": "uploaded"
        };
    }
}

# ============================================================================
# WALKER: Generate Assessment
# ============================================================================

impl generate_assessment.navigate_to_session {
    all_sessions = [-->](`?ClaimSession);

    for s in all_sessions {
        if s.session_id == self.session_id {
            visit s;
            return;
        }
    }
}

impl generate_assessment.create_assessment {
    import from datetime { datetime }

    # Get all documents for this session
    documents = [-->](`?ClaimDocument);

    # Check which documents we have
    has_gap_contract = False;
    has_settlement = False;
    has_payoff = False;

    for doc in documents {
        if doc.document_type == "gap_contract" {
            has_gap_contract = True;
        } elif doc.document_type == "insurance_settlement" {
            has_settlement = True;
        } elif doc.document_type == "payoff_letter" {
            has_payoff = True;
        }
    }

    # Calculate completeness
    total_required = 3;
    docs_present = (1 if has_gap_contract else 0) + (1 if has_settlement else 0) + (1 if has_payoff else 0);
    completeness = float(docs_present) / float(total_required);

    # Determine missing documents
    missing = [];
    if not has_gap_contract {
        missing.append("GAP Insurance Contract");
    }
    if not has_settlement {
        missing.append("Insurance Settlement Letter");
    }
    if not has_payoff {
        missing.append("Payoff Letter from Lienholder");
    }

    # Generate next steps
    next_steps = [];
    if missing.length > 0 {
        missing_str = ", ".join(missing);
        next_steps.append(f"Upload missing documents: {missing_str}");
        next_steps.append("Request documents from appropriate parties if not available");
    } else {
        next_steps.append("Review extracted information for accuracy");
        next_steps.append("Submit claim for processing");
        next_steps.append("Await claim approval (typically 5-10 business days)");
    }

    # Create assessment node
    assessment = here ++> ClaimAssessment(
        assessment_date=str(datetime.now()),
        completeness_score=completeness,
        missing_documents=missing,
        extracted_info={},
        next_steps=next_steps,
        follow_up_email=self.generate_follow_up_email(missing)
    );

    report {
        "completeness_score": completeness,
        "missing_documents": missing,
        "next_steps": next_steps,
        "follow_up_email": assessment.follow_up_email,
        "ready_to_submit": missing.length == 0
    };
}

# Helper to generate follow-up email
def:priv generate_follow_up_email(missing_docs: list) -> str {
    if missing_docs.length == 0 {
        return "All documents received. Claim ready for submission.";
    }

    email = f"""Subject: Missing Documents for GAP Insurance Claim

Dear Policyholder,

We're processing your GAP insurance claim and need the following documents to complete your submission:

""";

    for doc in missing_docs {
        email = email + f"- {doc}\n";
    }

    email = email + """
Please submit these documents at your earliest convenience to avoid delays in processing.

If you need assistance obtaining any of these documents, please contact:
- Claims Support: 1-888-925-2559
- Email: gapclaims@ally.com

Thank you,
Ally GAP Claims Team""";

    return email;
}
