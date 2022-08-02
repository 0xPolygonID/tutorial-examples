# cross-sha256
[![NPM Package](https://img.shields.io/npm/v/cross-sha256.svg?style=flat-square)](https://www.npmjs.org/package/cross-sha256)
[![Build Status](https://github.com/zone117x/cross-sha256/workflows/Build/badge.svg)](https://github.com/zone117x/cross-sha256/actions)


Isomorphic `SHA-256` with minimal dependencies. Uses the Node.js `crypto` module if available, otherwise uses a JS implementation (e.g. in browser environments).

```ts
import { sha256 } from 'cross-sha256'

console.log(new sha256().update('42').digest('hex'))
// => 73475cb40a568e8da8a045ced110137e159f890ac4da883b6b17dc651b3a8049
```

## Acknowledgements
This work is derived from Paul Johnston's [A JavaScript implementation of the Secure Hash Algorithm](http://pajhome.org.uk/crypt/md5/sha1.html).


## LICENSE [MIT](LICENSE)
