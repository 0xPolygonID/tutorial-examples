'use strict'

const base58_chars = require('../private/base58_chars.js')
const create_base58_map = require('../private/create_base58_map.js')

const base58Map = create_base58_map()

/**
 * Converts a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) into a base58 string.
 * @kind function
 * @name binary_to_base58
 * @param {Uint8Array | Array} uint8array Unsigned integer.
 * @returns {base58_chars} The base58 string representation of the binary array.
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { binary_to_base58 } = require("base58-js")
 * ```
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { binary_to_base58 } from 'base58-js'
 * ```
 * @example <caption>Usage.</caption>
 * ```js
 * const str = binary_to_base58([15, 239, 64])
 * console.log(str)
 * ```
 * Logged output will be 6MRy.
 */
const binary_to_base58 = uint8array => {
  const result = []

  for (const byte of uint8array) {
    let carry = byte
    for (let j = 0; j < result.length; ++j) {
      const x = (base58Map[result[j]] << 8) + carry
      result[j] = base58_chars.charCodeAt(x % 58)
      carry = (x / 58) | 0
    }
    while (carry) {
      result.push(base58_chars.charCodeAt(carry % 58))
      carry = (carry / 58) | 0
    }
  }

  for (const byte of uint8array)
    if (byte) break
    else result.push('1'.charCodeAt(0))

  result.reverse()

  return String.fromCharCode(...result)
}

module.exports = binary_to_base58
