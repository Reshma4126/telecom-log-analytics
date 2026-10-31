import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, clusterApi } from '../services/api';

const WorkflowContext = createContext(null);

export function WorkflowProvider({ children }) {
  // Selected Dataset state: starts unvalidated / unselected until user explicitly acts
  const [selectedDataset, setSelectedDataset] = useState(null);

  // HDFS Ingestion State: starts empty until user explicitly clicks "Upload to HDFS"
  const [hdfsState, setHdfsState] = useState(null);

  // Active or selected Job: starts null until user submits a job or selects from history
  const [selectedJobId, setSelectedJobId] = useState('job_verified_docker_large');
  const [jobs, setJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);

  // Cluster State
  const [clusterOnline, setClusterOnline] = useState(false);
  const [clusterData, setClusterData] = useState(null);

  // Global Toast Notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Refresh Jobs & Cluster
  const refreshWorkflow = async () => {
    try {
      const [jobsData, clusterRes] = await Promise.all([
        api.getJobs(),
        clusterApi.getStatus()
      ]);
      setJobs(jobsData || []);
      setClusterData(clusterRes.data || null);
      setClusterOnline(clusterRes.data?.cluster_online || false);

      if (jobsData && jobsData.length > 0) {
        if (selectedJobId) {
          const found = jobsData.find(j => j.job_id === selectedJobId) || jobsData[0];
          setCurrentJob(found);
        } else {
          setCurrentJob(jobsData[0]);
          setSelectedJobId(jobsData[0].job_id);
        }
      }
    } catch (err) {
      console.error('Error refreshing workflow data:', err);
    }
  };

  useEffect(() => {
    refreshWorkflow();
    const interval = setInterval(refreshWorkflow, 10000);
    return () => clearInterval(interval);
  }, [selectedJobId]);

  // Derived step statuses for the Persistent Workflow Stepper
  const stepIngestionStatus = selectedDataset?.is_validated 
    ? 'completed' 
    : (selectedDataset ? 'in_progress' : 'not_started');

  const stepHdfsStatus = hdfsState?.uploaded 
    ? 'completed' 
    : 'not_started';

  let stepMapReduceStatus = 'not_started';
  if (currentJob) {
    if (currentJob.state === 'RUNNING') stepMapReduceStatus = 'in_progress';
    else if (currentJob.final_status === 'SUCCEEDED' || currentJob.final_status === 'FINISHED') stepMapReduceStatus = 'completed';
    else if (currentJob.final_status === 'FAILED') stepMapReduceStatus = 'failed';
  }

  let stepClusterStatus = 'not_started';
  if (clusterOnline) {
    stepClusterStatus = currentJob?.tasks?.length > 0 ? 'completed' : 'not_started';
  } else {
    stepClusterStatus = 'unavailable';
  }

  const stepAnalyticsStatus = stepMapReduceStatus === 'completed' 
    ? 'completed' 
    : (stepMapReduceStatus === 'failed' ? 'failed' : 'not_started');

  const stepResultsStatus = stepAnalyticsStatus === 'completed' ? 'completed' : 'not_started';

  const steps = [
    { id: 'ingestion', label: '1. Ingestion', path: '/ingestion', status: stepIngestionStatus },
    { id: 'hdfs', label: '2. HDFS Storage', path: '/ingestion', status: stepHdfsStatus },
    { id: 'mapreduce', label: '3. MapReduce', path: '/execution', status: stepMapReduceStatus },
    { id: 'cluster', label: '4. Cluster Execution', path: '/execution', status: stepClusterStatus },
    { id: 'analytics', label: '5. Analytics', path: '/regional', status: stepAnalyticsStatus },
    { id: 'results', label: '6. Results', path: '/results', status: stepResultsStatus },
  ];

  const value = {
    selectedDataset,
    setSelectedDataset,
    hdfsState,
    setHdfsState,
    selectedJobId,
    setSelectedJobId,
    currentJob,
    setCurrentJob,
    jobs,
    clusterOnline,
    clusterData,
    refreshWorkflow,
    steps,
    showToast,
    removeToast,
    toasts
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}
