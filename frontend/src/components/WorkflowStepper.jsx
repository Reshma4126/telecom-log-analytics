import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckCircle2, Loader2, XCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import { useWorkflow } from '../context/WorkflowContext';

// Show workflow indicator only on pipeline/execution pages where helpful
const PIPELINE_ROUTES = ['/ingestion', '/execution'];

export default function WorkflowStepper() {
  const { steps, selectedDataset, currentJob } = useWorkflow();
  const navigate = useNavigate();
  const location = useLocation();

  if (!PIPELINE_ROUTES.includes(location.pathname)) {
    return null;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'in_progress':
        return <Loader2 className="w-3.5 h-3.5 text-[#2878E5] animate-spin" />;
      case 'failed':
        return <XCircle className="w-3.5 h-3.5 text-[#EF4444]" />;
      case 'unavailable':
        return <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />;
      default:
        return <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />;
    }
  };

  const getStatusColors = (status, isCurrentRoute) => {
    if (isCurrentRoute) {
      return 'bg-white border-[#2878E5] text-[#2878E5] shadow-2xs font-bold';
    }
    switch (status) {
      case 'completed':
        return 'bg-[#F7F9FC] border-[#10B981]/30 text-[#172B4D] hover:bg-white';
      case 'in_progress':
        return 'bg-[#EBF3FE] border-[#2878E5]/40 text-[#2878E5]';
      case 'failed':
        return 'bg-[#FEF2F2] border-[#EF4444]/30 text-[#EF4444]';
      default:
        return 'bg-white border-[#E5EAF1] text-[#718096]';
    }
  };

  return (
    <div className="bg-white border-b border-[#E5EAF1] px-6 py-2 flex-shrink-0">
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Step Items */}
        <div className="flex items-center gap-1.5 min-w-max">
          {steps.map((step, idx) => {
            const isCurrentRoute = location.pathname === step.path;
            const isClickable = step.status === 'completed' || step.status === 'in_progress' || isCurrentRoute;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isClickable && navigate(step.path)}
                  disabled={!isClickable}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition-all ${
                    getStatusColors(step.status, isCurrentRoute)
                  } ${isClickable ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                  title={`${step.label} (${step.status.replace('_', ' ')})`}
                >
                  <span>{step.label}</span>
                  {getStatusBadge(step.status)}
                </button>
                {idx < steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-[#CBD5E1] flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Dataset/Job Pill */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#718096]">
          <span className="font-mono text-[#142B4A]">{selectedDataset?.filename || 'telecom_calls_large.csv'}</span>
          <span>·</span>
          <span className="font-mono text-[#2878E5]">{currentJob?.job_id || 'Baseline Job'}</span>
        </div>
      </div>
    </div>
  );
}
