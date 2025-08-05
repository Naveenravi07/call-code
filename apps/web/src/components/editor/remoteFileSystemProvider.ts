import {
    IFileSystemProviderWithOpenReadWriteCloseCapability,
    IFileWriteOptions,
    FileType,
    IFileReadStreamOptions,
    IFileOverwriteOptions,
    IFileDeleteOptions,
    IFileChange,
    FileSystemProviderCapabilities,
    IStat,
    IFileOpenOptions,
    IWatchOptions,
} from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { CancellationToken } from '@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation';
import { ReadableStreamEvents } from '@codingame/monaco-vscode-api/vscode/vs/base/common/stream';
import { IDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import * as vscode from 'vscode';
import axios from 'axios';

export class remoteFileSystemProvider
    implements IFileSystemProviderWithOpenReadWriteCloseCapability {
    private sessionId: string;
    private sessionUrl: string;
    private readonly _fileDescriptors = new Map<number, URI>();
    private _fdCounter = 0;

    constructor(sessionId?: string) {
        if (!sessionId) {
            throw new Error('Session ID is required for remoteFileSystemProvider');
        }
        this.sessionId = sessionId;
        this.sessionUrl = `http://ws.${sessionId}.call-code.local`;
        console.log('remoteFileSystemProvider initialized');
    }

    capabilities: FileSystemProviderCapabilities =
        FileSystemProviderCapabilities.FileOpenReadWriteClose |
        FileSystemProviderCapabilities.FileFolderCopy;

    async readdir(resource: URI): Promise<[string, FileType][]> {
        console.log('readdir method called with resource:', resource.toString());
        console.log('Session URL:', this.sessionUrl);
        let files = await axios.get(`${this.sessionUrl}/api/files/`);
        console.log('Files fetched:', files.data);
        return [];
    }

    async readFile(resource: URI): Promise<Uint8Array> {
        console.log('readfile method called with resource:', resource)
        let file = await axios.get(`${this.sessionUrl}/api/files/`);
        console.log('File data fetched:', file.data);
        return new Uint8Array();
    }

    async writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void> {
        console.log('writeFile method called');
        return;
    }


    async read(
        fd: number,
        pos: number,
        data: Uint8Array,
        offset: number,
        length: number,
    ): Promise<number> {
        console.log('read method called');
        const resource = this._fileDescriptors.get(fd);
        if (!resource) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }
        return 0;
    }

    readFileStream(
        resource: URI,
        opts: IFileReadStreamOptions,
        token: CancellationToken,
    ): ReadableStreamEvents<Uint8Array> {
        console.log('readFileStream method called');
        return {} as ReadableStreamEvents<Uint8Array>;
    }

    async rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void> {
        console.log('rename method called');
        return;
    }

    async copy(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void> {
        console.log('copy method called');
        return;
    }

    async close(fd: number): Promise<void> {
        console.log('close method called');
        this._fileDescriptors.delete(fd);
    }

    async delete(resource: URI, opts: IFileDeleteOptions): Promise<void> {
        console.log('delete method called');
        return;
    }

    onDidChangeFile: vscode.Event<readonly IFileChange[]> = () => ({ dispose() { } });

    async cloneFile(from: URI, to: URI): Promise<void> {
        console.log('cloneFile method called');
        return;
    }

    async mkdir(resource: URI): Promise<void> {
        console.log('mkdir method called');
        return;
    }

    onDidChangeCapabilities: vscode.Event<void> = () => ({ dispose() { } });

    onDidWatchError?: vscode.Event<string> | undefined = undefined;

    async open(resource: URI, opts: IFileOpenOptions): Promise<number> {
        console.log('open method called');
        const fd = ++this._fdCounter;
        this._fileDescriptors.set(fd, resource);
        return fd;
    }

    async stat(resource: URI): Promise<IStat> {
        console.log('stat method called');
        return {
            type: FileType.File,
            ctime: Date.now(),
            mtime: Date.now(),
            size: 0,
        };
    }

    watch(resource: URI, opts: IWatchOptions): IDisposable {
        console.log('watch method called');
        return {
            dispose: () => { },
        };
    }

    async write(
        fd: number,
        pos: number,
        data: Uint8Array,
        offset: number,
        length: number,
    ): Promise<number> {
        console.log('write method called');
        const resource = this._fileDescriptors.get(fd);
        if (!resource) {
            throw new Error(`Invalid file descriptor: ${fd}`);
        }
        return length;
    }
}
