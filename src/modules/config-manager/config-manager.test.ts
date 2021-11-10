import type { PluginModule } from '../config-service/interfaces';

import 'reflect-metadata';
import { Service, Container } from 'typedi';

import { ConfigManager } from './config-manager';
import { ApiClient } from '../api-client';
import { ConfigService } from '../config-service';
import { ConfigServiceMock, MockValues, MockHandlers } from '../config-service/__mocks__/config-service';
import { ModuleRunInEnum, ModuleRunOnEnum } from '../constants';

@Service()
export class ApiClientMock {
  public read: any = jest.fn();
}

Container.set(ApiClient, new ApiClientMock());
Container.set(ConfigService, new ConfigServiceMock());

beforeEach(() => {
  MockHandlers.read.mockClear();
});

describe('ConfigManager', () => {
  const configManager = Container.get(ConfigManager);

  describe('isFrame is true', () => {
    test.each`
      origin          | hosts              | frames                                | expectedLength
      ${'google.com'} | ${'^google\\.com'} | ${ModuleRunInEnum.RUN_IN_EVERYWHERE}  | ${1}
      ${'google.com'} | ${'^google\\.com'} | ${ModuleRunInEnum.RUN_IN_NOT_FRAMES}  | ${0}
      ${'google.com'} | ${'^google\\.com'} | ${ModuleRunInEnum.RUN_IN_ONLY_FRAMES} | ${1}
    `(
      'should returns `$expectedLength` source module when origin is `$origin` and hosts is `$hosts` and frames is `$frames`',
      async ({
        origin,
        hosts,
        frames,
        expectedLength,
      }: {
        origin: string;
        hosts: string;
        frames: ModuleRunInEnum;
        expectedLength: number;
      }) => {
        // Given
        const isFrame = true;
        const pluginModule: PluginModule = {
          run: ModuleRunOnEnum.RUN_ON_IMMEDIATELY,
          sources: ['./expected.js'],
          frames,
          hosts,
        };

        // When
        MockValues.config.modules = [pluginModule];
        const actual = await configManager.getSources(origin, isFrame);

        // Then
        expect(actual).toHaveLength(expectedLength);
      },
    );

    describe('isFrame is false', () => {
      test.each`
        origin          | hosts              | frames                                | expectedLength
        ${'google.com'} | ${'^google\\.com'} | ${ModuleRunInEnum.RUN_IN_EVERYWHERE}  | ${1}
        ${'google.com'} | ${'^google\\.com'} | ${ModuleRunInEnum.RUN_IN_NOT_FRAMES}  | ${1}
        ${'google.com'} | ${'^google\\.com'} | ${ModuleRunInEnum.RUN_IN_ONLY_FRAMES} | ${0}
      `(
        'should returns `$expectedLength` source module when origin is `$origin` and hosts is `$hosts` and frames is `$frames`',
        async ({
          origin,
          hosts,
          frames,
          expectedLength,
        }: {
          origin: string;
          hosts: string;
          frames: ModuleRunInEnum;
          expectedLength: number;
        }) => {
          // Given
          const isFrame = false;
          const pluginModule: PluginModule = {
            run: ModuleRunOnEnum.RUN_ON_IMMEDIATELY,
            sources: ['./expected.js'],
            frames,
            hosts,
          };

          // When
          MockValues.config.modules = [pluginModule];
          const actual = await configManager.getSources(origin, isFrame);

          // Then
          expect(actual).toHaveLength(expectedLength);
        },
      );
    });
  });
});
