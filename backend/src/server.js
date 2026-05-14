require('dotenv').config();
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const espnRouter = require('./routes/espn');
const yahooRouter = require('./routes/yahoo');
const fantraxRouter = require('./routes/fantrax');
const mlbRouter = require('./routes/mlb');
const notifyRouter = require('./routes/notify');
const app = express();
const PORT = process.env.PORT || 3001;
const rosterCache = new NodeCache({ stdTTL: 300 });
const gameCache = new NodeCache({ stdTTL: 30 });
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use((req, res, next) => {
  req.rosterCache = rosterCache;
  req.gameCache = gameCache;
  next();
});
app.use('/api/espn', espnRouter);
app.use('/api/yahoo', yahooRouter);
app.use('/api/fantrax', fantraxRouter);
app.use('/api/mlb', mlbRouter);
app.use('/api/notify', notifyRouter);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
  console.log('Fantasy Tracker backend running on port ' + PORT);
});
module.exports = app;
