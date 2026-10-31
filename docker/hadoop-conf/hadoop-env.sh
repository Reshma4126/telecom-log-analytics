# Explicit JVM heap boundaries for Hadoop daemons in containers
# Total container limits: Master=2048M, Workers=2176M each

export HDFS_NAMENODE_OPTS="-Xms512m -Xmx512m $HDFS_NAMENODE_OPTS"
export HDFS_DATANODE_OPTS="-Xms256m -Xmx256m $HDFS_DATANODE_OPTS"
export YARN_RESOURCEMANAGER_OPTS="-Xms512m -Xmx512m $YARN_RESOURCEMANAGER_OPTS"
export YARN_NODEMANAGER_OPTS="-Xms256m -Xmx256m $YARN_NODEMANAGER_OPTS"

# User names to allow execution under hadoop user
export HDFS_NAMENODE_USER="hadoop"
export HDFS_DATANODE_USER="hadoop"
export HDFS_SECONDARYNAMENODE_USER="hadoop"
export YARN_RESOURCEMANAGER_USER="hadoop"
export YARN_NODEMANAGER_USER="hadoop"
