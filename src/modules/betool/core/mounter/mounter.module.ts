import type { SourceConfiguration, SourcesMessage } from '../messengers';

import { Service } from 'typedi';
import { ModuleMountEnum } from '../constants';
import { delay, getRandomInt, domContentLoaded } from '../utils';

@Service()
export class MounterModule {
  mount([runImmediately, runDomReady, runWithDelay, runWithRandom]: SourcesMessage): void {
    for (const source of runImmediately) {
      this.mountByType(window, source);
    }

    domContentLoaded(window).then(() => {
      for (const source of runDomReady) {
        this.mountByType(window, source);
      }

      for (const source of runWithDelay) {
        const milliseconds = source.delay?.min ?? getRandomInt(0, 5) * 1000;
        delay(milliseconds).then(() => this.mountByType(window, source));
      }

      for (const source of runWithRandom) {
        const millisecondsMin = source.delay?.min ?? getRandomInt(0, 5) * 1000;
        const millisecondsMax = source.delay?.max ?? getRandomInt(millisecondsMin, 10000);
        const milliseconds = getRandomInt(millisecondsMin, millisecondsMax);
        delay(milliseconds).then(() => this.mountByType(window, source));
      }
    });
  }

  mountByType(window: Window, sourceConfiguration: SourceConfiguration): void {
    switch (sourceConfiguration.mount) {
      case ModuleMountEnum.MOUNT_SCRIPT_SRC:
        for (const source of sourceConfiguration.sources) {
          this.mountSourceWithTag(window.document, source, 'src');
        }
        break;
      case ModuleMountEnum.MOUNT_SCRIPT_INNER:
        for (const source of sourceConfiguration.sources) {
          this.mountSourceWithTag(window.document, source, 'inner');
        }
        break;
      case ModuleMountEnum.MOUNT_SCRIPT_EVALUATE:
      default:
        for (const source of sourceConfiguration.sources) {
          this.evaluateSource(window, source);
        }
        break;
    }
  }

  mountSourceWithTag(document: Document, source: string, mountType: 'src' | 'inner' = 'src'): void {
    const documentElement = document.createElement('script');
    const documentHead = document.getElementsByTagName('head')[0];

    if (mountType === 'src') {
      documentElement.src = source;
    } else {
      documentElement.type = 'text/javascript';
      documentElement.innerHTML = source;
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
