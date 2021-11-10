import { Service, Inject } from 'typedi';
import { ConfigManager } from '../config-manager';

@Service()
export class MessageService {
  constructor(
    @Inject()
    private readonly configManager: ConfigManager,
  ) {}
  public ping(): Promise<string> {
    return Promise.resolve('pong');
  }

  public async getSources(sender: chrome.runtime.MessageSender): Promise<Array<string>> {
    console.log({ sender });
    const { origin, url, frameId } = sender;
    const isFrame = frameId !== 0;

    const sources = await this.configManager.getSources(origin, isFrame);

    return Promise.resolve(sources);
  }
}
