'use strict'
const base58_chars = require('./base58_chars.js')

/**
 * Generates a mapping between base58 and ascii.
 * @name create_base58_map
 * @kind function
 * @returns {Array} mapping between ascii and base58.
 * @ignore
 */
const create_base58_map = () => {
  const base58M = Array(256).fill(-1)
  for (let i = 0; i < base58_chars.length; ++i)
    base58M[base58_chars.charCodeAt(i)] = i

  return base58M
}

module.exports = create_base58_map
