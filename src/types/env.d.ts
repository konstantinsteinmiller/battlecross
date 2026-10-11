export interface IElectronAPI {
  quitApp: () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}

interface WavedashSDK {
  init(options?: { debug?: boolean }): void;

  updateLoadProgressZeroToOne(progress: number): void;

  // Remote Storage (cloud saves) — used by `utils/save/WavedashStrategy`.
  downloadRemoteFile(path: string): Promise<{ success: boolean; data: string | null; message?: string }>;

  uploadRemoteFile(path: string): Promise<{ success: boolean; data: string | null; message?: string }>;

  writeLocalFile(path: string, data: Uint8Array): Promise<boolean>;

  readLocalFile(path: string): Promise<Uint8Array | null>;
}

declare global {
  interface Window {
    WavedashJS: Promise<WavedashSDK>;
  }
}
