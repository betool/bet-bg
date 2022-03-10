import { Service, Inject } from 'typedi';
import { ApiClient } from '../../common/api-client';
import { ConfigService } from '../../common/config-service';
import { ModuleManager } from '../../core/module-manager';
import { ModuleRunInEnum } from '../../constants';

@Service()
export class ConfigManager {
  constructor(
    @Inject()
    private readonly apiClient: ApiClient,
    @Inject()
    private readonly configService: ConfigService,
    @Inject()
    private readonly moduleManager: ModuleManager,
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
          const sourceValues = await this.getSourceValues(module.sources);
          sources = sources.concat(sourceValues);
          continue;
        }
        if (isFrame === false && module.frames === ModuleRunInEnum.RUN_IN_NOT_FRAMES) {
          const sourceValues = await this.getSourceValues(module.sources);
          sources = sources.concat(sourceValues);
          continue;
        }
        if (isFrame === true && module.frames === ModuleRunInEnum.RUN_IN_ONLY_FRAMES) {
          const sourceValues = await this.getSourceValues(module.sources);
          sources = sources.concat(sourceValues);
        }
      }
    }

    return sources;
  }

  public async getSourceValues(sources: Array<string>): Promise<Array<string>> {
    const getSourcePromise = sources.map((source) => this.moduleManager.getSource(source));
    const sourceValuesResult = await Promise.all(getSourcePromise);
    const sourcesValues = sourceValuesResult.filter<string>((sourceValue): sourceValue is string => typeof sourceValue === 'string');
    return sourcesValues;
  }
}
