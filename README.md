# Fast Meet (P2P)

A p2p decentralized video conferencing application

## Demo
![Demo](client/src/assets/gif/demo-preview.gif)

## Getting Started

1. Ensure you have Node.js installed.
2. Create a `client/.env` file with a `REACT_APP_BASE_URL` property set to your Server Url.
3. Create a `server/.env` file with a `TWILIO_AUTH_TOKEN` and `TWILIO_ACCOUNT_SID` properties to Twillio Token and SID.

## Running the Project

1. In the terminal, run: `npm run deploy`
2. Browse the frontend at [localhost:4000](http://localhost:4000) and start a meeting.

## Docker

1. Ensure you have the latest version of Docker installed
2. Run `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

## Running the Tests

To run any automated tests, run `npm test`. This will: 
* Run all the client-side tests: `npm test --prefix client`
* Run all the server-side tests: `npm test --prefix server` 

# CREDITS

Designer - Timothy Exodus
