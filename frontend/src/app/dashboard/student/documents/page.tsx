'use client';

import { useState } from 'react';
import { Button } from '@/components';
import { Card } from '@/components/data/Card';
import { Badge } from '@/components/ui/Badge';
import { FileText, Download, Eye, Upload, AlertCircle } from 'lucide-react';

type DocumentCategory = 'IDENTITY' | 'ADMISSION' | 'UNDERTAKING' | 'RECEIPT';

interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  uploadDate: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  size: string;
  type: string;
}

export default function StudentDocumentsPage() {
  const [activeTab, setActiveTab] = useState<DocumentCategory | 'ALL'>('ALL');

  // Mock data
  const documents: Document[] = [
    {
      id: '1',
      title: 'Admission Letter',
      category: 'ADMISSION',
      uploadDate: '2024-06-15',
      status: 'VERIFIED',
      size: '1.2 MB',
      type: 'PDF'
    },
    {
      id: '2',
      title: 'Aadhar Card',
      category: 'IDENTITY',
      uploadDate: '2024-06-10',
      status: 'VERIFIED',
      size: '2.4 MB',
      type: 'PDF'
    },
    {
      id: '3',
      title: 'Passport Size Photo',
      category: 'IDENTITY',
      uploadDate: '2024-06-10',
      status: 'VERIFIED',
      size: '1.8 MB',
      type: 'JPG'
    },
    {
      id: '4',
      title: 'Anti-Ragging Undertaking',
      category: 'UNDERTAKING',
      uploadDate: '2024-06-20',
      status: 'VERIFIED',
      size: '0.8 MB',
      type: 'PDF'
    },
    {
      id: '5',
      title: 'Hostel Rules Acceptance',
      category: 'UNDERTAKING',
      uploadDate: '2024-06-20',
      status: 'VERIFIED',
      size: '0.5 MB',
      type: 'PDF'
    },
    {
      id: '6',
      title: 'Fee Receipt - Sem 1',
      category: 'RECEIPT',
      uploadDate: '2024-07-01',
      status: 'VERIFIED',
      size: '0.4 MB',
      type: 'PDF'
    }
  ];

  const filteredDocuments = activeTab === 'ALL' 
    ? documents 
    : documents.filter(doc => doc.category === activeTab);

  const getCategoryLabel = (cat: DocumentCategory) => {
    switch (cat) {
      case 'IDENTITY': return 'Identity Proofs';
      case 'ADMISSION': return 'Admission Docs';
      case 'UNDERTAKING': return 'Undertakings';
      case 'RECEIPT': return 'Fee Receipts';
      default: return cat;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600">View and manage your official hostel documents</p>
          </div>
          <Button variant="primary" size="md">
            <Upload className="w-4 h-4 mr-2" />
            Upload New Document
          </Button>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {['ALL', 'ADMISSION', 'IDENTITY', 'UNDERTAKING', 'RECEIPT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab === 'ALL' ? 'All Documents' : getCategoryLabel(tab as DocumentCategory)}
            </button>
          ))}
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{doc.title}</h3>
                      <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(doc.status)} size="sm">
                    {doc.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Missing Documents Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Missing Required Documents</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Please upload your updated <strong>Income Certificate</strong> before the next renewal cycle (July 2025).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
