import { useState, type FormEvent } from 'react';
import { CustomerNotFoundError, PaymentError, PAYMENT_NOTES_MAX, recordPayment, todayLocal } from '../../db';
import type { CustomerSummary } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatRupeesExact } from '../../utils/formatCurrency';
import {
  validatePaymentForm,
  type PaymentFormErrorKey,
  type PaymentFormErrors,
  type PaymentFormValues,
} from './customerHelpers';

interface PaymentFormProps {
  summary: CustomerSummary;
  onSaved: () => void;
  onCancel: () => void;
}

type SaveErrorKey = PaymentFormErrorKey | 'customerMissing' | 'storageFull' | 'saveFailed';

export function PaymentForm({ summary, onSaved, onCancel }: PaymentFormProps) {
  const { t } = useLanguage();
  const text = t.customers;
  const { outstanding } = summary;
  const today = todayLocal();

  const [values, setValues] = useState<PaymentFormValues>({ amount: '', paidOn: today, notes: '' });
  const [errors, setErrors] = useState<PaymentFormErrors>({});
  const [saveError, setSaveError] = useState<SaveErrorKey | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof PaymentFormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const errorMessage = (key: SaveErrorKey) =>
    text.errors[key].replace('{balance}', formatRupeesExact(outstanding));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaveError(null);

    const result = validatePaymentForm(values, outstanding, today);
    if (!result.ok) {
      setErrors(result.errors);
      const ids = { amount: 'payment-amount', paidOn: 'payment-date', notes: 'payment-notes' };
      const first = (['amount', 'paidOn', 'notes'] as const).find((field) => result.errors[field]);
      if (first) document.getElementById(ids[first])?.focus();
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await recordPayment({ customerId: summary.customer.id, ...result.input });
      onSaved();
    } catch (error) {
      console.error('Could not save payment', error);
      setSaving(false);
      if (error instanceof PaymentError) {
        setSaveError(
          error.code === 'exceedsBalance'
            ? 'amountExceeds'
            : error.code === 'invalidAmount'
              ? 'amountInvalid'
              : error.code === 'invalidDate'
                ? 'dateInvalid'
                : error.code === 'futureDate'
                  ? 'dateFuture'
                  : 'notesTooLong',
        );
      } else if (error instanceof CustomerNotFoundError) {
        setSaveError('customerMissing');
      } else {
        setSaveError(
          error instanceof Error && error.name === 'QuotaExceededError'
            ? 'storageFull'
            : 'saveFailed',
        );
      }
    }
  }

  const fieldError = (field: 'amount' | 'paidOn' | 'notes') =>
    errors[field] ? (
      <p className="field-error" role="alert">
        {errorMessage(errors[field]!)}
      </p>
    ) : null;

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="product-name">{summary.customer.name}</h2>
        <p className="due-line">
          {text.payment.balanceNow}: <strong>{formatRupeesExact(outstanding)}</strong>
        </p>
      </div>

      {Object.keys(errors).length > 0 && (
        <p className="error-box" role="alert">
          {t.inventory.form.fixErrors}
        </p>
      )}
      {saveError && (
        <p className="error-box" role="alert">
          {errorMessage(saveError)}
        </p>
      )}

      <div className="field">
        <label className="field-label" htmlFor="payment-amount">
          {text.payment.amountLabel}
        </label>
        <input
          id="payment-amount"
          className="text-input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus
          value={values.amount}
          aria-invalid={errors.amount ? true : undefined}
          onChange={(event) => set('amount', event.target.value)}
        />
        <p className="field-hint">{text.payment.amountHint}</p>
        <div className="chip-row">
          <button
            type="button"
            className="chip"
            onClick={() => set('amount', String(outstanding))}
          >
            {text.payment.fullAmount.replace('{amount}', formatRupeesExact(outstanding))}
          </button>
        </div>
        {fieldError('amount')}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="payment-date">
          {text.payment.dateLabel}
        </label>
        <input
          id="payment-date"
          className="text-input"
          type="date"
          max={today}
          value={values.paidOn}
          aria-invalid={errors.paidOn ? true : undefined}
          onChange={(event) => set('paidOn', event.target.value)}
        />
        {fieldError('paidOn')}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="payment-notes">
          {text.payment.notesLabel}
        </label>
        <input
          id="payment-notes"
          className="text-input"
          type="text"
          autoComplete="off"
          maxLength={PAYMENT_NOTES_MAX + 20}
          value={values.notes}
          aria-invalid={errors.notes ? true : undefined}
          onChange={(event) => set('notes', event.target.value)}
        />
        <p className="field-hint">{text.payment.notesHint}</p>
        {fieldError('notes')}
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? text.payment.saving : text.payment.save}
        </button>
        <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>
          {text.payment.cancel}
        </button>
      </div>
    </form>
  );
}
