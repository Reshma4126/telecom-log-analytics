import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, CheckCircle2, AlertCircle, ArrowRight, HardDrive, Play, FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api';
import { useWorkflow } from '../context/WorkflowContext';

export default function Ingestion() {
  const { 
    selectedDataset, setSelectedDataset, 
    hdfsState, setHdfsState, 
    setSelectedJobId, refreshWorkflow, showToast 
  } = useWorkflow();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [runningJob, setRunningJob] = useState(false);
  const [jobResult, setJobResult] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);

  // Handle file selection with local CSV preview parsing
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setValidation(null);
      setJobResult(null);

      // Parse first few rows for immediate preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(Boolean).slice(0, 6);
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim()));
          setPreviewRows({ headers, rows });
        }
      };
      reader.readAsText(selected.slice(0, 10000));

      setSelectedDataset({
        filename: selected.name,
        record_count: null,
        size_mb: (selected.size / (1024 * 1024)).toFixed(2),
        columns: [],
        is_validated: false
      });
      showToast(`Selected ${selected.name}. Click "1. Validate CSV" to verify schema.`, 'info');
    }
  };

  // Step 1: Validate Schema
  const handleValidate = async () => {
    if (!file) return;
    setValidating(true);
    try {
      const res = await api.validateDataset(file);
      setValidation(res);
      if (res.is_valid) {
        setSelectedDataset({
          filename: file.name,
          record_count: res.record_count,
          size_mb: res.file_size_mb,
          columns: res.columns,
          is_validated: true
        });
        showToast(`Schema verified! ${res.record_count.toLocaleString()} valid CDR rows.`, 'success');
      }
    } catch (err) {
      setValidation({
        is_valid: false,
        errors: [err.response?.data?.detail || "Validation request failed"]
      });
      showToast('Schema validation failed.', 'error');
    } finally {
      setValidating(false);
    }
  };

  // Step 2: Ingest to HDFS
  const handleUploadHDFS = async () => {
    if (!file || !validation?.is_valid) return;
    setUploading(true);
    const newJobId = `job_${Date.now()}`;
    try {
      const res = await api.uploadToHdfs(file.name, newJobId);
      setHdfsState({
        uploaded: true,
        job_id: newJobId,
        hdfs_input_path: res.hdfs_file_path,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        timestamp: new Date().toLocaleTimeString()
      });
      showToast(`File written to HDFS: ${res.hdfs_file_path}`, 'success');
    } catch (err) {
      showToast("HDFS Upload error: " + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  // Step 3: Run MapReduce Job
  const handleRunJob = async () => {
    if (!hdfsState?.hdfs_input_path) return;
    setRunningJob(true);
    const jobId = hdfsState.job_id || `job_${Date.now()}`;
    try {
      const res = await api.submitJob(jobId, hdfsState.hdfs_input_path);
      setJobResult(res);
      setSelectedJobId(res.job_id);
      await refreshWorkflow();
      showToast(`Job ${res.job_id} submitted to YARN ResourceManager!`, 'success');
    } catch (err) {
      showToast("Job submission error: " + (err.response?.data?.detail || err.message), 'error');
    } finally {
      setRunningJob(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Page Header */}
      <div>
        <h2 className="text-base font-bold text-[#142B4A]">CDR Data Ingestion</h2>
        <p className="text-xs text-[#718096]">
          Upload CDR dataset, validate schema, store in HDFS, and execute MapReduce.
        </p>
      </div>

      {/* Main Upload Area */}
      <div className="bg-white border border-[#E5EAF1] rounded-lg p-5 space-y-4">
        {/* Drag/Click File Picker */}
        <label className="border-2 border-dashed border-[#CBD7E6] hover:border-[#2878E5] bg-[#FAFBFD] hover:bg-[#EBF3FE]/20 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] text-[#2878E5] flex items-center justify-center mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-sm font-semibold text-[#142B4A]">
            {file ? file.name : "Click to select or drag CSV file"}
          </span>
          <span className="text-xs text-[#718096] mt-0.5">
            {file 
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for validation` 
              : "Accepts telecom CDR comma-separated CSV files"}
          </span>
          <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Required CSV Schema Info */}
        <div className="text-xs text-[#718096] bg-[#F7F9FC] border border-[#E5EAF1] rounded-md px-3.5 py-2">
          <span className="font-semibold text-[#142B4A]">Required CSV Schema: </span>
          <span className="font-mono text-[#2878E5]">call_id, caller_region, receiver_region, duration_seconds, status</span>
        </div>

        {/* Selected File Metadata Card */}
        {file && (
          <div className="bg-[#FAFBFD] border border-[#E5EAF1] rounded-md p-3 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[#718096]">Filename: </span>
              <span className="font-semibold text-[#142B4A]">{file.name}</span>
              <span className="text-[#CBD5E1] mx-2">|</span>
              <span className="text-[#718096]">Size: </span>
              <span className="font-semibold text-[#142B4A]">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              {validation?.record_count && (
                <>
                  <span className="text-[#CBD5E1] mx-2">|</span>
                  <span className="text-[#718096]">Rows: </span>
                  <span className="font-semibold text-[#142B4A]">{validation.record_count.toLocaleString()}</span>
                </>
              )}
            </div>

            <div>
              {validation?.is_valid ? (
                <span className="text-[11px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#10B981]/20">
                  Schema Validated
                </span>
              ) : validation ? (
                <span className="text-[11px] font-bold text-[#EF4444] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#EF4444]/20">
                  Validation Failed
                </span>
              ) : (
                <span className="text-[11px] text-[#718096] bg-white px-2 py-0.5 rounded border border-[#E5EAF1]">
                  Awaiting Validation
                </span>
              )}
            </div>
          </div>
        )}

        {/* Dataset Preview Table */}
        {previewRows.headers && previewRows.headers.length > 0 && (
          <div className="border border-[#E5EAF1] rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-[#FAFBFD] border-b border-[#E5EAF1] flex items-center justify-between text-xs font-semibold text-[#142B4A]">
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#2878E5]" />
                Dataset Preview (First 5 Rows)
              </span>
              <span className="text-[10px] text-[#718096] font-normal">{previewRows.headers.length} columns</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#F7F9FC] text-[#718096] border-b border-[#E5EAF1]">
                  <tr>
                    {previewRows.headers.map((h, i) => (
                      <th key={i} className="py-1.5 px-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5EAF1] text-[#142B4A]">
                  {previewRows.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFBFD]">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-1.5 px-3">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validation && !validation.is_valid && (
          <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#EF4444]/20 text-xs">
            <div className="flex items-center gap-2 text-[#EF4444] font-bold">
              <AlertCircle className="w-4 h-4" />
              <span>Validation Errors</span>
            </div>
            <ul className="list-disc list-inside text-[#EF4444] mt-1 space-y-0.5 text-[11px]">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 3 Sequential Actions */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#E5EAF1]">
          {/* Action 1: Validate */}
          <button
            onClick={handleValidate}
            disabled={!file || validating}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !file 
                ? 'bg-[#F1F5F9] text-[#A0AEC0] cursor-not-allowed' 
                : 'bg-[#2878E5] text-white hover:bg-[#1B65CD]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{validating ? "Validating..." : "1. Validate CSV"}</span>
          </button>

          {/* Action 2: Ingest to HDFS */}
          <button
            onClick={handleUploadHDFS}
            disabled={!validation?.is_valid || uploading}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !validation?.is_valid 
                ? 'bg-[#F1F5F9] text-[#A0AEC0] cursor-not-allowed' 
                : 'bg-[#10B981] text-white hover:bg-[#059669]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>{uploading ? "Writing to HDFS..." : "2. Upload to HDFS"}</span>
          </button>

          {/* Action 3: Run MapReduce Job */}
          <button
            onClick={handleRunJob}
            disabled={!hdfsState?.hdfs_input_path || runningJob}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              !hdfsState?.hdfs_input_path 
                ? 'bg-[#F1F5F9] text-[#A0AEC0] cursor-not-allowed' 
                : 'bg-[#142B4A] text-white hover:bg-[#0D1E35]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{runningJob ? "Submitting..." : "3. Run MapReduce Job"}</span>
          </button>
        </div>
      </div>

      {/* Execution Feedback / Continue Button */}
      {jobResult && (
        <div className="bg-white border border-[#E5EAF1] rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#142B4A]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Job Submitted: {jobResult.job_id}</span>
            </div>
            <div className="text-[11px] font-mono text-[#718096] mt-0.5">
              Output: <span className="text-[#2878E5] font-semibold">{jobResult.hdfs_output_path}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/execution')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2878E5] text-white text-xs font-semibold rounded-md hover:bg-[#1B65CD] transition-all"
          >
            <span>Open Execution Monitor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
