// const crc = require('crc').crc32;
import crc32 from '../crc/crc32.ts';

export default {

  /**
   * Decode the base64 cookie value to an object.
   *
   * @param {String} string
   * @return {Object}
   * @api private
   */

  decode(string) {
    // const body = Buffer.from(string, 'base64').toString('utf8');
    const body = new Deno.Buffer(string).toString();
    const json = JSON.parse(body);
    return json;
  },

  /**
   * Encode an object into a base64-encoded JSON string.
   *
   * @param {Object} body
   * @return {String}
   * @api private
   */

  encode(body) {
    body = JSON.stringify(body);
    return new Deno.Buffer(body).toString();
    // return Buffer.from(body).toString('base64');
  },

  hash(sess) {
    return crc32(JSON.stringify(sess));
  },

  CookieDateEpoch: 'Thu, 01 Jan 1970 00:00:00 GMT',
};
