import type { PluginModule } from './interfaces';

import 'reflect-metadata';
import { Container } from 'typedi';

import { ConfigManagerModule } from './config-manager.module';
import { ConfigManagerService } from './config-manager.service';
import { ModuleRunInEnum, ModuleRunOnEnum } from '../../constants';
import { ConfigManagerServiceMock, MockValues, MockHandlers } from '.';
import { ApiClient, ApiClientModuleMock } from '../../common/api-client';
import { SourceManagerModule, SourceManagerModuleMock } from '../source-manager';

Container.set(ApiClient, new ApiClientModuleMock());
Container.set(ConfigManagerService, new ConfigManagerServiceMock());
Container.set(SourceManagerModule, new SourceManagerModuleMock());

beforeEach(() => {
  MockHandlers.read.mockClear();
});

describe('ConfigManagerModule', () => {
  const configManagerModule = Container.get(ConfigManagerModule);

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
        const actual = await configManagerModule.getSources(origin, isFrame);

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
          const actual = await configManagerModule.getSources(origin, isFrame);

          // Then
          expect(actual).toHaveLength(expectedLength);
        },
      );
    });
  });
});
