FROM --platform=linux/amd64 node:lts-alpine

# Create app directory
WORKDIR /app
COPY package*.json ./

# Install app dependencies
COPY client/package*.json client/
RUN npm run install-client 

COPY server/package*.json server/
RUN npm run install-server

COPY client/ client/

COPY server/ server/

# RUN mkdir client/build && chmod -R 777 client/build/

USER node

CMD [ "npm", "start", "--prefix", "server" ]