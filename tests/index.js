import { suite } from "uvu";
import * as assert from "uvu/assert";
import * as ENV from "./setup/env.js";
import { createPath } from "history";
import { matchRoutes } from "react-router-dom";
import { useHashHistory } from "use-hash-history";
import { useVars, useSetVars } from "../src/index.ts";

/*
 * Test rendering with react-router-dom
 */
const testExample = (key, props) => {
  const TestExample = suite(`test ${key} with react-router-dom`);
  TestExample.before.each(ENV.reset);
  TestExample("Example renders", async () => {
    const { innerHTML } = ENV.renderExample(props);
    const expected = ENV.expectExample(props);
    assert.snapshot(innerHTML, expected);
  });
  return TestExample;
};

/*
 *  Match routes with react-router-dom
 */
const testRoutes = (_routes, _opts) => {
  const makeRoute = ([path, ...rest]) => {
    return !path ? [] : [{ path, children: makeRoute(rest) }];
  };
  const routes = [].concat(..._routes.map(makeRoute));
  const useParams = (locationArg) => {
    const matches = matchRoutes(routes, locationArg);
    const params = matches.map(({ params }) => params);
    return params.find((m) => m) || {};
  };
  const read = (location) => {
    return useVars(useParams(location), _opts);
  };
  const write = (location) => {
    const setVars = useSetVars(history.replace, _opts);
    setVars(useVars(useParams(location), _opts));
  };
  return { read, write };
};

/*
 * Roundtrip pathname update
 */
const updatePathname = async (opts) => {
  const { fn, listen, read, input } = opts;
  return new Promise((resolve) => {
    listen(({ location }) => {
      resolve(read(location));
    });
    fn(input);
  });
};

const testUseVars = (key, options) => {
  const TestUseVars = suite(`test ${key}`);

  TestUseVars.before.each(ENV.reset);
  TestUseVars.before.each(() => {
    global.history = useHashHistory({});
  });

  TestUseVars.after.each(() => {
    const sub = (s) => s.substring(1);
    const historyHref = createPath(history.location);
    const windowHref = document.defaultView.location;
    assert.is(sub(historyHref), sub(windowHref.hash));
  });

  const { input, io, expected } = options;

  TestUseVars(`push value`, async () => {
    const result = await updatePathname({
      listen: history.listen,
      fn: history.push,
      read: io.read,
      input,
    });
    assert.equal(result, expected);
  });

  TestUseVars(`replace value`, async () => {
    const result = await updatePathname({
      listen: history.listen,
      fn: history.replace,
      read: io.read,
      input,
    });
    assert.equal(result, expected);
  });

  TestUseVars(`set value`, async () => {
    const result = await updatePathname({
      listen: history.listen,
      fn: io.write,
      read: io.read,
      input,
    });
    assert.equal(result, expected);
  });

  return TestUseVars;
};

const nIntFormat = {
  keys: ["n"],
  decode: parseInt,
  encode: (x) => `${x}`,
};
const sNoFormat = {
  keys: ["s"],
};

[
  testExample("default", { value: -1 }),
  testUseVars("integer n", {
    io: testRoutes([["/:n"]], {
      formats: [nIntFormat],
    }),
    expected: { n: 42 },
    input: "/42",
  }),
  testUseVars("integer n, string s", {
    io: testRoutes([["/:n", ":s"]], {
      formats: [nIntFormat, sNoFormat],
    }),
    expected: { n: 42, s: "hello" },
    input: "/42/hello",
  }),
].map((test) => test.run());
