# check_accessibility_tree.py
# Synthesizes Vercel's accessibility guidelines into a static parser to prevent common focus and labeling bugs.

import sys
import os
import json
import re

def audit_accessibility_ast(file_path):
    """
    Parses UI components to find structural accessibility omissions.
    """
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' does not exist.")
        sys.exit(1)

    with open(file_path, "r", encoding="utf-8") as f:
        code = f.read()

    issues = []

    # 1. Look for icon-only button patterns missing proper labels
    # Catches buttons rendering an Icon with no text content and missing aria-labels
    icon_only_matches = re.findall(r"<button([^>]*)>\s*<[A-Z][a-zA-Z]*Icon[^>]*/>\s*</button>", code, re.DOTALL)
    for index, attr in enumerate(icon_only_matches):
        if "aria-label" not in attr and "aria-labelledby" not in attr:
            issues.append(f"Button {index + 1}: Icon-only controls must provide descriptive 'aria-label' text.")

    # 2. Prevent pre-disabling submit controls on form trees
    if "disabled={" in code and ("type=\"submit\"" in code or "type='submit'"):
        if "inFlight" not in code and "submitting" not in code and "pending" not in code:
            issues.append("Submit Button: Do not disable form submission buttons before input. Let the user click so validation errors are exposed.")

    # 3. Prevent focus outline suppression
    if "outline-none" in code or "outline: none" in code:
        if "focus-visible:" not in code and "focus-visible" not in code:
            issues.append("Input/Button: Found outline suppression without focus-visible rings. This completely breaks accessibility for keyboard users.")

    # 4. Enforce links are links
    custom_links = re.findall(r"<button[^>]*onClick=\{[^\}]*(?:router\.push|window\.location|push)[^\}]*\}[^>]*>", code)
    if custom_links:
        issues.append("Navigation Link: Found click handler routing. Use custom <a> or framework <Link> instead of <button> click listeners to avoid breaking standard browser tabs.")

    result = {
        "passed": len(issues) == 0,
        "violations_found": len(issues),
        "issues": issues
    }

    print(json.dumps(result, indent=2))
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_accessibility_tree.py <path_to_ui_file>")
        sys.exit(1)

    audit_accessibility_ast(sys.argv[1])
