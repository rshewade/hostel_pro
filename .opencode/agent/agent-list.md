# Available Development Agents

## Primary Agents

### **task_tracker.md** (PRIMARY)
- **Role**: Task Master AI Specialist
- **Model**: opencode/grok-code (Grok Code Fast 1 - Free from OpenCode Zen)
- **Purpose**: Task management and project coordination using Task Master AI
- **Stack**: Task Master AI CLI, Task Master MCP, PRD parsing, complexity analysis
- **Specializes**: Task creation, status tracking, dependency management, task expansion, CLI/MCP dual-mode operation
- **Mode**: Primary Agent
- **Note**: This model is FREE via OpenCode Zen. Configure once with `/connect` → select "OpenCode Zen".

## Subagent Directory

### **orchestrator.md**
- **Role**: Project Orchestrator
- **Model**: zhipuai-coding-plan/glm-4.7 (GLM 4.7 Coding Plan - Paid via Z.AI)
- **Purpose**: Coordinates between specialized subagents for Jain Hostel development
- **Specializes**: Project coordination, quality assurance, architecture oversight
- **Note**: Requires Z.AI API key configured via `/connect`

### **ui-ux-developer.md**
- **Role**: UI/UX Developer
- **Purpose**: Frontend components, design system, user interfaces
- **Stack**: Next.js, React, TypeScript, Tailwind CSS
- **Specializes**: Multi-role dashboards, guest-first workflows, accessibility

### **nextjs-developer.md** (NEW)
- **Role**: Next.js Development Specialist
- **Model**: zhipuai/glm-4.6
- **Purpose**: Frontend implementation using Next.js, React, TypeScript
- **Stack**: Next.js (App Router), TypeScript, Tailwind CSS, React Query
- **Specializes**: Multi-role dashboards, guest-first workflows, performance optimization

### **testing-agent.md**
- **Role**: Quality Assurance & Testing Specialist
- **Model**: zhipuai/glm-4.6
- **Purpose**: Comprehensive testing strategies, quality assurance, compliance validation
- **Stack**: Jest, React Testing Library, Playwright, Lighthouse, Axe-core
- **Specializes**: Multi-role testing, DPDP compliance, accessibility testing, security testing

### **supabase.md** (NEW)
- **Role**: Supabase & PostgreSQL Backend Specialist
- **Model**: zhipuai-coding-plan/glm-4.7
- **Purpose**: Database design, authentication, Row Level Security, real-time features
- **Stack**: PostgreSQL, Supabase Auth, RLS policies, Edge Functions, Storage, MCP
- **Specializes**: Schema design, migrations, audit logging, DPDP compliance, performance optimization

## Usage Instructions

### **When to Use task_tracker (PRIMARY AGENT)**
- Ask about task status, next task, or task priorities
- Get task details and subtasks
- Mark tasks as complete or update progress
- Parse PRDs into new tasks
- Expand tasks into subtasks
- **No orchestration needed** - can be used directly!

### **When to Use nextjs-developer**
- Implementing new Next.js pages and API routes
- Creating reusable React components
- Setting up authentication and middleware
- Optimizing application performance
- Integrating with backend APIs
- Implementing responsive design

### **When to Use supabase**
- Designing database schemas and table structures
- Creating Row Level Security (RLS) policies
- Writing and managing database migrations
- Configuring Supabase Auth (OTP, JWT, roles)
- Setting up Supabase Storage with secure policies
- Creating database functions and triggers
- Implementing audit logging for compliance
- Optimizing query performance

### **Agent Coordination**

- **task_tracker** (primary agent) - Manages tasks and project coordination
- **orchestrator** - Coordinates all subagents
- **ui-ux-developer** - Handles design system and user experience
- **nextjs-developer** - Implements technical frontend solutions
- **supabase** - Handles database design, RLS, and Supabase backend
- **testing-agent** - Ensures quality, compliance, and comprehensive testing

### **Development Workflow**

1. Requirements Analysis by **orchestrator**
2. Database & Backend Design by **supabase**
3. UX Design by **ui-ux-developer**
4. Technical Implementation by **nextjs-developer**
5. Quality Assurance & Testing by **testing-agent**
6. Final Integration and Validation by all agents

## Configuration

All agents are configured with:
- **Model**: Various (see individual agent files)
- **Temperature**: Optimized for development tasks
- **Tools**: Full development toolset (read, write, edit, bash, glob, grep, mcp)
- **Mode**: Role-specific development modes

## Quick Start with task_tracker

### Setup (One-time)

```bash
opencode
/connect
# Select "OpenCode Zen"
# Sign up at https://opencode.ai/auth
# Paste API key
```

### Use Agent

```bash
opencode
/agent task_tracker
```

Now ask: "What's the next task?" or "Show me task 41 details"

**Note**: task_tracker uses **free** Grok Code Fast 1 model from OpenCode Zen - no ongoing costs!
