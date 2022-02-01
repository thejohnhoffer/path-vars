import * as React from "react";
import { useVars } from "../src/index";
import { useHashHistory } from "use-hash-history";
import { Routes, Route, Link, useParams } from "react-router-dom";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";

const Result = () => {
  const { n } = useVars(useParams(), {
    formats: [
      {
        empty: -1,
        keys: ["n"],
        decode: parseInt,
        encode: (n) => `${n}`,
      },
    ],
  });
  return <div>n is {n}</div>;
};

const Example = () => {
  const result = <Result />;
  return (
    <HistoryRouter history={useHashHistory()}>
      <Link to="/42">Go to #42</Link>
      <Routes>
        <Route path="/:n" element={result} />
        <Route path="/" element={result} />
      </Routes>
    </HistoryRouter>
  );
};

export default Example;
