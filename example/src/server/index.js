/* @flow */

import { join } from 'path';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from '../shared/schema';
import * as conn from './data';

const app = express();

const publicPath = join(__dirname, '..', '..', '.tmp');
app.use('/public', express.static(publicPath));

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: conn,
}));

app.get('/rest/todo', (req, res)=>{
    res.json(conn.findTodo({count: req.params.count}));
});

app.get('/', (req, res) => {
    res.redirect('/example/graphql');
})
app.get('/example/:name', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title></title>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/javascript" src="/public/${req.params.name}.bundle.js"></script>
      </body>
    </html>
  `);
});

export default app;
