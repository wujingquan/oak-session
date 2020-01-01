// based https://github.com/miguelmota/is-class/blob/master/is-class.js

function fnBody (fn) {
  // return toString().call(fn).replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '')
  return fn.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '')
}

export function isClass (fn) {
  if (typeof fn !== 'function') {
    return false
  }

  if (/^class[\s{]/.test(fn.toString())) {
    return true
  }

  // babel.js classCallCheck() & inlined
  const body = fnBody(fn)
  return (/classCallCheck\(/.test(body) || /TypeError\("Cannot call a class as a function"\)/.test(body))
}