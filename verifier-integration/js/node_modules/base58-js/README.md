![base58 logo](https://raw.githubusercontent.com/pur3miish/base58/main/static/base58.svg)

# base58-js

A light weight (\~560 byte) [universal JavaScript](https://en.wikipedia.org/wiki/Isomorphic_JavaScript) base58 encoder / decoder.

# Support

- [Node.js](https://nodejs.org/en/) `>= 8`
- [Browser list](https://github.com/browserslist/browserslist) `defaults` `not IE 11`.

# Setup

```shell
$ npm i base58-js
```

# API

- [namespace base58_chars](#namespace-base58_chars)
- [function base58_to_binary](#function-base58_to_binary)
- [function binary_to_base58](#function-binary_to_base58)

## namespace base58_chars

Base58 characters must only include numbers 123456789, uppercase ABCDEFGHJKLMNPQRSTUVWXYZ and lowercase abcdefghijkmnopqrstuvwxyz.

**Type:** string

---

## function base58_to_binary

Converts a `base58` string to its corresponding binary representation.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `base58String` | [base58_chars](#namespace-base58_chars) | base58 encoded string |

**Returns:** Uint8Array — binary representation for the base58 string.

### Examples

_Ways to `import`._

> ```js
> import { base58_to_binary } from 'base58-js'
> ```

_Ways to `require`._

> ```js
> const { base58_to_binary } = require('base58-js')
> ```

_Usage._

> ```js
> const bin = base58_to_binary('6MRy')
> console.log(bin)
> ```
>
> Logged output will be Uint8Array(3) \[15, 239, 64].

---

## function binary_to_base58

Converts a [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) into a base58 string.

| Parameter    | Type                | Description       |
| :----------- | :------------------ | :---------------- |
| `uint8array` | Uint8Array \| Array | Unsigned integer. |

**Returns:** [base58_chars](#namespace-base58_chars) — The base58 string representation of the binary array.

### Examples

_Ways to `require`._

> ```js
> const { binary_to_base58 } = require('base58-js')
> ```

_Ways to `import`._

> ```js
> import { binary_to_base58 } from 'base58-js'
> ```

_Usage._

> ```js
> const str = binary_to_base58([15, 239, 64])
> console.log(str)
> ```
>
> Logged output will be 6MRy.
