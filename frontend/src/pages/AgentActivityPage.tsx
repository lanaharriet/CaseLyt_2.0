import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { AgentStepItem } from '../types';
import { AgentActivityPanel } from '../components/agent/AgentActivityPanel';

export const AgentActivityPage: React.FC = () => {
  const [steps, setSteps] = useState<AgentStepItem[]>([]);

  useEffect(() => {
    apiService.getAgentActivity().then(setSteps);
  }, []);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <AgentActivityPanel steps={steps} />
    </div>
  );
};
