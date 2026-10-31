#!/bin/bash
set -e

echo "=== [$(hostname)] Starting worker node initialization ==="

# Wait for master ports: HDFS NameNode (9000) and YARN ResourceManager (8032)
echo "=== [$(hostname)] Waiting for telecom-master NameNode (port 9000)... ==="
until (echo > /dev/tcp/telecom-master/9000) 2>/dev/null; do
    echo "Waiting for telecom-master:9000..."
    sleep 3
done

echo "=== [$(hostname)] Waiting for telecom-master ResourceManager (port 8032)... ==="
until (echo > /dev/tcp/telecom-master/8032) 2>/dev/null; do
    echo "Waiting for telecom-master:8032..."
    sleep 3
done

echo "=== [$(hostname)] Master is reachable. Starting DataNode daemon ==="
hdfs --daemon start datanode

# Verify DataNode process actually started
sleep 2
if ! jps | grep -q "DataNode"; then
    echo "=== [ERROR] DataNode process failed to start. Reviewing log: ==="
    cat /var/log/hadoop/*datanode*.log /opt/hadoop/logs/*datanode*.log 2>/dev/null || true
    exit 1
fi

echo "=== [$(hostname)] Starting YARN NodeManager in foreground ==="
exec yarn nodemanager
