import { Service } from 'typedi';

@Service()
export class MounterModule {
  mount(window: Window, source: string): void {
    // TODO: Implement tag/eval type
    if (typeof true === 'boolean') {
      this.mountSourceWithTag(window.document, source);
    } else {
      this.evaluateSource(window, source);
    }
  }

  mountSourceWithTag(document: Document, source: string): void {
    const documentElement = document.createElement('script');
    const documentHead = document.getElementsByTagName('head')[0];

    // TODO: Implement inner/src type
    if (typeof true === 'boolean') {
      documentElement.type = 'text/javascript';
      documentElement.innerHTML = source;
    } else {
      documentElement.src = source;
    }

    if (typeof documentHead !== 'undefined') {
      documentHead.appendChild(documentElement);
    }
  }

  evaluateSource(window: Window, source: string) {
    const functionBody = `(function(W, D, A){\n${source}\n})(w, d, a);`;
    const sourceFunction = new Function('w, d, a', functionBody);
    sourceFunction(window, window.document, {});
  }
}
