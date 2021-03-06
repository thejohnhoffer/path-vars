export type Opts = {
  root?: string;
  slash?: string;
  formats: Format[];
};
export type Format<F = unknown> = {
  keys: string[];
  empty?: F;
  decode?: Handle<string, F>;
  encode?: Handle<F, string>;
  checkValue?: Handle<F, boolean>;
  checkText?: Handle<string, boolean>;
  join?: Handle<KV<F>, string>;
};

type KV<T> = [string, T];
type Handle<I, O> = (_: I) => O;
type S2S = Record<string, string>;
type S2X = Record<string, unknown>;
type Core<O> = Handle<KV<Format>, O>;

interface Nav {
  (to: { pathname: string }): void;
}

function useFormats({ formats }: Opts) {
  const empty: KV<Format>[] = [];
  return empty.concat(
    ...formats.map((f) => {
      return f.keys.map((k): KV<Format> => [k, f]);
    })
  );
}

function handleFormat(format: Partial<Format>) {
  const { encode, decode } = {
    decode: (s) => s,
    encode: (s) => s,
    ...format,
  } as Pick<Required<Format>, "encode" | "decode">;
  return {
    join: (kv) => kv.pop(),
    checkText: (s) => s === encode(decode(s)),
    checkValue: (v) => v === decode(encode(v)),
    empty: decode(""),
    ...format,
    decode,
    encode,
  } as Required<Format>;
}

function core(..._: [S2X, false]): Core<string>;
function core(..._: [S2S, true]): Core<KV<unknown>>;
function core(..._: [S2X, boolean]): Core<unknown> {
  const [obj, read] = _;
  const anyIn = (x: unknown): x is unknown => !read;
  const anyOut = (x: unknown): x is unknown => read;
  return ([k, _f]: KV<Format>) => {
    const f = handleFormat(_f);
    const checkIn = (x: unknown) => {
      return !anyIn(x) ? f.checkText(x) : f.checkValue(x);
    };
    const codeIn = (x: unknown) => {
      return !anyIn(x) ? f.decode(x) : x;
    };
    const codeOut = (x: unknown) => {
      return !anyOut(x) ? f.encode(x) : x;
    };
    const join = (kv: KV<unknown | string>) => {
      return !anyOut(kv[1]) ? f.join(kv) : kv;
    };
    const checkOut = (x: unknown) => {
      return !anyOut(x) ? f.checkText(x) : f.checkValue(x);
    };

    if (k in obj) {
      const vIn = obj[k];
      const value = codeIn(vIn);
      const vOut = codeOut(value);
      if (checkIn(vIn) && checkOut(vOut)) {
        return join([k, vOut]);
      }
    }
    return join([k, codeOut(f.empty)]);
  };
}

const useSetVars = (nav: Nav, opts: Opts) => {
  return (state: S2X) => {
    const { root = "/", slash = "/" } = opts;
    const serialize = core(state, false);
    const hashKVs = useFormats(opts).map(serialize);
    const pathname = root + hashKVs.join(slash);
    nav({ pathname });
  };
};

const useVars = (params: S2S, opts: Opts) => {
  const parse = core(params, true);
  const entries = useFormats(opts).map(parse);
  return Object.fromEntries(entries) as S2X;
};

export { useVars, useSetVars };
