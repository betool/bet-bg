import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';
import { ContentMessengerModule } from '../core/messengers';

@Service()
class ContentScript {
  constructor(
    @Inject()
    private readonly contentMessenger: ContentMessengerModule,
  ) {
    console.log('cs-');
  }

  public async init(): Promise<void> {
    const sources = await this.contentMessenger.getSources();
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.text = (sources as Array<string>)[0] as string;
    document.body.appendChild(scriptTag);
  }
}

const contentScript = Container.get(ContentScript);
contentScript.init();
