# Available Development Agents

## Agent Directory

### **orchestrator.md**
- **Role**: Project Orchestrator
- **Model**: zhipuai/glm-4.6
- **Purpose**: Coordinates between specialized subagents for Jain Hostel development
- **Specializes**: Project coordination, quality assurance, architecture oversight

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

### **testing-agent.md** (NEW)
- **Role**: Quality Assurance & Testing Specialist
- **Model**: zhipuai/glm-4.6
- **Purpose**: Comprehensive testing strategies, quality assurance, compliance validation
- **Stack**: Jest, React Testing Library, Playwright, Lighthouse, Axe-core
- **Specializes**: Multi-role testing, DPDP compliance, accessibility testing, security testing

## Usage Instructions

### **When to Use nextjs-developer**
- Implementing new Next.js pages and API routes
- Creating reusable React components
- Setting up authentication and middleware
- Optimizing application performance
- Integrating with backend APIs
- Implementing responsive design

### **Agent Coordination**
- **orchestrator** coordinates all agents
- **ui-ux-developer** handles design system and user experience
- **nextjs-developer** implements technical frontend solutions
- **testing-agent** ensures quality, compliance, and comprehensive testing

### **Development Workflow**
1. Requirements Analysis by **orchestrator**
2. UX Design by **ui-ux-developer**
3. Technical Implementation by **nextjs-developer**
4. Quality Assurance & Testing by **testing-agent**
5. Final Integration and Validation by all agents

## Configuration

All agents are configured with:
- **Model**: zhipuai/glm-4.6
- **Temperature**: Optimized for development tasks
- **Tools**: Full development toolset (read, write, edit, bash, glob, grep)
- **Mode**: Role-specific development modes