FROM marctv/minecraft-papermc-server:latest

# Add a template server.properties file
COPY server.properties.template /data/

# Add an entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Use our custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]
