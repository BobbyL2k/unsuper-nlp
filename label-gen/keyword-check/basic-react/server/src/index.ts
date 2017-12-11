import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';

import auth from './auth';
import routerApi from './routers/api';
import routerApp from './routers/app';

const portNumber = 3000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

// Serve Assets
app.use(
  '/asset',
  express.static(
    __dirname + '/' +
    './../../client/build',
    { fallthrough: true }));

app.use((req, res, next) => {
  console.log('request', req.url);
  next();
});

// Authentication
app.use(auth());

// Redirect default path to App
app.get('/', (req, res) => {
  res.redirect('/app/');
});

// Serve App
app.use('/app/', routerApp);

app.use('/api/', routerApi);

const server = http.createServer(app);

server.on('listening', () => {
  console.log(`Listening on port ${portNumber}`);
});

server.listen(portNumber);
