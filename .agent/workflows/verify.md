---
description: Comprehensive project verification loop
---

# Verification Loop

This workflow performs a full verification of the project to ensure quality before finishing a task.

## Steps

// turbo-all

1.  **Lint Check**
    - Run static analysis to catch syntax and style errors.
    - `npm run lint`

2.  **Type Check / Build Check**
    - Verify the project builds without errors.
    - `npm run build`

3.  **Unit & Integration Tests**
    - Run the test suite to ensure functionality.
    - `npm test -- --watchAll=false`

4.  **Security Scan (Manual)**
    - Check for exposed secrets or obvious security flaws if recent changes involved sensitive data.

## Failure Handling

- If **Lint** fails: Fix style issues (use `npm run lint -- --fix` if available).
- If **Build** fails: Fix syntax or dependency errors.
- If **Tests** fail: Debug the specific failing test case. Do NOT comment out tests.
