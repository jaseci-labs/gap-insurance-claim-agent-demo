"""
Ally GAP Insurance Claims Agent - Backend Declarations
Data structures and walker declarations for GAP claims processing
"""

# ============================================================================
# NODES: Data Structures
# ============================================================================

# Node: Represents a user in the system
node User {
    has username: str;
    has email: str;
    has full_name: str = "";
    has created_at: str = "";
}

# Node: Represents a claim session for each user
node ClaimSession {
    has session_id: str;
    has created_at: str;
    has status: str = "active";
    has last_updated: str = "";
}

# Node: Represents a single message in the conversation
node ClaimMessage {
    has content: str;
    has is_user: bool;
    has timestamp: str;
    has message_type: str = "text";
}

# Node: Represents uploaded documents
node ClaimDocument {
    has filename: str;
    has document_type: str;
    has upload_date: str;
    has file_data: str = "";
    has extracted_data: dict = {};
}

# Node: Represents claim assessment results
node ClaimAssessment {
    has assessment_date: str;
    has completeness_score: float = 0.0;
    has missing_documents: list = [];
    has extracted_info: dict = {};
    has next_steps: list = [];
    has follow_up_email: str = "";
}

# ============================================================================
# EDGES: Relationships
# ============================================================================

edge SessionFlow {
    has label: str = "next";
}

edge MessageFlow {
    has label: str = "message";
}

# ============================================================================
# WALKERS: Entry Points
# ============================================================================

# Walker: Create or get user session
walker get_or_create_session {
    has user_email: str;

    can navigate_to_user with `root entry;
    can get_session with User entry;
}

# Walker: Process user message and generate response
walker process_message {
    has session_id: str;
    has user_message: str;
    has user_email: str;

    can navigate_to_session with `root entry;
    can handle_message with ClaimSession entry;
}

# Walker: Get message history for a session
walker get_messages {
    has session_id: str;

    can navigate_to_session with `root entry;
    can retrieve_messages with ClaimSession entry;
}

# Walker: Upload and process document
walker upload_document {
    has session_id: str;
    has filename: str;
    has document_type: str;
    has file_data: str;

    can navigate_to_session with `root entry;
    can process_document with ClaimSession entry;
}

# Walker: Generate claim assessment
walker generate_assessment {
    has session_id: str;

    can navigate_to_session with `root entry;
    can create_assessment with ClaimSession entry;
}
