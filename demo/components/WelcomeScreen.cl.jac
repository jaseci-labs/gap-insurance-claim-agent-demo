"""
Welcome screen shown when chat is empty
"""

import from ..utils.mergeCls { cn }

def:pub WelcomeScreen() -> any {
    return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-2xl mx-auto px-4">
            <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-full flex items-center justify-center">
                <img 
                    src="/assets/logo.png" 
                    alt="Ally" 
                    className="w-12 h-12 object-contain"
                />
            </div>

            <h2 className="text-2xl text-primary font-semibold mb-4">
                GAP Claim Intake Agent
            </h2>

            <p className="text-base text-text-secondary mb-8">
                Upload your GAP claim documents for instant analysis and intake assessment
            </p>

            <div className="bg-surface/50 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-primary mb-3">
                    I can help you with:
                </h3>

                <ul className="space-y-2 text-sm text-text-primary">
                    <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Extract key information from GAP contracts and insurance documents</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Identify missing documentation for complete claim intake</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Generate claim readiness assessments and next steps</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>Draft follow-up emails for missing information</span>
                    </li>
                </ul>
            </div>

            <p className="text-xs text-text-muted mt-6">
                Start by uploading claim documents or asking a question about the GAP claim process
            </p>
        </div>
    </div>;
}
