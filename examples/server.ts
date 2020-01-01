/*
 * This is a basic example of a test server which provides a logger middleware,
 * a response time middleware, and a basic "Hello World!" middleware.
 */

// Importing some console colors
import {
  green,
  cyan,
  bold,
  yellow
} from "https://deno.land/std@v0.25.0/fmt/colors.ts";
// import { Application } from "https://deno.land/x/oak/mod.ts";
import { Application } from '../oak/mod.ts'

import session from '../mod.ts';
import cookie from '../oak-cookie/mod.ts';

const app = new Application();

// app.keys = ['some secret hurr'];

const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG, app));
// or if you prefer all default config, just use => app.use(session(app));

app.use(cookie)
app.use(async (ctx, next) => {
  // ignore favicon
  if (ctx.request.path === '/favicon.ico') return;
  await next()
  let n = ctx.state.session.views || 0;
  ctx.state.session.views = ++n;
  ctx.response.body = n + ' views';
});
app.use(ctx => {
  if (ctx.request.path === '/favicon.ico') return;
  ctx.response.body = '123'
})
// function mi() {
//   return async function(ctx, next) {
//     ctx.state.session = 'session'
//     await next()
//   }
// }
// app.use(mi())
// app.use(async (ctx, next) => {
//   console.log(ctx.state.session)
//   ctx.response.body = '123'
// })

const address = "127.0.0.1:8000";
console.log(bold("Start listening on ") + yellow(address));
await app.listen(address);
console.log(bold("Finished."));