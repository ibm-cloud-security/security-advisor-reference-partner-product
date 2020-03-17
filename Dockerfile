FROM node:12.16.1-slim
ENV NO_UPDATE_NOTIFIER true

# Install image packages.
RUN  apt-get update -qqy \
  && apt-get install -y --no-install-recommends build-essential e2fsprogs python librdkafka-dev libssl-dev ca-certificates wget\
  && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/cache/apt/*
 
# Create app directory
RUN mkdir -p /usr/src/app

# Copy sources and install required packages.
COPY . /usr/src/app
RUN cd /usr/src/app && npm install --production
WORKDIR /usr/src/app

ENV PORT 8888
EXPOSE 8888

# Run as non-root
RUN chmod -R 775 /usr/src
RUN groupadd -g 1001 appuser \
 && useradd -r -u 1001 -g appuser appuser
RUN chown -R appuser:appuser /usr/src/app
USER appuser

CMD ["npm", "start"]
