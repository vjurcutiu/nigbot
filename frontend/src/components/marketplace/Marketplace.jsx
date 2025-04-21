import React, { useState, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';

// Dynamic imports for marketplace views
const JobsList = lazy(() => import('./lists/JobsList'));
const CompaniesList = lazy(() => import('./lists/CompaniesList'));
const CandidatesList = lazy(() => import('./lists/CandidatesList'));

const TABS = [
  { key: 'jobs', label: 'Jobs' },
  { key: 'companies', label: 'Companies' },
  { key: 'candidates', label: 'Candidates' },
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('jobs');

  const renderContent = () => {
    switch (activeTab) {
      case 'companies':
        return <CompaniesList />;
      case 'candidates':
        return <CandidatesList />;
      case 'jobs':
      default:
        return <JobsList />;
    }
  };

  return (
    <div className="p-4">
      <div className="flex space-x-2 mb-4">
        {TABS.map(tab => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.key)}
            className="rounded-2xl"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <Suspense fallback={<div>Loading...</div>}>
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
}
