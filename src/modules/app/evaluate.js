(() => {
  console.log('delay-10-not-eval');
  const source = `(() => console.log('delay-10-eval', W))();`;
  const functionBody = `(function(W, D, A){\n${source}\n})(w, d, a);`;
  const sourceFunction = new Function('w, d, a', functionBody);
  sourceFunction(window, window.document, {});
})();
