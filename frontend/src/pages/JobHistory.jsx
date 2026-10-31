import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, Hash } from 'lucide-react';
import { jobsApi } from '../services/api';

export default function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await jobsApi.getAll();
      setJobs(res.data || []);
    } catch (err) {
      console.error('Failed to load job history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl">
      {/* Jobs Table */}
      <div className="bg-white rounded-lg border border-[#E5EAF1] overflow-hidden">
        <div className="px-3.5 py-2.5 bg-[#FAFBFD] border-b border-[#E5EAF1] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#142B4A]">
            YARN Application Execution History
          </h3>
          <button
            onClick={fetchJobs}
            className="flex items-center gap-1 text-xs text-[#2878E5] font-semibold hover:underline"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#F7F9FC] text-[#718096] border-b border-[#E5EAF1]">
              <tr>
                <th className="py-2 px-3.5 font-semibold">Job ID</th>
                <th className="py-2 px-3.5 font-sans font-semibold">Driver Class</th>
                <th className="py-2 px-3.5 font-semibold">Input File</th>
                <th className="py-2 px-3.5 font-semibold">HDFS Output Path</th>
                <th className="py-2 px-3.5 font-sans font-semibold">Started Time</th>
                <th className="py-2 px-3.5 font-sans font-semibold">Duration</th>
                <th className="py-2 px-3.5 text-right font-sans font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5EAF1] text-[#142B4A]">
              {jobs.map((job, idx) => (
                <tr key={idx} className="hover:bg-[#FAFBFD]">
                  <td className="py-2 px-3.5 font-bold text-[#2878E5] flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#718096]" />
                    <span>{job.job_id}</span>
                  </td>
                  <td className="py-2 px-3.5 font-sans font-medium">{job.name || 'TelecomAnalyzer'}</td>
                  <td className="py-2 px-3.5 text-[#718096] max-w-xs truncate">{job.input_file}</td>
                  <td className="py-2 px-3.5 text-[#2878E5] max-w-xs truncate">{job.hdfs_output_path}</td>
                  <td className="py-2 px-3.5 font-sans text-[#718096] text-[11px]">{job.submitted_time}</td>
                  <td className="py-2 px-3.5 font-sans text-[#142B4A] font-semibold">{job.duration}</td>
                  <td className="py-2 px-3.5 text-right font-sans">
                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[11px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20">
                      <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                      {job.final_status || 'SUCCEEDED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
