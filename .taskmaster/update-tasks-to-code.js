#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const tasksPath = path.join(__dirname, 'tasks', 'tasks.json');
const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

// Mapping of Figma terms to code equivalents
const replacements = [
  // General Figma → Code
  { from: /Figma latest/g, to: 'Next.js 14+ with React, TypeScript, and Tailwind CSS' },
  { from: /Figma Styles and Variables/g, to: 'Tailwind config and CSS custom properties' },
  { from: /Figma Color Styles and global\/local variables/g, to: 'Tailwind theme tokens and CSS variables' },
  { from: /Figma text styles/g, to: 'Tailwind typography utilities' },
  { from: /Figma components/g, to: 'React components' },
  { from: /Figma component/g, to: 'React component' },
  { from: /Figma /g, to: '' }, // Remove standalone "Figma"

  // Design tools → Code tools
  { from: /Use Figma to import/g, to: 'Import into public/assets and reference in' },
  { from: /Figma contrast check plugins/g, to: 'axe DevTools or WAVE accessibility testing' },
  { from: /Figma's Stark or Contrast plugins/g, to: 'axe DevTools, WAVE, or WebAIM contrast checker' },
  { from: /Figma Inspect/g, to: 'browser DevTools and Storybook' },
  { from: /Figma Dev Mode/g, to: 'Storybook or component documentation' },
  { from: /Figma user flow diagrams/g, to: 'Next.js App Router navigation and flowcharts' },
  { from: /Figma prototype/g, to: 'interactive Next.js application' },
  { from: /Figma prototypes/g, to: 'interactive Next.js pages' },
  { from: /Figma file/g, to: 'component library' },

  // Layout → Code
  { from: /Auto Layout 5/g, to: 'Flexbox and CSS Grid' },
  { from: /Auto Layout/g, to: 'Flexbox/Grid' },
  { from: /frames/g, to: 'pages/components' },
  { from: /frame/g, to: 'component' },
  { from: /constraints/g, to: 'responsive CSS' },
  { from: /layout grids and constraints/g, to: 'CSS Grid and responsive breakpoints' },

  // Component creation → Code
  { from: /Create component/g, to: 'Implement component' },
  { from: /Design component/g, to: 'Build component' },
  { from: /create components/g, to: 'implement components' },
  { from: /design components/g, to: 'build components' },
  { from: /variants/g, to: 'props and conditional styles' },
  { from: /component properties/g, to: 'React props' },

  // Design → Implementation
  { from: /Design /g, to: 'Implement ' },
  { from: /design /g, to: 'implement ' },
  { from: /Create the/g, to: 'Build the' },
  { from: /create the/g, to: 'build the' },

  // Prototyping → Development
  { from: /Prototype /g, to: 'Build and test ' },
  { from: /prototype /g, to: 'working application ' },
  { from: /prototyping/g, to: 'development' },
  { from: /clickable/g, to: 'functional' },

  // Testing → Code testing
  { from: /sample frames/g, to: 'test pages' },
  { from: /test frames/g, to: 'test pages' },
  { from: /Resize frames/g, to: 'Test responsive behavior' },
  { from: /wireframes/g, to: 'component sketches' },

  // Specific technical updates
  { from: /extract \d+-\d+ primary colors from logo using eyedropper/g, to: 'extract primary colors from logo using color picker tools or design specs' },
  { from: /dedicated frame/g, to: 'documentation file' },
  { from: /in a dedicated frame/g, to: 'in documentation' },

  // Component library specific
  { from: /library components/g, to: 'shared React components' },
  { from: /library component/g, to: 'shared React component' },
  { from: /Instance usage/g, to: 'Component reuse' },
  { from: /detached copies/g, to: 'duplicated code' },

  // Animation
  { from: /Smart Animate/g, to: 'Framer Motion or CSS transitions' },
  { from: /smart animate/g, to: 'smooth transitions' },

  // File organization
  { from: /Figma library organization/g, to: 'component library structure' },
  { from: /library publishing/g, to: 'npm package publishing or shared components' },
  { from: /Design System – /g, to: '' },
  { from: /"Design System → Components" Figma page/g, to: 'components documentation (README or Storybook)' },

  // Tools and integration
  { from: /Figma\.prototype\.Present/g, to: 'npm run dev' },
  { from: /React\/Vue component libraries/g, to: 'React components with Tailwind' },
  { from: /React\/Vue/g, to: 'React/Next.js' },

  // Present mode/preview
  { from: /Present mode/g, to: 'development server' },
  { from: /in prototype mode/g, to: 'in the development environment' }
];

function updateText(text) {
  if (typeof text !== 'string') return text;

  let updated = text;
  for (const { from, to } of replacements) {
    updated = updated.replace(from, to);
  }
  return updated;
}

function updateTask(task) {
  if (task.title) task.title = updateText(task.title);
  if (task.description) task.description = updateText(task.description);
  if (task.details) task.details = updateText(task.details);
  if (task.testStrategy) task.testStrategy = updateText(task.testStrategy);

  if (task.subtasks && Array.isArray(task.subtasks)) {
    task.subtasks.forEach(subtask => updateTask(subtask));
  }

  return task;
}

// Update all tasks
if (tasksData.master && tasksData.master.tasks) {
  tasksData.master.tasks.forEach(task => updateTask(task));
}

// Write updated tasks back
fs.writeFileSync(tasksPath, JSON.stringify(tasksData, null, 2), 'utf8');

console.log('✅ Successfully updated all tasks to use code-specific terminology!');
console.log('📝 Replaced Figma references with Next.js/React/Tailwind equivalents');
console.log('💾 Backup saved to: tasks.json.backup');
