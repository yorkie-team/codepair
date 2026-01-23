#!/bin/sh
set -eu

until mongosh --host mongo --port 27017 --quiet --eval 'db.adminCommand({ ping: 1 }).ok' >/dev/null 2>&1; do
  sleep 1
done

mongosh --host mongo --port 27017 --quiet --eval '
// Replica set member address (advertised host).
// This should be reachable from mongot (container) AND from host processes.
const desiredHost = "mongo:27017";

// rs0: init if needed, otherwise ensure the member host is reachable from other containers.
try {
  const st = rs.status();
  if (st && st.ok === 1) {
    const cfg = rs.conf();
    if (cfg?.members?.[0]?.host !== desiredHost) {
      cfg.members[0].host = desiredHost;
      rs.reconfig(cfg, { force: true });
    }
  } else {
    throw new Error("rs not initialized");
  }
} catch (e) {
  try {
    rs.initiate({ _id: "rs0", members: [{ _id: 0, host: desiredHost }] });
  } catch (e2) {}
}

// Ensure mongot user exists (retry a bit until primary is ready).
for (let i = 0; i < 30; i++) {
  try {
    const admin = db.getSiblingDB("admin");
    if (!admin.getUser("mongotUser")) {
      admin.createUser({
        user: "mongotUser",
        pwd: "mongotpassword",
        roles: [
          { role: "readWriteAnyDatabase", db: "admin" },
          { role: "clusterMonitor", db: "admin" },
        ],
      });
    }
    break;
  } catch (e) {
    sleep(1000);
  }
}

quit(0);
'


