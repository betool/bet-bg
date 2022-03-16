import { Service, Inject } from 'typedi';
import { ConfigManagerModule } from '../../config-manager';
import { SourcesMessage } from '../interfaces';

@Service()
export class BackgroundMessengerService {
  constructor(
    @Inject()
    private readonly configManager: ConfigManagerModule,
  ) {}
  public ping(): Promise<string> {
    return Promise.resolve('pong');
  }

  public async getSources(sender: chrome.runtime.MessageSender): Promise<SourcesMessage> {
    console.log({ sender });
    const { origin, url, frameId } = sender;
    const isFrame = frameId !== 0;

    const sources = await this.configManager.getSources(origin, isFrame);

    return sources;
  }
}
