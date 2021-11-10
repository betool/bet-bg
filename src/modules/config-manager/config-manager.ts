import { Service, Inject } from 'typedi';
import { ApiClient } from '../api-client';
import { ConfigService } from '../config-service';
import { ModuleRunInEnum } from '../constants';

@Service()
export class ConfigManager {
  constructor(
    @Inject()
    private readonly apiClient: ApiClient,
    @Inject()
    private readonly configService: ConfigService,
  ) {}

  public async fetchAndUpdate(): Promise<boolean> {
    const remoteConfig = await this.apiClient.configRead();
    const localConfig = await this.configService.read();

    const configWasChanged = localConfig.version !== remoteConfig.version;

    if (configWasChanged) {
      await this.configService.write(remoteConfig);
    }

    return configWasChanged;
  }

  public async getSources(origin: string, isFrame: boolean) {
    const { modules } = await this.configService.read();

    let sources: Array<string> = [];
    for (const module of modules) {
      const originRexExp = new RegExp(module.hosts);
      if (originRexExp.test(origin)) {
        if (module.frames === ModuleRunInEnum.RUN_IN_EVERYWHERE) {
          sources = sources.concat(module.sources);
          continue;
        }
        if (isFrame === false && module.frames === ModuleRunInEnum.RUN_IN_NOT_FRAMES) {
          sources = sources.concat(module.sources);
          continue;
        }
        if (isFrame === true && module.frames === ModuleRunInEnum.RUN_IN_ONLY_FRAMES) {
          sources = sources.concat(module.sources);
        }
      }
    }

    return sources;
  }
}
