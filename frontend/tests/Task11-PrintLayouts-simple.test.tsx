/**
 * Task 11.4 - Print-optimized Layouts (Simplified)
 * 
 * Simple verification that print components work
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { 
  DocumentPrintView,
  UndertakingPrintView
} from '../src/components/documents';

describe('Task 11.4 - Print-optimized Layouts for Documents and Undertakings', () => {
  describe('Components Render Without Errors', () => {
    it('DocumentPrintView renders without error', () => {
      expect(() => render(
        <DocumentPrintView
          documentType="student_declaration"
          title="Student Declaration"
          status="uploaded"
          uploadedAt="2025-12-27T10:00:00Z"
          uploadedBy="John Doe"
        />
      )).not.toThrow();
    });

    it('UndertakingPrintView renders without error', () => {
      expect(() => render(
        <UndertakingPrintView
          undertakingType="dpdp_consent_renewal"
          title="DPDP Consent Renewal"
          description="Please renew your consent"
          status="completed"
          acknowledgedAt="2025-12-27T10:00:00Z"
          acknowledgedBy="John Doe"
        />
      )).not.toThrow();
    });
  });

  describe('Document Print View - Rendering', () => {
    it('displays print button', () => {
      const onPrint = vi.fn();
      
      render(
        <DocumentPrintView
          documentType="student_declaration"
          title="Student Declaration"
          status="uploaded"
          uploadedAt="2025-12-27T10:00:00Z"
          uploadedBy="John Doe"
          onPrint={onPrint}
        />
      );

      const printButtons = screen.getAllByText('Print Document');
      expect(printButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Undertaking Print View - Rendering', () => {
    it('displays undertaking content', () => {
      render(
        <UndertakingPrintView
          undertakingType="dpdp_consent_renewal"
          title="DPDP Consent Renewal"
          description="Description"
          status="completed"
          acknowledgedAt="2025-12-27T10:00:00Z"
          acknowledgedBy="John Doe"
        />
      );

      expect(screen.getAllByText(/DPDP Consent Renewal/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/John Doe/i).length).toBeGreaterThan(0);
    });
  });
});
