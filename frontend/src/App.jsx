import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import WorkflowStepper from './components/WorkflowStepper';
import Overview from './pages/Overview';
import Ingestion from './pages/Ingestion';
import ExecutionMonitor from './pages/ExecutionMonitor';
import Cluster from './pages/Cluster';
import Regional from './pages/Regional';
import ResultsExplorer from './pages/ResultsExplorer';
import JobHistory from './pages/JobHistory';
import About from './pages/About';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';

function ToastContainer() {
  const { toasts, removeToast } = useWorkflow();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg text-xs font-medium animate-fade-in transition-all ${
              isSuccess 
                ? 'bg-white border-[#10B981]/40 text-[#142B4A]' 
                : isError 
                ? 'bg-white border-[#EF4444]/40 text-[#142B4A]' 
                : 'bg-white border-[#2878E5]/40 text-[#142B4A]'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-[#2878E5] flex-shrink-0 mt-0.5" />}

            <div className="flex-1 leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#A0AEC0] hover:text-[#142B4A] transition-colors p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MainLayout() {
  return (
    <div className="flex h-screen bg-[#F7F9FC] overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area - with pl-64 to offset the fixed sidebar */}
      <div className="flex-1 flex flex-col min-w-0 pl-64 h-full">
        {/* Unified Sticky Topbar */}
        <Topbar />

        {/* Workflow Stepper Bar */}
        <WorkflowStepper />
        
        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-6 py-5">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/ingestion" element={<Ingestion />} />
            <Route path="/execution" element={<ExecutionMonitor />} />
            <Route path="/cluster" element={<Cluster />} />
            <Route path="/regional" element={<Regional />} />
            <Route path="/results" element={<ResultsExplorer />} />
            <Route path="/history" element={<JobHistory />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <WorkflowProvider>
      <MainLayout />
    </WorkflowProvider>
  );
}
