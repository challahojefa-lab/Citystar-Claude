import { useState, type FormEvent } from 'react';
import { createCustomer, CustomerError, CUSTOMER_NAME_MAX, CUSTOMER_NOTES_MAX } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  validateCustomerForm,
  type CustomerFormErrors,
  type CustomerFormValues,
} from './customerHelpers';

interface CustomerFormProps {
  onSaved: () => void;
  onCancel: () => void;
}

type SaveErrorKey = 'nameRequired' | 'nameTooLong' | 'phoneInvalid' | 'notesTooLong' | 'storageFull' | 'saveFailed';

export function CustomerForm({ onSaved, onCancel }: CustomerFormProps) {
  const { t } = useLanguage();
  const text = t.customers;

  const [values, setValues] = useState<CustomerFormValues>({ name: '', phone: '', notes: '' });
  const [errors, setErrors] = useState<CustomerFormErrors>({});
  const [saveError, setSaveError] = useState<SaveErrorKey | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof CustomerFormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaveError(null);

    const result = validateCustomerForm(values);
    if (!result.ok) {
      setErrors(result.errors);
      const first = (['name', 'phone', 'notes'] as const).find((field) => result.errors[field]);
      if (first) document.getElementById(`customer-${first}`)?.focus();
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await createCustomer(result.input);
      onSaved();
    } catch (error) {
      console.error('Could not save customer', error);
      setSaving(false);
      if (error instanceof CustomerError) {
        setSaveError(
          error.code === 'invalidPhone' ? 'phoneInvalid' : error.code,
        );
      } else {
        setSaveError(
          error instanceof Error && error.name === 'QuotaExceededError'
            ? 'storageFull'
            : 'saveFailed',
        );
      }
    }
  }

  const hasErrors = Object.keys(errors).length > 0;
  const fieldError = (field: 'name' | 'phone' | 'notes') =>
    errors[field] ? (
      <p className="field-error" id={`customer-${field}-error`} role="alert">
        {text.errors[errors[field]!]}
      </p>
    ) : null;
  const invalid = (field: 'name' | 'phone' | 'notes') =>
    errors[field]
      ? { 'aria-invalid': true as const, 'aria-describedby': `customer-${field}-error` }
      : {};

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      {hasErrors && (
        <p className="error-box" role="alert">
          {text.form.fixErrors}
        </p>
      )}
      {saveError && (
        <p className="error-box" role="alert">
          {text.errors[saveError]}
        </p>
      )}

      <div className="field">
        <label className="field-label" htmlFor="customer-name">
          {text.form.nameLabel}
        </label>
        <input
          id="customer-name"
          className="text-input"
          type="text"
          autoComplete="off"
          autoFocus
          maxLength={CUSTOMER_NAME_MAX + 20}
          value={values.name}
          {...invalid('name')}
          onChange={(event) => set('name', event.target.value)}
        />
        {fieldError('name')}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="customer-phone">
          {text.form.phoneLabel}
        </label>
        <input
          id="customer-phone"
          className="text-input"
          type="text"
          inputMode="tel"
          autoComplete="off"
          value={values.phone}
          {...invalid('phone')}
          onChange={(event) => set('phone', event.target.value)}
        />
        <p className="field-hint">{text.form.phoneHint}</p>
        {fieldError('phone')}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="customer-notes">
          {text.form.notesLabel}
        </label>
        <input
          id="customer-notes"
          className="text-input"
          type="text"
          autoComplete="off"
          maxLength={CUSTOMER_NOTES_MAX + 20}
          value={values.notes}
          {...invalid('notes')}
          onChange={(event) => set('notes', event.target.value)}
        />
        <p className="field-hint">{text.form.notesHint}</p>
        {fieldError('notes')}
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? text.form.saving : text.form.save}
        </button>
        <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>
          {text.form.cancel}
        </button>
      </div>
    </form>
  );
}
