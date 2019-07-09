#FROM node:8-alpine
FROM wcp-security-advisor-docker-local.artifactory.swg-devops.com/securityadvisor:0.0.3

RUN apk add --no-cache make \
    python \
    g++

# Create app directory
RUN mkdir -p /usr/src/app
RUN mkdir temp

# Copy package.json first to check if an npm install is needed
COPY .npmrc /temp
COPY package.json /temp
RUN cd temp && npm install
RUN cp -a /temp/node_modules /usr/src/app

# Bundle app source
COPY . /usr/src/app

WORKDIR /usr/src/app

ENV PORT 8888
EXPOSE 8888

CMD ["npm", "start"]
