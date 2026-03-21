---
name: user-story-brief
description: >
  Write a concise problem statement, user stories, and design improvement suggestions for a feature or idea — without the full overhead of a PRD.
  Use when you need to quickly capture what problem you're solving, who benefits, and how the experience could be improved, before diving into full spec work.
  Trigger on phrases like "write user stories", "create user stories", "problem statement", "define the problem", "story brief",
  "quick spec", "what's the user story for", "story for this feature", "design improvements", "UX improvements", "improve the experience",
  or when someone has a rough idea and needs to articulate it as a user need with design guidance.
  Also use when the user asks to "turn this into a user story", "write stories for X", or "how should this look/work".
  Always use this skill even if the user just asks for one part — e.g., just the problem statement, just the stories, or just design suggestions.
---

# User Story Brief

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../../CONNECTORS.md).

Write a focused brief containing a **Problem Statement**, **User Stories**, and **Design Improvements** for a feature or idea. This is the lightweight version of a full PRD — useful for early ideation, quick ticket creation, or aligning on the problem and UX direction before committing to full spec work.

## Usage

```
/user-story-brief $ARGUMENTS
```

## Workflow

### 1. Understand the Feature or Problem

Accept whatever the user gives you — a feature name, a rough idea, a customer complaint, a job-to-be-done. If the input is very vague (e.g., "notifications"), ask one clarifying question to narrow it down:

- What triggers the problem? What is the user trying to do when they hit this friction?
- Who is most affected — which type of user or persona?

Do not interrogate the user with a list of questions. One question is enough to unlock a good brief.

### 2. Pull Context (if tools are connected)

If **~~project tracker** is connected, search for related issues or epics to avoid duplicating an existing story or contradicting an approved direction.

If **~~knowledge base** is connected, look for related research, prior specs, or customer feedback that grounds the problem in evidence.

If tools are not connected, proceed from what the user provides.

### 3. Generate the Brief

Produce three sections:

---

## Brief Structure

### Problem Statement

Write 2–3 sentences that answer:
- **Who** is experiencing the problem, and in what context?
- **What** is the friction or gap they face?
- **Why does it matter** — what is the cost of not solving it (user frustration, lost time, churn risk, missed revenue)?

Keep it grounded in the user's perspective, not technical implementation. Avoid vague phrases like "users have trouble with X" — be specific about what happens and why it matters.

**Example:**
> Enterprise admins who manage teams of 50+ users currently have no way to enforce login policies across their organization. Each user sets their own authentication method, which creates security gaps and makes compliance auditing impossible. This leads to failed security reviews and delays in closing enterprise deals.

---

### User Stories

Write 3–6 user stories in standard format:

```
As a [specific user type], I want [capability or action] so that [benefit or outcome].
```

**Guidelines:**
- **Be specific about the user type.** "Enterprise admin" or "first-time user" is better than just "user."
- **Describe what they want to accomplish, not how.** Stories describe the need, not the UI solution.
- **Make the benefit meaningful.** The "so that" clause should explain real value — not just restate the capability.
- **Cover the primary flow first**, then add edge cases (error handling, empty state, different persona).
- **Order by priority** — the most important story first.

**Example stories:**
- As an enterprise admin, I want to enforce SSO login for all users in my organization so that I can meet our company's security policy requirements.
- As an enterprise admin, I want to see which users have not yet logged in via SSO so that I can track rollout progress and follow up with stragglers.
- As a team member, I want to be automatically redirected to my company's SSO provider when I open the login page so that I do not need to manage a separate password.
- As a team member who loses SSO access, I want a clear error message explaining why my login failed so that I know to contact my admin rather than resetting my password.

---

### Design Improvements

Suggest 3–5 concrete UX and design improvements that would make this feature intuitive, clear, and delightful to use. Think like a product designer: focus on what the user sees and experiences, not on technical implementation.

Each suggestion should answer: **What should change, and why does it improve the experience?**

**What to cover:**
- **Visual hierarchy and clarity** — Is the most important information easy to find at a glance? Are actions clearly labeled?
- **Empty states and onboarding** — What does the user see the first time? Is it helpful or disorienting?
- **Feedback and confirmation** — Do users know when an action succeeded or failed? Are they left wondering what happened?
- **Error prevention and recovery** — Are there ways to reduce mistakes, and easy paths to recover if something goes wrong?
- **Progressive disclosure** — Are advanced options hidden by default so new users aren't overwhelmed?

**Format each suggestion as:**
> **[Area]**: [What to change and why it improves the experience.]

**Example suggestions (for SSO):**
> **Empty state**: When SSO is not yet configured, show a clear setup prompt with a single CTA ("Configure SSO") rather than a blank settings page — so admins know exactly what to do next.
>
> **Confirmation feedback**: After enabling SSO, display a success banner confirming it's active and show how many users are already covered — so admins feel confident the change took effect.
>
> **Error recovery**: If a user's SSO login fails, show a plain-language error message ("Your company's login provider couldn't verify your account") with a direct link to contact their admin — rather than a generic error code.
>
> **Progressive disclosure**: Hide advanced SSO settings (JIT provisioning, attribute mapping) behind a collapsible "Advanced" section, so the basic setup stays simple for first-time admins.

---

## After Generating the Brief

Ask the user:
- Do the stories cover the key use cases, or are there edge cases missing?
- Do the design suggestions match the direction you're thinking?
- Would you like to turn this into a full spec (with requirements, success metrics, and open questions)?

If the user wants to expand, hand off to the `write-spec` skill.

## Output Format

Use clean markdown. Keep it concise — the whole brief should fit on one to two pages. The three sections are: Problem Statement, User Stories, Design Improvements. Do not add other sections unless the user explicitly asks.
