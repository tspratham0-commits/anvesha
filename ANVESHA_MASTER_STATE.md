# ANVESHA MASTER STATE

Last updated: 2026-08-20

## PROJECT
Anvesha / NOVA

Primary goal: launch NOVA within the 30-day goal.

Important: this document is the recovery point for project context. The actual source code and Git history remain authoritative.

## VISION
NOVA / Anvesha is intended to combine:
- Voice + multilingual interaction
- Long-term conversation/project memory
- Smart web search and deep research
- Vision and PDF understanding
- Computer/browser automation
- YouTube search automation
- Multi-step planning
- Creator Mode
- Intelligent tool routing
- Self-verification/self-correction
- Specialist reasoning agents
- Reliable error handling
- Project Memory / progress tracking
- Research-driven problem discovery and validation

Prioritize reliability and useful workflows over feature count.

## CURRENT MAJOR WORKSTREAM: RESEARCH ENGINE

Goal:
Discover genuine recurring customer problems from web research, verify evidence against original sources, reject solutions disguised as problems, score opportunities, and produce a staged validation plan.

Pipeline:
1. Research job/project validation
2. Tavily web research
3. Project memory loading
4. Web-context construction
5. OpenAI research analysis
6. Deterministic source/evidence verification
7. Semantic finding/evidence alignment
8. Problem-vs-solution filtering
9. Opportunity scoring
10. Finding merge/deduplication
11. Five-stage validation plan
12. Save findings
13. Save project memories
14. Save validation tasks
15. Generate report
16. Complete research run

## QUALITY GATES
- Source verification
- Deterministic evidence extraction
- Evidence usability validation
- Semantic finding/evidence alignment
- Problem-vs-solution filtering
- Stage validation

A finding must describe a real problem, such as:
- administrative workload
- financial pressure
- shortages
- delays
- workflow failures
- unmet needs
- technology adoption costs

Do NOT use solutions as findings:
- AI platform
- AI assistant
- custom software
- application
- product
- service

## LATEST KNOWN-GOOD TEST

Endpoint:
POST /api/projects/2/research/run

Payload:
{"jobId":15}

Latest successful run:
- Run ID: 42
- Research Job ID: 15
- Topic: "real problems small healthcare clinics face"
- Status: COMPLETED
- sourceCount: 19
- rawFindingCount: 3
- acceptedFindingCount: 3
- sourceRejectedCount: 0
- weakEvidenceCount: 0
- evidenceRejectedCount: 0
- semanticMismatchCount: 0
- solutionRejectedCount: 0
- memoriesCreated: 3
- tasksCreated: 5

Accepted findings:
1. Challenges in Financial Management — 21/100
2. Operational Efficiency Challenges — 21/100
3. Patient Engagement Challenges — 23/100

Five-stage validation plan:
1. Customer validation
2. Market validation
3. Economic validation
4. Problem validation
5. MVP definition

Important: the research engine works end-to-end. Evidence purity still deserves refinement because some evidence can contain mixed problem/solution/vendor material.

## IMPORTANT FILES

Main research route:
app/api/projects/[id]/research/run/route.ts

Project:
 /Users/pratham/anvesha/web

Database:
prisma/anvesha.db

Schema:
prisma/schema.prisma

Prisma config:
prisma.config.ts

## DEVELOPMENT COMMANDS

cd /Users/pratham/anvesha/web

TypeScript:
npx tsc --noEmit

Development server:
npm run dev

Research test:
curl -X POST http://localhost:3000/api/projects/2/research/run \
  -H "Content-Type: application/json" \
  -d '{"jobId":15}'

Next.js:
16.2.10

Local server:
http://localhost:3000

There is a non-blocking warning about multiple lockfiles:
- /Users/pratham/package-lock.json
- /Users/pratham/anvesha/web/package-lock.json

## AI / WEB RESEARCH STACK
- OpenAI research analysis model: gpt-5-mini
- Tavily: web research
- Local Ollama models observed:
  - deepseek-r1:1.5b
  - llama3.2:latest

## EVIDENCE ARCHITECTURE

The model's evidence field is a locator/hint, not trusted evidence.

Saved evidence should come from original retrieved source content.

Evidence extraction attempts to:
- extract original source passages
- reject bad passages
- reject solution/product passages
- verify passage exists in source
- rank passages by relevance
- require semantic alignment

This is a core research-engine principle.

## FIVE-STAGE VALIDATION

Stage 1 — CUSTOMER VALIDATION
- interviews
- observation
- surveys
- frequency/pain/current alternatives

Stage 2 — MARKET VALIDATION
- competitors
- existing alternatives
- market gaps
- comparison

Stage 3 — ECONOMIC VALIDATION
- willingness to pay
- current spending
- budgets
- economic value

Stage 4 — PROBLEM VALIDATION
- pilot
- manual workflow
- smoke test
- landing page
- lightweight experiment
- proof of demand

Stage 5 — MVP DEFINITION
- smallest useful product
- essential workflow
- success metrics
- only after earlier validation

Stage 6 — BUILD / IMPLEMENTATION
- should not automatically become a validation task

Decision gate:
Validate the problem before committing to an MVP/product build.

## DATABASE HISTORY

A Prisma/SQLite mismatch was fixed.

Symptom:
"The column `createdAt` does not exist in the current database."

Fix:
npx prisma db push
npx prisma generate

Then:
npx tsc --noEmit

Current database is working.

## IMPORTANT DEBUGGING HISTORY

### TypeScript backup-file issue
A backup named with `.ts` contained old errors and was compiled by TypeScript.

Use `.bak` for backups:
route.before-fix.ts.bak

Do NOT keep old backup source files ending in `.ts` in the project.

### Research debugging
Several iterations encountered:
- evidence-rejected
- semantic mismatch
- incorrect source selection
- solution/product evidence being selected

The current implementation eventually reached a successful run with all three findings accepted.

Do not throw away the working implementation to fix one quality issue.

## GIT / BACKUP RULE

Before risky changes:
git status
git diff

Create a backup or commit.

After a stable milestone:
git add .
git commit -m "descriptive message"

Do not commit API keys or secrets.

Recommended milestone commits:
- Research engine working with evidence gates
- Fix Prisma ResearchRun schema
- Fix semantic evidence gate
- Fix source matching
- Research validation pipeline stable

## CURRENT NEXT TASK

Improve evidence purity without breaking the working baseline.

Specifically:
- prevent vendor/product/solution sentences from being saved as evidence
- preserve legitimate problem evidence
- keep source verification
- keep semantic matching
- keep problem-vs-solution filtering
- run `npx tsc --noEmit`
- run the same healthcare research test
- compare evidence quality

This should be a surgical change, not another full rewrite of route.ts.

## DO NOT BREAK

Do not unnecessarily replace:
- working research route
- Prisma database configuration
- evidence gate architecture
- semantic gate
- source matching
- five-stage validation logic

For every change:
1. make one controlled change
2. compile
3. test
4. inspect
5. proceed only if stable

## RECOVERY PROCEDURE

If this ChatGPT conversation becomes inaccessible:

1. Start a new chat.
2. Upload `ANVESHA_MASTER_STATE.md`.
3. Say:
   "Continue Anvesha/NOVA from this master state. Do not assume missing details."
4. Upload the relevant source file if code context is needed.
5. Run `npx tsc --noEmit`.
6. Test the research endpoint.
7. Continue from CURRENT NEXT TASK.

The project files and Git history are authoritative.

## PRODUCT DIRECTION

The long-term workflow should become:

Research
→ verified problem
→ validation plan
→ project memory
→ tasks
→ validation results
→ decision
→ MVP/build

The objective is not merely to generate AI answers.

The objective is to help discover, verify, validate, and act on meaningful real-world problems.

## 30-DAY LAUNCH MINDSET

Priorities:
1. Reliability
2. Core user workflow
3. Clear UX
4. Strong research/evidence quality
5. Memory/project continuity
6. Error handling
7. Testing
8. Deployment
9. Documentation
10. Launch

Avoid endlessly polishing one subsystem if the overall product cannot yet launch.

## LAST KNOWN STATE — 2026-08-20

Research API: WORKING
TypeScript: PASS
Database: WORKING
Research source retrieval: WORKING
Evidence extraction: WORKING
Semantic evidence gate: WORKING
Problem filtering: WORKING
Opportunity scoring: WORKING
Validation plan: WORKING
Memory creation: WORKING
Task creation: WORKING

Main remaining research-engine concern:
Evidence purity / preventing mixed solution content from becoming saved evidence.

END OF MASTER STATE
