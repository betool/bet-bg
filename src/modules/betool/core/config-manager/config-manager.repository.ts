import { Service } from 'typedi';
import localForage from 'localforage';

@Service({ global: true })
export class ConfigManagerRepository {
  private readonly storage: LocalForage;

  constructor() {
    this.storage = localForage.createInstance({
      name: 'plugin-storage',
      driver: localForage.LOCALSTORAGE,
    });
  }

  public getItem<GetItemType>(key: string): Promise<GetItemType | null> {
    return this.storage.getItem<GetItemType>(key);
  }

  public setItem<SetItemType>(key: string, value: SetItemType): Promise<SetItemType> {
    return this.storage.setItem(key, value);
  }

  public removeItem(key: string): Promise<void> {
    return this.storage.removeItem(key);
  }
}
