import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLocalizationServiceOverride from '@codingame/monaco-vscode-localization-service-override';
import getBannerServiceOverride from '@codingame/monaco-vscode-view-banner-service-override';
import getStatusBarServiceOverride from '@codingame/monaco-vscode-view-status-bar-service-override';
import getTitleBarServiceOverride from '@codingame/monaco-vscode-view-title-bar-service-override';
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import getRemoteAgentServiceOverride from '@codingame/monaco-vscode-remote-agent-service-override';
import getEnvironmentServiceOverride from '@codingame/monaco-vscode-environment-service-override';
import getSecretStorageServiceOverride from '@codingame/monaco-vscode-secret-storage-service-override';
import getStorageServiceOverride from '@codingame/monaco-vscode-storage-service-override';
import getSearchServiceOverride from '@codingame/monaco-vscode-search-service-override';
import getDebugServiceOverride from '@codingame/monaco-vscode-debug-service-override';
import getTestingServiceOverride from '@codingame/monaco-vscode-testing-service-override';
import getPreferencesServiceOverride from '@codingame/monaco-vscode-preferences-service-override';

import {
  defaultHtmlAugmentationInstructions,
  defaultViewsInit,
} from 'monaco-editor-wrapper/vscode/services';
import { createDefaultLocaleConfiguration } from 'monaco-languageclient/vscode/services';
import { ConfigParams } from './types';

export function getAllOverrides(configParams: ConfigParams) {
  return {
    serviceOverrides: {
      ...getKeybindingsServiceOverride(),
      ...getLifecycleServiceOverride(),
      ...getLocalizationServiceOverride(createDefaultLocaleConfiguration()),
      ...getBannerServiceOverride(),
      ...getStatusBarServiceOverride(),
      ...getTitleBarServiceOverride(),
      ...getExplorerServiceOverride(),
      ...getRemoteAgentServiceOverride(),
      ...getEnvironmentServiceOverride(),
      ...getSecretStorageServiceOverride(),
      ...getStorageServiceOverride(),
      ...getSearchServiceOverride(),
      ...getDebugServiceOverride(),
      ...getTestingServiceOverride(),
      ...getPreferencesServiceOverride(),
    },
    viewsConfig: {
      viewServiceType: 'ViewsService' as const,
      htmlAugmentationInstructions: defaultHtmlAugmentationInstructions,
      viewsInitFunc: defaultViewsInit,
    },
    userConfiguration: {
      json: JSON.stringify({
        'workbench.colorTheme': 'Default Dark Modern',
        'editor.guides.bracketPairsHorizontal': 'active',
        'editor.wordBasedSuggestions': 'off',
        'editor.experimental.asyncTokenization': true,
        'debug.toolBarLocation': 'docked',
      }),
    },
    workspaceConfig: {
      enableWorkspaceTrust: true,
      windowIndicator: {
        label: configParams.extensionName ?? 'monaco-example',
        tooltip: '',
        command: '',
      },
      workspaceProvider: {
        trusted: true,
        async open() {
          window.open(window.location.href);
          return true;
        },
        workspace: {
          workspaceUri: configParams.workspaceFile,
        },
      },
      configurationDefaults: {
        'window.title': '${dirty}${activeEditorShort}',
      },
      productConfiguration: {
        nameShort: 'monaco-example',
        nameLong: 'Monaco Editor Example',
      },
    },
  };
}
