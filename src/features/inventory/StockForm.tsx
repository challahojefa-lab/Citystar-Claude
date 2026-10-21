import { useState, type FormEvent } from 'react';
import { setStockQuantity } from '../../db';
import type { Product } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatQuantity } from '../../utils/formatCurrency';
import { getErrorKey } from './dbErrors';
import { parseStockQuantity } from './stockHelpers';
import type { InventoryErrorKey } from './productHelpers';

interface StockFormProps {
  product: Product;
  /** undefined = no stock recorded yet. The box then starts empty (not 0). */
  currentQuantity: number | undefined;
  onSaved: () => void;
  onCancel: () => void;
}

export function StockForm({ product, currentQuantity, onSaved, onCancel }: StockFormProps) {
  const { t } = useLanguage();
  const text = t.inventory;
  const unitText = text.units[product.unit];

  const [value, setValue] = useState(
    currentQuantity === undefined ? '' : String(currentQuantity),
  );
  const [errorKey, setErrorKey] = useState<InventoryErrorKey | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;

    const parsed = parseStockQuantity(value, product.unit);
    if (!parsed.ok) {
      setErrorKey(parsed.reason === 'whole' ? 'stockQuantityWhole' : 'stockQuantityInvalid');
      document.getElementById('stock-quantity')?.focus();
      return;
    }

    setErrorKey(null);
    setSaving(true);
    try {
      await setStockQuantity(product.id, parsed.value);
      onSaved();
    } catch (error) {
      console.error('Could not save stock', error);
      setErrorKey(getErrorKey(error, 'saveFailed'));
      setSaving(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit} noValidate>
      <div>
        <h2 className="product-name">{product.name}</h2>
        <p className="product-meta">
          <span>
            {text.stock.currentLabel}:{' '}
            <strong>
              {currentQuantity === undefined
                ? text.card.stockNotRecorded
                : `${formatQuantity(currentQuantity)} ${unitText}`}
            </strong>
          </span>
        </p>
      </div>

      {errorKey && (
        <p className="error-box" role="alert">
          {text.errors[errorKey]}
        </p>
      )}

      <div className="field">
        <label className="field-label" htmlFor="stock-quantity">
          {text.stock.quantityLabel.replace('{unit}', unitText)}
        </label>
        <input
          id="stock-quantity"
          className="text-input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoFocus
          value={value}
          aria-invalid={errorKey ? true : undefined}
          onChange={(event) => setValue(event.target.value)}
        />
        <p className="field-hint">{text.stock.hint}</p>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? text.stock.saving : text.stock.save}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
          disabled={saving}
        >
          {text.stock.cancel}
        </button>
      </div>
    </form>
  );
}
