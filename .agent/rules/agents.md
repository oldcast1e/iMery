# Agent Orchestration

## Available Agents

Located in `~/.claude/agents/`:

| Agent                | Purpose                 | When to Use                                      |
| -------------------- | ----------------------- | ------------------------------------------------ |
| ui-expert            | Frontend & UI/UX        | React 19, Tailwind, Framer Motion changes        |
| api-dev              | Backend API development | Express.js, JWT, Route implementation            |
| db-specialist        | Database management     | TiDB/MySQL schema and query optimization         |
| ai-specialist        | AI integration          | RunPod, Gemini API, S3 audio/image flows         |
| security-reviewer    | Security analysis       | Authentication, Environment variables, S3 access |
| build-error-resolver | Fix build errors        | Vite or Node.js startup failures                 |
| tdd-guide            | Test-driven development | Implementing new features with verification      |
| doc-updater          | Documentation           | Updating READMEs and API docs                    |

## Immediate Agent Usage

No user prompt needed:

1. Complex feature requests - Use **planner** agent
2. Code just written/modified - Use **code-reviewer** agent
3. Bug fix or new feature - Use **tdd-guide** agent
4. Architectural decision - Use **architect** agent

## Parallel Task Execution

ALWAYS use parallel Task execution for independent operations:

```markdown
# GOOD: Parallel execution

Launch 3 agents in parallel:

1. Agent 1: Security analysis of auth.ts
2. Agent 2: Performance review of cache system
3. Agent 3: Type checking of utils.ts

# BAD: Sequential when unnecessary

First agent 1, then agent 2, then agent 3
```

## Multi-Perspective Analysis

For complex problems, use split role sub-agents:

- Factual reviewer
- Senior engineer
- Security expert
- Consistency reviewer
- Redundancy checker
