# evaluate_assertions.py
# Scans built React components to verify correct animation physics and tactile feedback constraints.

import sys
import os
import json
import re

def evaluate_react_component(file_path):
    """
    Evaluates compiled UI files for strict conformance to design-engineering physics.
    Output conforms precisely to Anthropic skill-creator grading specifications.
    """
    if not os.path.exists(file_path):
        return {
            "passed": False,
            "error": f"Target file '{file_path}' not found."
        }

    with open(file_path, "r", encoding="utf-8") as f:
        code = f.read()

    expectations = []

    # Assertion 1: Tactile scale reduction active on buttons
    has_scale = "scale(0.97)" in code or "scale-[0.97]" in code or "scale-95" in code
    expectations.append({
        "text": "Pressable elements scale down on active states to acknowledge user input",
        "passed": bool(has_scale),
        "evidence": "Detected scale(0.97) utility on active click." if has_scale else "Failed to find active state scale reduction."
    })

    # Assertion 2: Avoid scale(0) starting states
    has_bad_scale = "scale(0)" in code or "scale-0" in code
    has_ok_scale = re.search(r"scale\((0\.9*)\)", code) or "scale-[0.9" in code or "scale-90" in code
    scale_pass = not has_bad_scale and has_ok_scale
    expectations.append({
        "text": "Entrance transitions start at scale(0.9+) instead of popping from scale(0)",
        "passed": bool(scale_pass),
        "evidence": f"Correct start scale: {has_ok_scale.group(0)}" if scale_pass else "Found scale(0) initialization or missing scale boundary."
    })

    # Assertion 3: Reduced motion fallbacks configured
    has_reduced_motion = "prefers-reduced-motion" in code or "useReducedMotion" in code
    expectations.append({
        "text": "Respect OS prefers-reduced-motion settings with static visual overrides",
        "passed": bool(has_reduced_motion),
        "evidence": "OS reduced motion query or hook configured in component." if has_reduced_motion else "Missing prefers-reduced-motion media query fallback."
    })

    # Assertion 4: No universal transition definitions
    has_transition_all = "transition-all" in code or "transition: all" in code
    expectations.append({
        "text": "Avoid transition: all (transition specific keys to avoid paint lag)",
        "passed": not has_transition_all,
        "evidence": "Compliant: explicit property keys transitioned." if not has_transition_all else "Flagged transition-all usage. Explicitly transition opacity and transform instead."
    })

    # Calculate final aggregate score
    total_assertions = len(expectations)
    passed_count = sum(1 for e in expectations if e["passed"])
    pass_rate = (passed_count / total_assertions) * 100 if total_assertions > 0 else 0

    return {
        "passed": pass_rate == 100,
        "pass_rate_percent": pass_rate,
        "expectations": expectations
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python evaluate_assertions.py <path_to_component_file>")
        sys.exit(1)

    target_file = sys.argv[1]
    result = evaluate_react_component(target_file)
    print(json.dumps(result, indent=2))
