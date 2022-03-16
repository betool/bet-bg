import { Service, Inject } from 'typedi';
import { ModuleRunInEnum } from '../constants';
import { ApiClientModule } from '../api-client';
import { SourceManagerModule } from '../source-manager';
import { ConfigManagerService } from './config-manager.service';
import { PluginModule } from './interfaces';
import { SourceConfiguration, SourcesMessage } from '../messengers';

@Service()
export class ConfigManagerModule {
  constructor(
    @Inject()
    private readonly apiClient: ApiClientModule,
    @Inject()
    private readonly configManagerService: ConfigManagerService,
    @Inject()
    private readonly sourceManager: SourceManagerModule,
  ) {}

  public async fetchAndUpdate(): Promise<boolean> {
    const remoteConfig = await this.apiClient.configRead();
    const localConfig = await this.configManagerService.read();

    const configWasChanged = localConfig.version !== remoteConfig.version;

    if (configWasChanged) {
      await this.configManagerService.write(remoteConfig);
    }

    return configWasChanged;
  }

  public async getSources(origin: string, isFrame: boolean): Promise<SourcesMessage> {
    const { modules } = await this.configManagerService.read();

    let sources: SourcesMessage = [[], [], [], []];
    for (const module of modules) {
      const originRexExp = new RegExp(module.hosts);
      if (originRexExp.test(origin)) {
        if (module.frames === ModuleRunInEnum.RUN_IN_EVERYWHERE) {
          const sourceValues = await this.getSourceValues(module.sources);
          this.putSources(sources, module, sourceValues);
          continue;
        }
        if (isFrame === false && module.frames === ModuleRunInEnum.RUN_IN_NOT_FRAMES) {
          const sourceValues = await this.getSourceValues(module.sources);
          this.putSources(sources, module, sourceValues);
          continue;
        }
        if (isFrame === true && module.frames === ModuleRunInEnum.RUN_IN_ONLY_FRAMES) {
          const sourceValues = await this.getSourceValues(module.sources);
          this.putSources(sources, module, sourceValues);
        }
      }
    }

    return sources;
  }

  public putSources(target: SourcesMessage, module: PluginModule, sourceValues: Array<string>) {
    const sourceConfiguration: SourceConfiguration = {
      mount: module.mount,
      sources: sourceValues,
      delay: module.delay,
    };
    target[module.run].push(sourceConfiguration);
  }

  public async getSourceValues(sources: Array<string>): Promise<Array<string>> {
    const getSourcePromise = sources.map((source) => this.sourceManager.getSource(source));
    const sourceValuesResult = await Promise.all(getSourcePromise);
    const sourcesValues = sourceValuesResult.filter<string>((sourceValue): sourceValue is string => typeof sourceValue === 'string');
    return sourcesValues;
  }
}
