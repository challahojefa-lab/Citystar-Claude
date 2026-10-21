import { useMemo, useState, type FormEvent } from 'react';
import { createProduct, PRODUCT_UNITS, updateProduct } from '../../db';
import type { Product } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import { getErrorKey } from './dbErrors';
import {
  distinctCategories,
  emptyFormValues,
  FORM_FIELD_ORDER,
  formValuesFromProduct,
  MAX_CATEGORY_LENGTH,
  MAX_NAME_LENGTH,
  validateProductForm,
  type InventoryErrorKey,
  type ProductFormErrors,
  type ProductFormField,
  type ProductFormValues,
} from './productHelpers';

interface ProductFormProps {
  /** The product being edited, or null to add a new one. */
  product: Product | null;
  /** Current product list, used for the duplicate-name check and category choices. */
  products: readonly Product[];
  onSaved: () => void;
  onCancel: () => void;
}

const FIELD_IDS: Record<ProductFormField, string> = {
  name: 'product-name',
  category: 'product-category',
  purchasePrice: 'product-purchase-price',
  sellingPrice: 'product-selling-price',
};

export function ProductForm({ product, products, onSaved, onCancel }: ProductFormProps) {
  const { t } = useLanguage();
  const text = t.inventory;

  const [values, setValues] = useState<ProductFormValues>(() =>
    product ? formValuesFromProduct(product) : emptyFormValues(),
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [saveError, setSaveError] = useState<InventoryErrorKey | null>(null);
  const [saving, setSaving] = useState(false);

  const categories = useMemo(() => distinctCategories(products), [products]);

  function setField<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaveError(null);

    const result = validateProductForm(values, products, product?.id ?? null);
    if (!result.ok) {
      setErrors(result.errors);
      const first = FORM_FIELD_ORDER.find((field) => result.errors[field]);
      if (first) document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      if (product) {
        await updateProduct(product.id, result.input);
      } else {
        await createProduct(result.input);
      }
      onSaved();
    } catch (error) {
      console.error('Could not save product', error);
      setSaveError(getErrorKey(error, 'saveFailed'));
      setSaving(false);
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  /** Props shared by every text input that can show an error. */
  const errorProps = (field: ProductFormField) => ({
    id: FIELD_IDS[field],
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${FIELD_IDS[field]}-error` : undefined,
  });

  const fieldError = (field: ProductFormField) =>
    errors[field] ? (
      <p className="field-error" id={`${FIELD_IDS[field]}-error`} role="alert">
        {text.errors[errors[field]!]}
      </p>
    ) : null;

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
        <label className="field-label" htmlFor={FIELD_IDS.name}>
          {text.form.nameLabel}
        </label>
        <input
          {...errorProps('name')}
          className="text-input"
          type="text"
          value={values.name}
          maxLength={MAX_NAME_LENGTH + 20}
          autoComplete="off"
          autoFocus={product === null}
          onChange={(event) => setField('name', event.target.value)}
        />
        {fieldError('name')}
      </div>

      <div className="field">
        <label className="field-label" htmlFor={FIELD_IDS.category}>
          {text.form.categoryLabel}
        </label>
        <input
          {...errorProps('category')}
          className="text-input"
          type="text"
          value={values.category}
          maxLength={MAX_CATEGORY_LENGTH + 20}
          autoComplete="off"
          onChange={(event) => setField('category', event.target.value)}
        />
        <p className="field-hint">{text.form.categoryHint}</p>
        {fieldError('category')}
        {categories.length > 0 && (
          <>
            <p className="field-hint">{text.form.categoryPick}</p>
            <div className="chip-row">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="chip"
                  aria-pressed={values.category.trim() === category}
                  onClick={() => setField('category', category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="field">
        <span className="field-label" id="product-unit-label">
          {text.form.unitLabel}
        </span>
        <div className="chip-row" role="radiogroup" aria-labelledby="product-unit-label">
          {PRODUCT_UNITS.map((unit) => (
            <button
              key={unit}
              type="button"
              role="radio"
              className="chip"
              aria-checked={values.unit === unit}
              onClick={() => setField('unit', unit)}
            >
              {text.units[unit]}
            </button>
          ))}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field-label" htmlFor={FIELD_IDS.purchasePrice}>
            {text.form.purchasePriceLabel}
          </label>
          <input
            {...errorProps('purchasePrice')}
            className="text-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={values.purchasePrice}
            onChange={(event) => setField('purchasePrice', event.target.value)}
          />
          <p className="field-hint">{text.form.priceHint}</p>
          {fieldError('purchasePrice')}
        </div>

        <div className="field">
          <label className="field-label" htmlFor={FIELD_IDS.sellingPrice}>
            {text.form.sellingPriceLabel}
          </label>
          <input
            {...errorProps('sellingPrice')}
            className="text-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={values.sellingPrice}
            onChange={(event) => setField('sellingPrice', event.target.value)}
          />
          <p className="field-hint">{text.form.priceHint}</p>
          {fieldError('sellingPrice')}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? text.form.saving : text.form.save}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
          disabled={saving}
        >
          {text.form.cancel}
        </button>
      </div>
    </form>
  );
}
