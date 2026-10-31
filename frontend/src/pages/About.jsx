import React from 'react';
import { Database, Cpu, Activity, Code, Layers } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-4 max-w-4xl">
      {/* Overview */}
      <div className="bg-white p-4 rounded-lg border border-[#E5EAF1] space-y-2">
        <h3 className="text-xs font-bold text-[#142B4A] flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#2878E5]" />
          <span>System Architecture</span>
        </h3>
        <p className="text-xs text-[#718096] leading-relaxed">
          TelcoPulse is an end-to-end distributed telecom analytics platform built to ingest Call Detail Records (CDRs), validate schema compliance, distribute workloads across a multi-node Hadoop 3.4.2 cluster, and render QoS benchmarks.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E5EAF1] space-y-0.5">
            <div className="font-semibold text-[#142B4A] text-xs flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#2878E5]" /> Storage (HDFS)
            </div>
            <p className="text-[11px] text-[#718096]">
              Raw CDR storage with automated 2x block replication across DataNodes.
            </p>
          </div>

          <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E5EAF1] space-y-0.5">
            <div className="font-semibold text-[#142B4A] text-xs flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#8B5CF6]" /> Compute (YARN)
            </div>
            <p className="text-[11px] text-[#718096]">
              CapacityScheduler allocates map/reduce tasks to Worker 01 and Worker 02.
            </p>
          </div>

          <div className="p-3 rounded-md bg-[#F7F9FC] border border-[#E5EAF1] space-y-0.5">
            <div className="font-semibold text-[#142B4A] text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#10B981]" /> Analytics & UI
            </div>
            <p className="text-[11px] text-[#718096]">
              FastAPI Python backend with React 18, Apache ECharts, and Tailwind CSS.
            </p>
          </div>
        </div>
      </div>

      {/* MapReduce Details */}
      <div className="bg-white p-4 rounded-lg border border-[#E5EAF1] space-y-2">
        <h3 className="text-xs font-bold text-[#142B4A] flex items-center gap-1.5">
          <Code className="w-4 h-4 text-[#2878E5]" />
          <span>Java MapReduce Analytics Pipeline</span>
        </h3>
        <div className="space-y-1.5 text-xs font-mono bg-[#F7F9FC] border border-[#E5EAF1] p-3 rounded-md text-[#142B4A]">
          <div className="flex items-start gap-2">
            <span className="text-[#2878E5] font-bold">1. Mapper:</span>
            <span className="text-[#718096]">Reads CDR tokens (call_id, caller, receiver, caller_region, duration_seconds, status). Emits &lt;Text region, CallMetricWritable&gt;.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#8B5CF6] font-bold">2. Reducer:</span>
            <span className="text-[#718096]">Aggregates call counts, dropped counts, total duration per regional circle. Computes SLA compliance.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[#10B981] font-bold">3. Output:</span>
            <span className="text-[#718096]">Writes partitioned tab-separated outputs to <b className="text-[#142B4A]">/telecom/output/part-r-00000</b> on HDFS.</span>
          </div>
        </div>
      </div>

      {/* Node Topologies */}
      <div className="bg-white p-4 rounded-lg border border-[#E5EAF1] space-y-2">
        <h3 className="text-xs font-bold text-[#142B4A]">
          Cluster Node Topography
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="border border-[#E5EAF1] rounded-md p-2.5 bg-[#F7F9FC]">
            <div className="font-bold text-[#142B4A] font-mono">telecom-master</div>
            <div className="text-[10px] text-[#718096]">Master Node</div>
            <ul className="text-[11px] text-[#718096] mt-1.5 space-y-0.5">
              <li>• HDFS NameNode (:9870)</li>
              <li>• YARN ResourceManager (:8088)</li>
              <li>• MapReduce JobHistoryServer</li>
            </ul>
          </div>

          <div className="border border-[#E5EAF1] rounded-md p-2.5 bg-[#F7F9FC]">
            <div className="font-bold text-[#142B4A] font-mono">telecom-worker-01</div>
            <div className="text-[10px] text-[#718096]">Worker Node 1</div>
            <ul className="text-[11px] text-[#718096] mt-1.5 space-y-0.5">
              <li>• HDFS DataNode (:9864)</li>
              <li>• YARN NodeManager (:8042)</li>
              <li>• 4 vCores, 4096MB memory</li>
            </ul>
          </div>

          <div className="border border-[#E5EAF1] rounded-md p-2.5 bg-[#F7F9FC]">
            <div className="font-bold text-[#142B4A] font-mono">telecom-worker-02</div>
            <div className="text-[10px] text-[#718096]">Worker Node 2</div>
            <ul className="text-[11px] text-[#718096] mt-1.5 space-y-0.5">
              <li>• HDFS DataNode (:9865)</li>
              <li>• YARN NodeManager (:8043)</li>
              <li>• 4 vCores, 4096MB memory</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
