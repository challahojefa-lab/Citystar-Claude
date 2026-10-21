import { useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface NotReadyDialogProps {
  /** Name of the section that was tapped, or null when the dialog is closed. */
  sectionName: string | null;
  onClose: () => void;
}

export function NotReadyDialog({ sectionName, onClose }: NotReadyDialogProps) {
  const { t } = useLanguage();
  const okButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = sectionName !== null;

  useEffect(() => {
    if (!isOpen) return;
    okButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="not-ready-heading"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="not-ready-heading" className="dialog-heading">
          {t.notReady.heading}
        </h2>
        <p className="dialog-message">
          {t.notReady.message.replace('{name}', sectionName)}
        </p>
        <button
          ref={okButtonRef}
          type="button"
          className="dialog-button"
          onClick={onClose}
        >
          {t.notReady.ok}
        </button>
      </div>
    </div>
  );
}
