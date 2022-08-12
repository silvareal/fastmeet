import express, { Express, Request, Response } from 'express';
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const app: Express = express();

app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(morgan('combined'));

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;