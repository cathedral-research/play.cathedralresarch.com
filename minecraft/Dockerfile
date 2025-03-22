FROM marctv/minecraft-papermc-server:latest
# Move template files outside the volume mount path
COPY server.properties.template /opt/templates/
COPY entrypoint.sh /opt/templates/entrypoint.sh
RUN chmod +x /opt/templates/entrypoint.sh
ENTRYPOINT ["/opt/templates/entrypoint.sh"]
