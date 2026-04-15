FROM financeanalyser-app

# Switch back to root for Horizon
USER root

# Create necessary directories
RUN mkdir -p /var/log/horizon /tmp && \
    chown -R www-data:www-data /var/log/horizon && \
    chmod 755 /tmp

# Copy Horizon configuration
COPY horizon.conf /etc/supervisor/conf.d/horizon.conf

# Expose port (optional, for monitoring)
EXPOSE 9001

# Start Horizon using Supervisor for better process management
CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/horizon.conf"]
