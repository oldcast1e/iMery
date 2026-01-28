---
description: TDD implementation workflow (Red-Green-Refactor)
---

# TDD Workflow

This workflow enforces the Test-Driven Development (Red-Green-Refactor) cycle for implementing new features or fixing bugs in iMery.

## Prerequisites

- Ensure you are in a task context.
- Understand the requirements clearly.

## Workflow Steps

1.  **Create Test Plan (RED)**
    - Analyze requirements.
    - Create a new test file or update existing one in `src/__tests__/` or next to the component.
    - Write a failing test case that describes the expected behavior.
    - Run the test to confirm it fails: `npm test -- <test_file>`

2.  **Implement Minimal Code (GREEN)**
    - Write just enough code to make the test pass.
    - Do not over-engineer.
    - Run the test to confirm it passes: `npm test -- <test_file>`

3.  **Refactor (REFACTOR)**
    - Clean up the code while keeping tests passing.
    - Check for code style violations: `npm run lint`
    - optimize if necessary.

4.  **Verify**
    - Run all relevant tests to ensure no regressions.
    - `npm test`

## Example Usage

```bash
# 1. Create failing test
# 2. Implement feature
# 3. Run specific test
npm test -- src/components/MyComponent.test.jsx
```
