// const debug = require('debug')('koa-session');
import _debug from "https://deno.land/x/debuglog/debug.ts";
const debug = _debug('koa-session:context');

import ContextSession from './lib/context.ts';
import util from './lib/util.ts';

// const assert = require('assert');
import { assert } from "https://deno.land/std/testing/asserts.ts";

// const is = require('is-type-of');
import { isClass } from './is-class.ts'


import uuid from 'https://deno.land/std@v0.27.0/uuid/v4.ts';

const CONTEXT_SESSION = Symbol('context#contextSession');
const _CONTEXT_SESSION = Symbol('context#_contextSession');

/**
 * Initialize session middleware with `opts`:
 *
 * - `key` session cookie name ["koa:sess"]
 * - all other options are passed as cookie options
 *
 * @param {Object} [opts]
 * @param {Application} app, koa application instance
 * @api public
 */

export default function(opts, app) {
  console.log(app)
  // session(app[, opts])
  if (opts && typeof opts.use === 'function') {
    [ app, opts ] = [ opts, app ];
    console.log(`----------debug 1 ---------------------`)
  }
  // app required
  if (!app || typeof app.use !== 'function') {
    throw new TypeError('app instance required: `session(opts, app)`');
    console.log(`----------debug 1 ---------------------`)
  }
  console.log(`----------debug 1 ---------------------`, app)

  opts = formatOpts(opts);
  extendState(app.state, opts);

  return async function session(ctx, next) {
    const sess = ctx.state[CONTEXT_SESSION];
    if (sess.store) await sess.initFromExternal();
    try {
      await next();
    } catch (err) {
      throw err;
    } finally {
      if (opts.autoCommit) {
        await sess.commit();
      }
    }
  };
};

/**
 * format and check session options
 * @param  {Object} opts session options
 * @return {Object} new session options
 *
 * @api private
 */

function formatOpts(opts) {
  opts = opts || {};
  // key
  opts.key = opts.key || 'koa:sess';

  // back-compat maxage
  if (!('maxAge' in opts)) opts.maxAge = opts.maxage;

  // defaults
  if (opts.overwrite == null) opts.overwrite = true;
  if (opts.httpOnly == null) opts.httpOnly = true;
  if (opts.signed == null) opts.signed = true;
  if (opts.autoCommit == null) opts.autoCommit = true;

  debug('session options %j', opts);

  // setup encoding/decoding
  if (typeof opts.encode !== 'function') {
    opts.encode = util.encode;
  }
  if (typeof opts.decode !== 'function') {
    opts.decode = util.decode;
  }

  const store = opts.store;
  if (store) {
    // assert(typeof store.get), 'store.get must be function');
    // assert(typeof store.set), 'store.set must be function');
    // assert(typeof store.destroy), 'store.destroy must be function');
    assert(typeof store.get === 'function', 'store.get must be function');
    assert(typeof store.set === 'function', 'store.set must be function');
    assert(typeof store.destroy === 'function', 'store.destroy must be function');
  }

  const externalKey = opts.externalKey;
  if (externalKey) {
    assert(typeof externalKey.get === 'function', 'externalKey.get must be function');
    assert(typeof externalKey.set === 'function', 'externalKey.set must be function');
  }

  const ContextStore = opts.ContextStore;
  if (ContextStore) {
    assert(isClass(ContextStore), 'ContextStore must be a class');
    assert(typeof ContextStore.prototype.get === 'function', 'ContextStore.prototype.get must be function');
    assert(typeof ContextStore.prototype.set === 'function', 'ContextStore.prototype.set must be function');
    assert(typeof ContextStore.prototype.destroy === 'function', 'ContextStore.prototype.destroy must be function');
  }

  if (!opts.genid) {
    if (opts.prefix) opts.genid = () => `${opts.prefix}${uuid()}`;
    else opts.genid = uuid;
  }

  return opts;
}

/**
 * extend context prototype, add session properties
 *
 * @param  {Object} context koa's context prototype
 * @param  {Object} opts session options
 *
 * @api private
 */

function extendState(state, opts) {
  if (state.hasOwnProperty(CONTEXT_SESSION)) {
    return;
  }
  Object.defineProperties(state, {
    [CONTEXT_SESSION]: {
      get() {
        if (this[_CONTEXT_SESSION]) return this[_CONTEXT_SESSION];
        this[_CONTEXT_SESSION] = new ContextSession(this, opts);
        return this[_CONTEXT_SESSION];
      },
    },
    session: {
      get() {
        return this[CONTEXT_SESSION].get();
      },
      set(val) {
        this[CONTEXT_SESSION].set(val);
      },
      configurable: true,
    },
    sessionOptions: {
      get() {
        return this[CONTEXT_SESSION].opts;
      },
    },
  });
}