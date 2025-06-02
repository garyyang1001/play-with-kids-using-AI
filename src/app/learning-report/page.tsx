'use client';

import React from 'react';
import LearningReportDisplay from '@/components/sharing/LearningReportDisplay';

export default function LearningReportPage() {
  const handleDownloadPDF = () => {
    // 這裡可以實作PDF下載功能
    alert('PDF下載功能開發中，敬請期待！');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8">
        <LearningReportDisplay 
          userId="demo-user"
          onDownloadPDF={handleDownloadPDF}
        />
      </div>
    </div>
  );
}