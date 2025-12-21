/**
 * Architecture & Tokens Sandbox
 *
 * This page validates the component architecture strategy by demonstrating:
 * - Token consumption patterns
 * - Component variant usage
 * - Naming conventions in practice
 * - Responsive behavior testing
 */

'use client';

import { useState } from 'react';
import {
  Button,
  Badge,
  Input,
  Card,
  Alert,
} from '../../../components';

// Sample component to demonstrate architecture patterns
interface TokenDemoProps {
  label: string;
  token: string;
  value: string;
  preview?: React.ReactNode;
}

function TokenDemo({ label, token, value, preview }: TokenDemoProps) {
  return (
    <div className="flex items-center gap-4 py-2 border-b border-gray-200 last:border-0">
      <div className="w-32 text-sm font-medium text-navy-700">{label}</div>
      <code className="flex-1 text-xs bg-gray-100 px-2 py-1 rounded font-mono text-navy-600">
        {token}
      </code>
      <div className="w-24 text-xs text-gray-500 text-right">{value}</div>
      {preview && <div className="w-16 flex justify-end">{preview}</div>}
    </div>
  );
}

export default function ArchitectureSandboxPage() {
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [selectedVariant, setSelectedVariant] = useState<'primary' | 'secondary' | 'ghost' | 'destructive'>('primary');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <header
        className="px-6 py-4 border-b sticky top-0 z-10"
        style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)',
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}
            >
              Architecture & Tokens Sandbox
            </h1>
            <p className="text-sm text-gray-500">
              Validate component patterns and token consumption
            </p>
          </div>
          <a
            href="/design-system"
            className="text-sm font-medium px-4 py-2 rounded-md"
            style={{
              backgroundColor: 'var(--bg-brand)',
              color: 'var(--text-inverse)',
            }}
          >
            ← Design System
          </a>
        </div>
      </header>

      <div className="px-6 py-12">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Architecture Overview */}
          <section>
            <h2 className="text-heading-2 mb-4">Component Architecture</h2>
            <div className="card p-6">
              <div className="grid md:grid-cols-5 gap-4">
                {[
                  { name: 'forms/', desc: 'Form controls', count: 6 },
                  { name: 'ui/', desc: 'Basic elements', count: 4 },
                  { name: 'data/', desc: 'Data display', count: 6 },
                  { name: 'feedback/', desc: 'User feedback', count: 6 },
                  { name: 'layout/', desc: 'Layout utils', count: 4 },
                ].map((cat) => (
                  <div
                    key={cat.name}
                    className="p-4 rounded-lg border"
                    style={{ borderColor: 'var(--border-primary)' }}
                  >
                    <code className="text-sm font-mono text-gold-600">{cat.name}</code>
                    <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                    <Badge variant="info" className="mt-2">{cat.count} components</Badge>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Token Consumption Demo */}
          <section>
            <h2 className="text-heading-2 mb-4">Token Consumption Patterns</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Color Tokens */}
              <Card title="Semantic Color Tokens" className="card">
                <TokenDemo
                  label="Background"
                  token="var(--bg-primary)"
                  value="#ffffff"
                  preview={
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: 'var(--bg-primary)' }}
                    />
                  }
                />
                <TokenDemo
                  label="Brand BG"
                  token="var(--bg-brand)"
                  value="navy-900"
                  preview={
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: 'var(--bg-brand)' }}
                    />
                  }
                />
                <TokenDemo
                  label="Accent BG"
                  token="var(--bg-accent)"
                  value="gold-500"
                  preview={
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: 'var(--bg-accent)' }}
                    />
                  }
                />
                <TokenDemo
                  label="Text Primary"
                  token="var(--text-primary)"
                  value="navy-900"
                  preview={
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Aa</span>
                  }
                />
                <TokenDemo
                  label="Text Secondary"
                  token="var(--text-secondary)"
                  value="gray-600"
                  preview={
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Aa</span>
                  }
                />
              </Card>

              {/* Spacing Tokens */}
              <Card title="Spacing Tokens" className="card">
                {[
                  { name: 'space-1', value: '4px' },
                  { name: 'space-2', value: '8px' },
                  { name: 'space-4', value: '16px' },
                  { name: 'space-6', value: '24px' },
                  { name: 'space-8', value: '32px' },
                ].map((space) => (
                  <TokenDemo
                    key={space.name}
                    label={space.name}
                    token={`var(--${space.name})`}
                    value={space.value}
                    preview={
                      <div
                        className="h-4 rounded bg-gold-500"
                        style={{ width: `var(--${space.name})` }}
                      />
                    }
                  />
                ))}
              </Card>
            </div>
          </section>

          {/* Variant Properties Demo */}
          <section>
            <h2 className="text-heading-2 mb-4">Variant Properties Schema</h2>

            <Card title="Interactive Variant Testing" className="card">
              <div className="space-y-6">
                {/* Size Variants */}
                <div>
                  <h4 className="text-subheading mb-3">Size Variants: sm | md | lg</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <div key={size} className="text-center">
                        <Button
                          size={size}
                          variant={selectedVariant}
                          onClick={() => setSelectedSize(size)}
                          className={selectedSize === size ? 'ring-2 ring-offset-2 ring-gold-500' : ''}
                        >
                          {size.toUpperCase()} Button
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">size="{size}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Variants */}
                <div>
                  <h4 className="text-subheading mb-3">Button Variants: primary | secondary | ghost | destructive</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    {(['primary', 'secondary', 'ghost', 'destructive'] as const).map((variant) => (
                      <div key={variant} className="text-center">
                        <Button
                          variant={variant}
                          size={selectedSize}
                          onClick={() => setSelectedVariant(variant)}
                          className={selectedVariant === variant ? 'ring-2 ring-offset-2 ring-navy-500' : ''}
                        >
                          {variant.charAt(0).toUpperCase() + variant.slice(1)}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">variant="{variant}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Variants */}
                <div>
                  <h4 className="text-subheading mb-3">Status Variants: default | success | warning | error | info</h4>
                  <div className="flex flex-wrap gap-3">
                    {(['default', 'success', 'warning', 'error', 'info'] as const).map((status) => (
                      <div key={status} className="text-center">
                        <Badge variant={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">variant="{status}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Naming Conventions Demo */}
          <section>
            <h2 className="text-heading-2 mb-4">Naming Conventions</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card title="File & Component Naming" className="card">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Component File:</span>
                    <code className="text-navy-700">Button.tsx</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Export Name:</span>
                    <code className="text-navy-700">Button</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Props Interface:</span>
                    <code className="text-navy-700">ButtonProps</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variant Type:</span>
                    <code className="text-navy-700">ButtonVariant</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class Constants:</span>
                    <code className="text-navy-700">BUTTON_VARIANT_CLASSES</code>
                  </div>
                </div>
              </Card>

              <Card title="Import Patterns" className="card">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Main barrel import:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      {`import { Button, Input } from '@/components';`}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category import:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      {`import { Button, Badge } from '@/components/ui';`}
                    </code>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type import:</p>
                    <code className="text-xs bg-gray-100 p-2 rounded block">
                      {`import type { ButtonProps } from '@/components';`}
                    </code>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Component Pattern Demo */}
          <section>
            <h2 className="text-heading-2 mb-4">Component Patterns Validation</h2>

            <Card title="Form Field Pattern" className="card">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Standard Input"
                    placeholder="Enter value..."
                    helperText="Helper text appears below"
                  />
                  <Input
                    label="With Error"
                    placeholder="Invalid input"
                    error="This field has an error"
                  />
                  <Input
                    label="Required Field"
                    placeholder="Required"
                    required
                  />
                  <Input
                    label="Disabled"
                    placeholder="Cannot edit"
                    disabled
                    value="Disabled value"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold mb-3">Pattern Checklist</h4>
                  <ul className="space-y-2 text-sm">
                    {[
                      'Label association via htmlFor',
                      'Error message with role="alert"',
                      'aria-describedby for errors/helpers',
                      'Required indicator (*)',
                      'Disabled styling',
                      'Focus ring visibility',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Responsive Test */}
          <section>
            <h2 className="text-heading-2 mb-4">Responsive Behavior Test</h2>

            <Alert
              variant="info"
              message="Resize the browser window to test responsive behavior of components below."
              className="mb-4"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="card">
                  <div className="text-center">
                    <div
                      className="w-12 h-12 rounded-full mx-auto mb-3"
                      style={{ backgroundColor: 'var(--bg-accent)' }}
                    />
                    <h4 className="font-medium text-navy-900">Card {i}</h4>
                    <p className="text-sm text-gray-500">Responsive grid item</p>
                    <Button size="sm" variant="secondary" className="mt-3 w-full">
                      Action
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer
            className="text-center pt-8 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <p className="text-caption">
              Architecture Sandbox - Component Library v1.0
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
