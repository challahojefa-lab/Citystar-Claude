export type SaveResult = 'saved' | 'cancelled';

export class SaveUnsupportedError extends Error {
  constructor() {
    super('This device cannot save files from the app.');
    this.name = 'SaveUnsupportedError';
  }
}

function makeFile(name: string, text: string): File | Blob {
  if (typeof File === 'function') return new File([text], name, { type: 'application/json' });
  return new Blob([text], { type: 'application/json' });
}

/** Starts a normal browser download. Throws SaveUnsupportedError if the browser cannot. */
export function downloadBackup(name: string, text: string): SaveResult {
  if (
    typeof Blob === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function' ||
    typeof document === 'undefined'
  ) {
    throw new SaveUnsupportedError();
  }
  const url = URL.createObjectURL(makeFile(name, text));
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Give the browser a moment to start reading the file before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
  return 'saved';
}

/** True when the device can hand a file to other apps (WhatsApp, Drive...) via the share sheet. */
export function canShareBackupFile(): boolean {
  try {
    if (typeof navigator === 'undefined' || typeof navigator.canShare !== 'function') return false;
    if (typeof navigator.share !== 'function') return false;
    return navigator.canShare({ files: [makeFile('x.json', '{}') as File] });
  } catch {
    return false;
  }
}

/** Opens the share sheet with the backup file. Closing the sheet returns 'cancelled'. */
export async function shareBackup(name: string, text: string): Promise<SaveResult> {
  if (!canShareBackupFile()) throw new SaveUnsupportedError();
  try {
    await navigator.share({ files: [makeFile(name, text) as File], title: name });
    return 'saved';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    throw error;
  }
}
