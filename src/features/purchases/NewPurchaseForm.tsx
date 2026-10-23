import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createPurchase, PurchaseError } from '../../db';
import type { Product, Purchase } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatQuantity, formatRupeesExact } from '../../utils/formatCurrency';
import { filterProducts } from '../inventory/productHelpers';
import { normalizePhone } from '../sales/saleHelpers';
import {
  computeGrandTotal,
  computeLineTotal,
  defaultPriceText,
  MAX_SUPPLIER_NAME_LENGTH,
  validateCart,
  type CartLine,
  type LineErrors,
} from './purchaseHelpers';

interface NewPurchaseFormProps {
  products: readonly Product[];
  /** productId -> quantity in stock. A missing product has no recorded stock. */
  stock: ReadonlyMap<string, number>;
  onSaved: (purchase: Purchase) => void;
  onCancel: () => void;
}

type FormErrorKey = 'noItems' | 'phoneInvalid' | 'nameTooLong';
type SaveErrorKey = 'storageFull' | 'saveFailed';

const MAX_RESULTS = 8;

export function NewPurchaseForm({ products, stock, onSaved, onCancel }: NewPurchaseFormProps) {
  const { t } = useLanguage();
  const text = t.purchases;
  const unitName = (product: Product) => t.inventory.units[product.unit];

  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [lineErrors, setLineErrors] = useState<LineErrors>({});
  const [formErrors, setFormErrors] = useState<Partial<Record<FormErrorKey, true>>>({});
  const [saveError, setSaveError] = useState<SaveErrorKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const matches = useMemo(() => filterProducts(products, query), [products, query]);
  const grandTotal = useMemo(() => computeGrandTotal(cart, productById), [cart, productById]);
  const inCart = useMemo(() => new Set(cart.map((line) => line.productId)), [cart]);

  // After adding a product, jump to its quantity box (this also scrolls to it).
  useEffect(() => {
    if (!focusId) return;
    const input = document.getElementById(`pqty-${focusId}`) as HTMLInputElement | null;
    input?.focus();
    input?.select();
    setFocusId(null);
  }, [focusId, cart]);

  function addProduct(product: Product) {
    setSaveError(null);
    if (!inCart.has(product.id)) {
      setCart((current) => [
        ...current,
        { productId: product.id, quantity: '1', price: defaultPriceText(product) },
      ]);
    }
    setQuery('');
    setFocusId(product.id);
  }

  function clearLineError(productId: string) {
    setLineErrors((current) => {
      if (!current[productId]) return current;
      const { [productId]: _removed, ...rest } = current;
      return rest;
    });
  }

  function setField(productId: string, field: 'quantity' | 'price', value: string) {
    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, [field]: value } : line)),
    );
    clearLineError(productId);
  }

  function removeLine(productId: string) {
    setCart((current) => current.filter((line) => line.productId !== productId));
    clearLineError(productId);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaveError(null);

    const nextFormErrors: Partial<Record<FormErrorKey, true>> = {};
    if (cart.length === 0) nextFormErrors.noItems = true;
    const phone = normalizePhone(supplierPhone);
    if (!phone.ok) nextFormErrors.phoneInvalid = true;
    const name = supplierName.trim().replace(/\s+/g, ' ');
    if (name.length > MAX_SUPPLIER_NAME_LENGTH) nextFormErrors.nameTooLong = true;

    const cartCheck = validateCart(cart, productById);
    setLineErrors(cartCheck.ok ? {} : cartCheck.errors);
    setFormErrors(nextFormErrors);
    if (!cartCheck.ok || Object.keys(nextFormErrors).length > 0 || !phone.ok) return;

    setSaving(true);
    try {
      const purchase = await createPurchase({
        supplierName: name,
        supplierPhone: phone.value,
        lines: cartCheck.lines,
      });
      onSaved(purchase);
    } catch (error) {
      console.error('Could not save purchase', error);
      setSaving(false);
      if (error instanceof PurchaseError) {
        if (error.code === 'noItems') {
          setFormErrors({ noItems: true });
        } else if (error.productId) {
          // The database is the final judge: show its reason on the right row.
          const id = error.productId;
          setLineErrors({
            [id]:
              error.code === 'productMissing'
                ? { product: 'productMissing' }
                : error.code === 'invalidPrice'
                  ? { price: 'priceInvalid' }
                  : {
                      quantity:
                        error.code === 'notWholeNumber' ? 'quantityWhole' : 'quantityInvalid',
                    },
          });
        } else {
          setSaveError('saveFailed');
        }
        return;
      }
      setSaveError(
        error instanceof Error && error.name === 'QuotaExceededError'
          ? 'storageFull'
          : 'saveFailed',
      );
    }
  }

  const hasErrors = Object.keys(lineErrors).length > 0 || Object.keys(formErrors).length > 0;

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
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

      <section className="form-card" aria-labelledby="purchase-items-heading">
        <h2 className="section-title" id="purchase-items-heading">
          {text.form.itemsTitle}
        </h2>
        <p className="field-hint">{text.form.priceNote}</p>

        {cart.length === 0 ? (
          <p className="empty-state">{text.form.noItems}</p>
        ) : (
          <ul className="cart-list">
            {cart.map((line) => {
              const product = productById.get(line.productId);
              const error = lineErrors[line.productId];
              const lineTotal = computeLineTotal(line, product);
              const name = product?.name ?? '?';
              const unit = product ? unitName(product) : '';
              const stockNow = product ? stock.get(product.id) : undefined;
              return (
                <li className="cart-line" key={line.productId}>
                  <div className="cart-head">
                    <h3 className="product-name">{name}</h3>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeLine(line.productId)}
                      aria-label={text.form.removeAria.replace('{name}', name)}
                    >
                      {text.form.remove}
                    </button>
                  </div>
                  {error?.product && (
                    <p className="field-error" role="alert">
                      {text.errors[error.product]}
                    </p>
                  )}

                  <div className="cart-fields purchase-fields">
                    <div className="field">
                      <label className="field-label" htmlFor={`pqty-${line.productId}`}>
                        {text.form.quantityLabel.replace('{unit}', unit)}
                      </label>
                      <input
                        id={`pqty-${line.productId}`}
                        className="text-input"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={line.quantity}
                        aria-label={text.form.quantityAria.replace('{name}', name)}
                        aria-invalid={error?.quantity ? true : undefined}
                        onChange={(event) => setField(line.productId, 'quantity', event.target.value)}
                      />
                      {error?.quantity && (
                        <p className="field-error" role="alert">
                          {text.errors[error.quantity]}
                        </p>
                      )}
                    </div>

                    <div className="field">
                      <label className="field-label" htmlFor={`pprice-${line.productId}`}>
                        {text.form.priceLabel.replace('{unit}', unit)}
                      </label>
                      <input
                        id={`pprice-${line.productId}`}
                        className="text-input"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={line.price}
                        aria-label={text.form.priceAria.replace('{name}', name)}
                        aria-invalid={error?.price ? true : undefined}
                        onChange={(event) => setField(line.productId, 'price', event.target.value)}
                      />
                      {error?.price && (
                        <p className="field-error" role="alert">
                          {text.errors[error.price]}
                        </p>
                      )}
                    </div>

                    <div className="value-box">
                      <span className="mini-label">{text.form.lineTotal}</span>
                      <span className="mini-value">
                        {lineTotal === null ? '-' : formatRupeesExact(lineTotal)}
                      </span>
                    </div>
                  </div>

                  <p className="field-hint">
                    {stockNow === undefined
                      ? text.form.stockNotRecorded
                      : text.form.stockNow
                          .replace('{qty}', formatQuantity(stockNow))
                          .replace('{unit}', unit)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}

        {formErrors.noItems && (
          <p className="field-error" role="alert">
            {text.errors.noItems}
          </p>
        )}

        <div className="total-bar" aria-live="polite">
          <span>{text.form.grandTotal}</span>
          <strong>{formatRupeesExact(grandTotal)}</strong>
        </div>
      </section>

      <section className="form-card" aria-labelledby="purchase-search-heading">
        <h2 className="section-title" id="purchase-search-heading">
          {text.form.searchLabel}
        </h2>
        {products.length === 0 ? (
          <p className="empty-state">{text.form.noProductsAtAll}</p>
        ) : (
          <>
            <input
              className="text-input"
              type="search"
              value={query}
              placeholder={text.form.searchPlaceholder}
              aria-label={text.form.searchLabel}
              autoComplete="off"
              onChange={(event) => setQuery(event.target.value)}
            />
            {matches.length === 0 ? (
              <p className="field-hint">{text.form.noMatch.replace('{query}', query.trim())}</p>
            ) : (
              <ul className="pick-list">
                {matches.slice(0, MAX_RESULTS).map((product) => {
                  const added = inCart.has(product.id);
                  const stockNow = stock.get(product.id);
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        className="pick-button"
                        disabled={added}
                        onClick={() => addProduct(product)}
                      >
                        <span className="pick-name">{product.name}</span>
                        <span className="pick-meta">
                          {product.purchasePrice === null
                            ? ''
                            : `${formatRupeesExact(product.purchasePrice)} / ${unitName(product)} · `}
                          {stockNow === undefined
                            ? text.form.stockNotRecorded
                            : text.form.stockNow
                                .replace('{qty}', formatQuantity(stockNow))
                                .replace('{unit}', unitName(product))}
                        </span>
                        {added && <span className="pick-reason">{text.form.inPurchase}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {matches.length > MAX_RESULTS && <p className="field-hint">{text.form.moreResults}</p>}
          </>
        )}
      </section>

      <section className="form-card" aria-labelledby="purchase-supplier-heading">
        <h2 className="section-title" id="purchase-supplier-heading">
          {text.form.supplierTitle}
        </h2>
        <div className="field-row">
          <div className="field">
            <label className="field-label" htmlFor="supplier-name">
              {text.form.supplierName}
            </label>
            <input
              id="supplier-name"
              className="text-input"
              type="text"
              autoComplete="off"
              value={supplierName}
              aria-invalid={formErrors.nameTooLong ? true : undefined}
              onChange={(event) => setSupplierName(event.target.value)}
            />
            {formErrors.nameTooLong && (
              <p className="field-error" role="alert">
                {text.errors.nameTooLong}
              </p>
            )}
          </div>
          <div className="field">
            <label className="field-label" htmlFor="supplier-phone">
              {text.form.supplierPhone}
            </label>
            <input
              id="supplier-phone"
              className="text-input"
              type="text"
              inputMode="tel"
              autoComplete="off"
              value={supplierPhone}
              aria-invalid={formErrors.phoneInvalid ? true : undefined}
              onChange={(event) => setSupplierPhone(event.target.value)}
            />
            <p className="field-hint">{text.form.phoneHint}</p>
            {formErrors.phoneInvalid && (
              <p className="field-error" role="alert">
                {text.errors.phoneInvalid}
              </p>
            )}
          </div>
        </div>
      </section>

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
