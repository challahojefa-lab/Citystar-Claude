import { useState } from 'react';
import { backupFileName, BackupError, createBackup, initDatabase, serializeBackup } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import { canShareBackupFile, downloadBackup, shareBackup, SaveUnsupportedError } from './saveBackupFile';

const LAST_KEY = 'citystar.lastBackupAt';

type State =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'done'; fileName: string; records: number }
  | { kind: 'empty' }
  | { kind: 'unsupported' }
  | { kind: 'error' };

function readLast(): string | null {
  try {
    return window.localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

/** Big "Backup Now" button. Read-only for shop data; writes only a file (and a note of the time). */
export function BackupCard() {
  const { t, language } = useLanguage();
  const [state, setState] = useState<State>({ kind: 'idle' });
  const [last, setLast] = useState<string | null>(readLast);
  const canShare = canShareBackupFile();
  const working = state.kind === 'working';

  async function run(save: (name: string, text: string) => Promise<'saved' | 'cancelled'> | 'saved' | 'cancelled') {
    setState({ kind: 'working' });
    try {
      await initDatabase();
      const now = new Date();
      const backup = await createBackup(now);
      const name = backupFileName(now);
      const result = await save(name, serializeBackup(backup));
      if (result === 'cancelled') {
        setState({ kind: 'idle' });
        return;
      }
      try {
        window.localStorage.setItem(LAST_KEY, now.toISOString());
      } catch {
        // The note of the last backup time is only a convenience.
      }
      setLast(now.toISOString());
      setState({ kind: 'done', fileName: name, records: backup.totalRecords });
    } catch (error) {
      if (error instanceof BackupError) setState({ kind: 'empty' });
      else if (error instanceof SaveUnsupportedError) setState({ kind: 'unsupported' });
      else {
        console.error('Backup failed', error);
        setState({ kind: 'error' });
      }
    }
  }

  const locale = language === 'gu' ? 'gu-IN' : 'en-IN';
  const lastText = (() => {
    if (!last || Number.isNaN(Date.parse(last))) return t.backup.never;
    return t.backup.lastBackup.replace(
      '{date}',
      new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(last)),
    );
  })();

  return (
    <section aria-labelledby="backup-heading" className="backup-card">
      <h2 id="backup-heading" className="section-title">
        {t.backup.title}
      </h2>
      <p className="backup-text">{t.backup.description}</p>
      <button type="button" className="primary-button" disabled={working} onClick={() => run(downloadBackup)}>
        {working ? t.backup.working : t.backup.button}
      </button>
      {canShare && (
        <button type="button" className="secondary-button backup-share" disabled={working} onClick={() => run(shareBackup)}>
          {t.backup.share}
        </button>
      )}
      <p className="backup-last">{lastText}</p>
      <div role="status">
        {state.kind === 'done' && (
          <div className="notice">
            <p>{t.backup.doneTitle}</p>
            <p className="backup-file">{state.fileName}</p>
            <p>{t.backup.doneCount.replace('{count}', String(state.records))}</p>
            <p>{t.backup.doneHint}</p>
          </div>
        )}
        {state.kind === 'empty' && <div className="warn-box">{t.backup.empty}</div>}
        {state.kind === 'unsupported' && <div className="error-box">{t.backup.unsupported}</div>}
        {state.kind === 'error' && <div className="error-box">{t.backup.error}</div>}
      </div>
      <p className="backup-text">{t.backup.restoreNote}</p>
    </section>
  );
}
