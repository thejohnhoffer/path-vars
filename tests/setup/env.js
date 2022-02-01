import { h } from "hastscript";
import { createElement } from "react";
import { toHtml } from "hast-util-to-html";
import Example from "../../demo/example.tsx";
import { renderElement, resetDocument } from "linkedom-history";

const MAIN = "main";

function expectAnchor({ route }) {
  const href = `#/${route}`;
  return h("a", { href }, `Go to #${route}`);
}

function expectResult({ value }) {
  return h("div", `n is ${value}`);
}

function expectExample(props = {}) {
  const route = "42";
  const { value } = props;
  const anchor = expectAnchor({ route });
  const result = expectResult({ value });
  return toHtml(h(MAIN, [anchor, result]).children);
}

function renderExample(props = {}) {
  const element = createElement(Example, props);
  return renderElement(MAIN, element);
}

function reset() {
  return resetDocument(MAIN);
}

export { reset, renderExample, expectExample };
