'use strict'

const base58_chars = require('../private/base58_chars.js')

/**
 * Converts a `base58` string to its corresponding binary representation.
 * @kind function
 * @name base58_to_binary
 * @param {base58_chars} base58String base58 encoded string
 * @returns {Uint8Array} binary representation for the base58 string.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { base58_to_binary } from 'base58-js'
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { base58_to_binary } = require('base58-js')
 * ```
 * @example <caption>Usage.</caption>
 * ```js
 * const bin = base58_to_binary("6MRy")
 * console.log(bin)
 * ```
 * Logged output will be Uint8Array(3) [15, 239, 64].
 */
const base58_to_binary = base58String => {
  if (!base58String || typeof base58String !== 'string')
    throw new Error(`Expected base58 string but got “${base58String}”`)
  if (base58String.match(/[IOl0]/gmu))
    throw new Error(
      `Invalid base58 character “${base58String.match(/[IOl0]/gmu)}”`
    )
  const lz = base58String.match(/^1+/gmu)
  const psz = lz ? lz[0].length : 0
  const size =
    ((base58String.length - psz) * (Math.log(58) / Math.log(256)) + 1) >>> 0

  return new Uint8Array([
    ...new Uint8Array(psz),
    ...base58String
      .match(/.{1}/gmu)
      .map(i => base58_chars.indexOf(i))
      .reduce((acc, i) => {
        acc = acc.map(j => {
          const x = j * 58 + i
          i = x >> 8
          return x
        })
        return acc
      }, new Uint8Array(size))
      .reverse()
      .filter(
        (
          lastValue => value =>
            (lastValue = lastValue || value)
        )(false)
      )
  ])
}

module.exports = base58_to_binary
