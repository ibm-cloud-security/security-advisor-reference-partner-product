FROM registry.access.redhat.com/ubi8/nodejs-12:latest

ENV NO_UPDATE_NOTIFIER true
USER root

# yum upgrade and install packages
RUN yum -y update -q \
 && yum install -y python2 \
 && yum clean all \
 && yum remove -y  mariadb-connector-c
 
# ENV PATH /usr/local/src/bin:${PATH}
ENV LD_LIBRARY_PATH=/usr/local/lib:/usr/local/lib64

# Non-root user
USER 1001
RUN mkdir -p /opt/app-root/src/app
COPY . /opt/app-root/src/app
WORKDIR /opt/app-root/src/app

RUN cd /opt/app-root/src/app && npm install --production

ENV PORT 8080
EXPOSE 8080

CMD ["npm", "start"]
