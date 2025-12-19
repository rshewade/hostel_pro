#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const tasksPath = path.join(__dirname, 'tasks', 'tasks.json');
const tasksData = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));

// Fix specific terms that should remain as "design"
const fixes = [
  // "implement system" → "design system" (it's a proper term)
  { from: /implement system/g, to: 'design system' },
  { from: /Implement System/g, to: 'Design System' },

  // "implement foundations" → "design foundations"
  { from: /implement foundations/g, to: 'design foundations' },

  // "implement tokens" → "design tokens" (also a proper term)
  { from: /implement tokens/g, to: 'design tokens' },

  // Fix redundant phrases
  { from: /Next\.js 14\+ with React, TypeScript, and Tailwind CSS, using Styles and Variables/g,
    to: 'Next.js 14+ with React, TypeScript, and Tailwind CSS' },

  // Fix "contrast check plugins" → specific tools
  { from: /using contrast check plugins/g, to: 'using axe DevTools, WAVE, or similar accessibility tools' },

  // "Build" at start of description should be "Implement"
  { from: /^Build the core implement/g, to: 'Implement the code-based design' },
];

function updateText(text) {
  if (typeof text !== 'string') return text;

  let updated = text;
  for (const { from, to } of fixes) {
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

console.log('✅ Terminology cleanup complete!');
console.log('📝 Fixed "design system", "design tokens", and other standard terms');
