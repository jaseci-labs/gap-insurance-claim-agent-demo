"""
Utility functions for merging Tailwind CSS classes
"""

import from clsx { clsx }
import from "tailwind-merge" { twMerge }

# Merge Tailwind classes intelligently (handles conflicts)
def:pub cn(input: any) -> str {
    inputs = [].slice.call(arguments);
    return twMerge(clsx(inputs));
}
