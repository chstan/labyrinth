import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import graphQLHTTP from 'express-graphql';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { Schema } from './data/schema';
import passport from 'passport';
import PassportLocal from 'passport-local';
import Db from './data/database';
import secrets from './secrets';

// ========== PASSPORT ===============
passport.use(new PassportLocal.Strategy({
  usernameField: 'email',
  passwordField: 'password',
},
(email, password, done) => {
  Db.models.user.findOne({ where: { email } }).then(user => {
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
}));

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  Db.models.user.findOne({ where: { id } }).then(user => cb(null, user));
});

// ======= CONFIGURATION ==========
const PROXY_PORT = 3000;
const APP_PORT = 3001;

// ======= GRAPHQL SERVER ==========
// Expose a GraphQL endpoint
const appServer = express();

appServer.use(cookieParser());
appServer.use(bodyParser.json());
appServer.use(bodyParser.urlencoded({ extended: false }));
appServer.use(expressSession({
  secret: secrets.sessionKey,
  resave: false,
  saveUninitialized: false,
}));

appServer.use(passport.initialize());
appServer.use(passport.session());

appServer.use('/graphql', graphQLHTTP(req => ({
  graphiql: true,
  pretty: true,
  schema: Schema,
  rootValue: { currentUser: req.user },
})));

appServer.listen(APP_PORT, () => console.log( // eslint-disable-line no-console
  `GraphQL Server is now running on http://localhost:${APP_PORT}`
));

// ========== AUTH AND APP RELATED HTTP =============

appServer.post('/auth',
passport.authenticate('local', {
  successRedirect: '/test',
  failureRedirect: '/login',
}));

appServer.post('/revoke',
(req, res) => {
  req.logout();
  res.redirect('/');
});

// ========= WEBPACK PROXY APP ========

// Serve the Relay app
const compiler = webpack({
  entry: path.resolve(__dirname, 'js', 'app.js'),
  module: {
    loaders: [
      {
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          plugins: ['./build/babelRelayPlugin'],
        },
        test: /\.js$/,
      },
      {
        loader: 'json',
        test: /\.json$/,
      },
    ],
  },
  output: { filename: 'app.js', path: '/' },
});

const webpackProxyApp = new WebpackDevServer(compiler, {
  contentBase: '/public/',
  proxy: {
    '/graphql': `http://localhost:${APP_PORT}/graphql`,
    '/auth': `http://localhost:${APP_PORT}`,
    '/revoke': `http://localhost:${APP_PORT}/revoke`,
  },
  publicPath: '/js/',
  stats: { colors: true },
  historyApiFallback: true,
});

// Serve static resources
webpackProxyApp.use('/', express.static(path.resolve(__dirname, 'public')));

webpackProxyApp.listen(PROXY_PORT, () => {
  console.log(`App is now running on http://localhost:${PROXY_PORT}`); // eslint-disable-line no-console
});
