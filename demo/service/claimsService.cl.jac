"""
Service layer for GAP Claims - Backend communication
"""

# Get or create a session for the user
async def:pub getOrCreateSession(userEmail: str) -> any {
    try {
        result = root spawn get_or_create_session(user_email=userEmail);

        if not result {
            return {
                "success": False,
                "error": "No result from walker"
            };
        }

        if not result.reports {
            return {
                "success": False,
                "error": "No reports in result"
            };
        }

        if result.reports.length == 0 {
            return {
                "success": False,
                "error": "Empty reports array"
            };
        }

        session_data = result.reports[0];

        return {
            "success": True,
            "session_id": session_data.session_id,
            "created_at": session_data.created_at,
            "status": session_data.status
        };
    } except Exception as e {
        return {
            "success": False,
            "error": String(e)
        };
    }
}

# Send a message and get AI response
async def:pub sendMessage(sessionId: str, userEmail: str, message: str) -> any {
    try {
        result = root spawn process_message(
            session_id=sessionId,
            user_email=userEmail,
            user_message=message
        );

        if result and result.reports and result.reports.length > 0 {
            response_data = result.reports[0];

            return {
                "success": True,
                "response": response_data.response,
                "timestamp": response_data.timestamp
            };
        } else {
            return {
                "success": False,
                "error": "No response from server"
            };
        }
    } except Exception as e {
        return {
            "success": False,
            "error": String(e)
        };
    }
}

# Get message history
async def:pub getMessageHistory(sessionId: str) -> any {
    try {
        result = root spawn get_messages(session_id=sessionId);

        if result and result.reports and result.reports.length > 0 {
            messages_data = result.reports[0];

            return {
                "success": True,
                "messages": messages_data.messages,
                "count": messages_data.count
            };
        } else {
            return {
                "success": True,
                "messages": [],
                "count": 0
            };
        }
    } except Exception as e {
        return {
            "success": False,
            "error": String(e),
            "messages": [],
            "count": 0
        };
    }
}

# Upload a document
async def:pub uploadDocument(sessionId: str, filename: str, docType: str, fileData: str) -> any {
    try {
        result = root spawn upload_document(
            session_id=sessionId,
            filename=filename,
            document_type=docType,
            file_data=fileData
        );

        doc_data = result.reports[0];

        return {
            "success": True,
            "filename": doc_data.filename,
            "extracted_data": doc_data.extracted_data
        };
    } except Exception as e {
        return {
            "success": False,
            "error": String(e)
        };
    }
}

# Generate claim assessment
async def:pub generateAssessment(sessionId: str) -> any {
    try {
        result = root spawn generate_assessment(session_id=sessionId);
        assessment_data = result.reports[0];

        return {
            "success": True,
            "completeness_score": assessment_data.completeness_score,
            "missing_documents": assessment_data.missing_documents,
            "next_steps": assessment_data.next_steps,
            "follow_up_email": assessment_data.follow_up_email,
            "ready_to_submit": assessment_data.ready_to_submit
        };
    } except Exception as e {
        return {
            "success": False,
            "error": String(e)
        };
    }
}
