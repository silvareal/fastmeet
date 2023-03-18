#!/bin/bash

# Set PATH
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Run the certbot container to renew the certs
docker-compose -f docker-compose.prod.yml run --rm certbot

# Concatenate the resulting certificate chain and the private key and write it to HAProxy's certificate file.
cat /opt/docker/certbot/certbot/etc/letsencrypt/live/example.org/{fullchain,privkey}.pem > /opt/docker/haproxy/ssl/example_org.pem 

# Restart haproxy
docker-compose -f docker-compose.prod.yml restart