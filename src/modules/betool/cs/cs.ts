import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';
import { MounterModule } from '../core/mounter';
import { ContentMessengerModule } from '../core/messengers';

function contentLoaded(window: Window): Promise<void> {
  return new Promise((resolve) => {
    if (window.document.readyState !== 'complete') {
      window.document.addEventListener('DOMContentLoaded', () => resolve());
    } else {
      resolve();
    }
  });
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

@Service()
class ContentScript {
  constructor(
    @Inject()
    private readonly mounter: MounterModule,
    @Inject()
    private readonly contentMessenger: ContentMessengerModule,
  ) {}

  public async init(): Promise<void> {
    const sources = await this.contentMessenger.getSources();
    const runImmediately = sources[0];
    const runDomReady = sources[1];
    const runWithDelay = sources[2];
    const runWithRandom = sources[3];

    for (const source of runImmediately) {
      this.mounter.mount(window, source);
    }
    contentLoaded(window).then(() => {
      for (const source of runDomReady) {
        this.mounter.mount(window, source);
      }
      delay(getRandomInt(1, 5) * 1000).then(() => {
        for (const source of runWithDelay) {
          this.mounter.mount(window, source);
        }
        for (const source of runWithRandom) {
          this.mounter.mount(window, source);
        }
      });
    });

    console.dir({ sources });
  }
}

const contentScript = Container.get(ContentScript);
contentScript.init();
