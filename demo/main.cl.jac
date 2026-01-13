"""
Main Ally GAP Claims Agent - Frontend Entry Point
"""

import from "@jac-client/utils" { Router, Routes, Route }
import from .pages.ClaimsPage { ClaimsPage }
import ".global.css";

cl {
    # Main app component
    def:pub app() -> any {
        return <Router>
            <Routes>
                <Route path="/" element={<ClaimsPage />} />
            </Routes>
        </Router>;
    }
}
