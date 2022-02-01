# [Path Vars](https://yarnpkg.com/package/path-vars)

[![codecov][codecov]][codecov_url] [![npm version][npm_version]][npm_version_url]

[npm_version]: https://badge.fury.io/js/path-vars.svg
[codecov]: https://codecov.io/gh/thejohnhoffer/path-vars/branch/main/graph/badge.svg?token=ULXHI9HTYZ
[npm_version_url]: https://www.npmjs.com/package/path-vars
[codecov_url]: https://codecov.io/gh/thejohnhoffer/path-vars

## Installation and Example

To install for use with `react-router-dom`, install recommended dependencies:

```
pnpm add react-router-dom use-hash-history history
```

Then install this module

```
pnpm install path-vars
```

Or, run `npm install` or `yarn add`, based on your package manager. To [avoid duplicate dependencies](https://github.com/remix-run/react-router/pull/7586#issuecomment-991703987), also ensure `history` matches the version used by `react-router-dom`.

Use with a version of `react-router-dom@^6.1.1` as follows:

```jsx
import * as React from "react";
import { useVars } from "path-vars";
import { useHashHistory } from "use-hash-history";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";

const Example = () => {
  const hash = useVars(useParams(), {
    empty: { n: -1 },
    formats: { num: ["n"] },
    decoders: { num: (s) => parseInt(s) },
    encoders: { num: (n) => n.toString(10) },
  });
  const result = <div>{JSON.stringify(hash)}</div>;
  // result looks like {"n": 42}
  return (
    <HistoryRouter history={useHashHistory()}>
      <Link to="/42">Go to #42</Link>
      <Routes>
        <Route path=":n" element={result} />;
        <Route path="*" element={result} />;
      </Routes>
    </HistoryRouter>
  );
};
```

## Contributing

The published copy lives at [path-vars](https://github.com/thejohnhoffer/path-vars/) on GitHub.
Make any pull request against the main branch.

### Package manager

I build and test with [pnpm](https://pnpm.io/). I've tried `npm`, `yarn@1`, `yarn@berry`, but The [`uvu` testing library](https://www.npmjs.com/package/uvu) currently [recommendeds](https://github.com/lukeed/uvu/issues/144#issuecomment-939316208) `pnpm`.
