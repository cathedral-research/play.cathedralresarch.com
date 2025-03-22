#!/bin/bash

# Process the template and create the actual server.properties
envsubst < /data/server.properties.template > /data/server.properties

# Execute the original entrypoint
exec /opt/minecraft/start-server.sh "$@"
