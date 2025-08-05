import path from 'path';
import react from '@vitejs/plugin-react';
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin';
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin';
import { defineConfig } from 'vite';


export default defineConfig({
    plugins: [react(), vsixPlugin()],
    resolve: {
        dedupe: ['vscode'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                importMetaUrlPlugin
            ]
        },
        include: [
            '@codingame/monaco-vscode-api',
            '@codingame/monaco-vscode-python-default-extension',
            '@codingame/monaco-vscode-typescript-basics-default-extension',
            '@codingame/monaco-vscode-keybindings-service-override',
            '@codingame/monaco-vscode-lifecycle-service-override',
            '@codingame/monaco-vscode-localization-service-override',
            '@codingame/monaco-vscode-view-banner-service-override',
            '@codingame/monaco-vscode-view-status-bar-service-override',
            '@codingame/monaco-vscode-view-title-bar-service-override',
            '@codingame/monaco-vscode-explorer-service-override',
            '@codingame/monaco-vscode-remote-agent-service-override',
            '@codingame/monaco-vscode-environment-service-override',
            '@codingame/monaco-vscode-secret-storage-service-override',
            '@codingame/monaco-vscode-storage-service-override',
            '@codingame/monaco-vscode-search-service-override',
            '@codingame/monaco-vscode-debug-service-override',
            '@codingame/monaco-vscode-testing-service-override',
            '@codingame/monaco-vscode-preferences-service-override',
            '@codingame/monaco-vscode-theme-defaults-default-extension', // for theme JSON loads
            '@codingame/monaco-vscode-files-service-override',
            '@codingame/monaco-vscode-terminal-service-override',
            'vscode-oniguruma', // for onig.wasm
            'vscode-textmate',  // for TextMate grammars
            'vscode-languageclient'
        ]
    },
    worker:{
        format:'es'
    }
});

