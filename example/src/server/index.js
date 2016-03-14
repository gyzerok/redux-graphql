/* @flow */

import { join } from 'path';
import express from 'express';
import graphqlHTTP from 'express-graphql';

import schema from './schema';
import * as conn from './data';


const app = express();

const publicPath = join(__dirname, '..', '..', '.tmp');
app.use('/public', express.static(publicPath));

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: conn,
}));

app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/javascript" src="/public/bundle.js"></script>
      </body>
    </html>
  `);
});

export default app;
