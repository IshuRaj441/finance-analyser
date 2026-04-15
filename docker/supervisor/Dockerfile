FROM financeanalyser-app

# Switch back to root for Supervisor
USER root

# Create necessary directories with proper permissions
RUN mkdir -p /var/log/supervisor /tmp && \
    chown -R www-data:www-data /var/log/supervisor && \
    chmod 755 /tmp

# Copy Supervisor configurations
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY workers.conf /etc/supervisor/conf.d/workers.conf

# Expose Supervisor port (optional, for monitoring)
EXPOSE 9001

# Start Supervisor
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
