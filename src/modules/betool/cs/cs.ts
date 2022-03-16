import 'reflect-metadata';
import { Container, Inject, Service } from 'typedi';
import { MounterModule } from '../core/mounter';
import { ContentMessengerModule } from '../core/messengers';



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
    this.mounter.mount(sources);
  }
}

const contentScript = Container.get(ContentScript);
contentScript.init();
