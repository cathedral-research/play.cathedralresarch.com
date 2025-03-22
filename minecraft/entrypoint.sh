#!/bin/bash
set -e

# Make sure the directory exists
mkdir -p /data

# Run the original entrypoint first to set up everything
/opt/minecraft/docker-entrypoint.sh initialize || true

# Now add/update our RCON settings in the existing server.properties
sed -i '/enable-rcon=/c\enable-rcon=true' /data/server.properties
sed -i "/rcon.password=/c\rcon.password=${RCON_PASSWORD}" /data/server.properties
sed -i '/rcon.port=/c\rcon.port=25575' /data/server.properties

# Execute the original entrypoint to start the server
exec /opt/minecraft/docker-entrypoint.sh
