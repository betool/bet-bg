export interface PluginModule {
  readonly run: 0 | 1;
  readonly frames: 0 | 1;
  readonly hosts: string;
  readonly sources: Array<string>;
}
