#!/bin/bash
set -e

echo "=== [telecom-master] Starting master node initialization ==="

# 1. Safety check for NameNode formatting
if [ ! -f /opt/hadoop/data/name/current/VERSION ]; then
    echo "========================================================================"
    echo " [NOTICE] NameNode storage at /opt/hadoop/data/name is not initialized."
    echo " Storage is NOT automatically formatted."
    echo " When you are ready, run the explicit format command from your WSL2 prompt:"
    echo "   docker exec telecom-master hdfs namenode -format -nonInteractive -clusterId telecom-cluster-01"
    echo " Then restart the container with:"
    echo "   docker compose -f ~/telecom-project/docker/docker-compose.yml restart telecom-master"
    echo "========================================================================"
    echo "Holding container in safe idle mode so you can inspect or format explicitly..."
    exec tail -f /dev/null
fi

echo "=== [telecom-master] Valid NameNode filesystem detected. Starting NameNode daemon ==="
hdfs --daemon start namenode

# Verify NameNode process actually started
sleep 2
if ! jps | grep -q "NameNode"; then
    echo "=== [ERROR] NameNode process failed to start. Reviewing log: ==="
    cat /var/log/hadoop/*namenode*.log /opt/hadoop/logs/*namenode*.log 2>/dev/null || true
    exit 1
fi

echo "=== [telecom-master] Starting YARN ResourceManager in foreground ==="
exec yarn resourcemanager
