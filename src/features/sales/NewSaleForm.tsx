import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { createSale, SaleError } from '../../db';
import type { CustomerSummary, Product, Sale } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatQuantity, formatRupeesExact } from '../../utils/formatCurrency';
import { filterCustomers } from '../customers/customerHelpers';
import { filterProducts } from '../inventory/productHelpers';
import {
  computeGrandTotal,
  computeLine,
  MAX_CUSTOMER_NAME_LENGTH,
  normalizePhone,
  validateCart,
  type CartLine,
  type LineError,
  type LineErrors,
} from './saleHelpers';

interface NewSaleFormProps {
  products: readonly Product[];
  /** productId -> quantity in stock. A missing product has no stock. */
  stock: ReadonlyMap<string, number>;
  /** Saved customers (with balances) that this sale can be linked to. */
  customers: readonly CustomerSummary[];
  onSaved: (sale: Sale) => void;
  onCancel: () => void;
  /** Called when the database says stock differs from what the screen showed. */
  onStockOutdated: () => void;
}

type FormErrorKey = 'noItems' | 'phoneInvalid' | 'nameTooLong';
type SaveErrorKey = 'storageFull' | 'saveFailed' | 'customerMissing';

const MAX_RESULTS = 8;

export function NewSaleForm({
  products,
  stock,
  customers,
  onSaved,
  onCancel,
  onStockOutdated,
}: NewSaleFormProps) {
  const { t } = useLanguage();
  const text = t.sales;
  const unitName = (product: Product) => t.inventory.units[product.unit];

  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isCredit, setIsCredit] = useState(true);
  const [customerQuery, setCustomerQuery] = useState('');
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
  const grandTotal = useMemo(
    () => computeGrandTotal(cart, productById),
    [cart, productById],
  );
  const selectedCustomer = customers.find((item) => item.customer.id === selectedCustomerId);
  const customerMatches = useMemo(
    () => filterCustomers(customers, customerQuery).slice(0, 5),
    [customers, customerQuery],
  );
  const inCart = useMemo(() => new Set(cart.map((line) => line.productId)), [cart]);

  // After adding a product, jump to its quantity box (this also scrolls to it).
  useEffect(() => {
    if (!focusId) return;
    const input = document.getElementById(`qty-${focusId}`) as HTMLInputElement | null;
    input?.focus();
    input?.select();
    setFocusId(null);
  }, [focusId, cart]);

  function addProduct(product: Product) {
    setSaveError(null);
    if (!inCart.has(product.id)) {
      setCart((current) => [...current, { productId: product.id, quantity: '1' }]);
    }
    setQuery('');
    setFocusId(product.id);
  }

  function setQuantity(productId: string, quantity: string) {
    setCart((current) =>
      current.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
    );
    // Clear the old message for this row; it is checked again on Save.
    setLineErrors((current) => {
      if (!current[productId]) return current;
      const { [productId]: _removed, ...rest } = current;
      return rest;
    });
  }

  function removeLine(productId: string) {
    setCart((current) => current.filter((line) => line.productId !== productId));
    setLineErrors((current) => {
      const { [productId]: _removed, ...rest } = current;
      return rest;
    });
  }

  function lineMessage(error: LineError, product: Product | undefined): string {
    if (error.key === 'insufficientStock') {
      return text.errors.insufficientStock
        .replace('{available}', formatQuantity(error.available ?? 0))
        .replace('{unit}', product ? unitName(product) : '');
    }
    return text.errors[error.key];
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaveError(null);

    const nextFormErrors: Partial<Record<FormErrorKey, true>> = {};
    if (cart.length === 0) nextFormErrors.noItems = true;
    // With a saved customer chosen, the typed name/phone boxes are hidden and unused.
    const linked = selectedCustomer !== undefined;
    const phone = linked ? ({ ok: true, value: '' } as const) : normalizePhone(customerPhone);
    if (!phone.ok) nextFormErrors.phoneInvalid = true;
    const name = linked ? '' : customerName.trim().replace(/\s+/g, ' ');
    if (name.length > MAX_CUSTOMER_NAME_LENGTH) nextFormErrors.nameTooLong = true;

    const cartCheck = validateCart(cart, productById, stock);
    setLineErrors(cartCheck.ok ? {} : cartCheck.errors);
    setFormErrors(nextFormErrors);

    if (!cartCheck.ok || Object.keys(nextFormErrors).length > 0 || !phone.ok) {
      return;
    }

    setSaving(true);
    try {
      const sale = await createSale({
        customerName: name,
        customerPhone: phone.value,
        customerId: selectedCustomer?.customer.id,
        isCredit: selectedCustomer ? isCredit : undefined,
        lines: cartCheck.lines,
      });
      onSaved(sale);
    } catch (error) {
      console.error('Could not save sale', error);
      setSaving(false);
      if (error instanceof SaleError && error.code === 'customerMissing') {
        setSaveError('customerMissing');
        return;
      }
      if (error instanceof SaleError && error.productId) {
        // The database is the final judge: show its reason on the right row.
        const key =
          error.code === 'insufficientStock'
            ? 'insufficientStock'
            : error.code === 'priceMissing'
              ? 'priceMissing'
              : error.code === 'productMissing'
                ? 'productMissing'
                : 'quantityInvalid';
        setLineErrors({
          [error.productId]: { key, available: error.available },
        });
        if (error.code === 'insufficientStock') onStockOutdated();
        return;
      }
      setSaveError(
        error instanceof Error && error.name === 'QuotaExceededError'
          ? 'storageFull'
          : 'saveFailed',
      );
    }
  }

  const hasErrors =
    Object.keys(lineErrors).length > 0 || Object.keys(formErrors).length > 0;

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

      <section className="form-card" aria-labelledby="sale-items-heading">
        <h2 className="section-title" id="sale-items-heading">
          {text.form.itemsTitle}
        </h2>

        {cart.length === 0 ? (
          <p className="empty-state">{text.form.noItems}</p>
        ) : (
          <ul className="cart-list">
            {cart.map((line) => {
              const product = productById.get(line.productId);
              const error = lineErrors[line.productId];
              const { lineTotal } = computeLine(line, product);
              const name = product?.name ?? '?';
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

                  <div className="cart-fields">
                    <div className="field">
                      <label className="field-label" htmlFor={`qty-${line.productId}`}>
                        {text.form.quantityLabel}
                        {product ? ` (${unitName(product)})` : ''}
                      </label>
                      <input
                        id={`qty-${line.productId}`}
                        className="text-input"
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={line.quantity}
                        aria-label={text.form.quantityAria.replace('{name}', name)}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? `qty-${line.productId}-error` : undefined}
                        onChange={(event) => setQuantity(line.productId, event.target.value)}
                      />
                    </div>
                    <div className="value-box">
                      <span className="mini-label">{text.form.priceLabel}</span>
                      <span className="mini-value">
                        {product && product.sellingPrice !== null
                          ? formatRupeesExact(product.sellingPrice)
                          : '-'}
                      </span>
                    </div>
                    <div className="value-box">
                      <span className="mini-label">{text.form.lineTotal}</span>
                      <span className="mini-value">
                        {lineTotal === null ? '-' : formatRupeesExact(lineTotal)}
                      </span>
                    </div>
                  </div>

                  {product && (
                    <p className="field-hint">
                      {text.form.available
                        .replace('{qty}', formatQuantity(stock.get(product.id) ?? 0))
                        .replace('{unit}', unitName(product))}
                    </p>
                  )}
                  {error && (
                    <p className="field-error" id={`qty-${line.productId}-error`} role="alert">
                      {lineMessage(error, product)}
                    </p>
                  )}
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

      <section className="form-card" aria-labelledby="sale-search-heading">
        <h2 className="section-title" id="sale-search-heading">
          {text.form.searchLabel}
        </h2>
        {products.length === 0 ? (
          <p className="empty-state">{text.form.noProductsAtAll}</p>
        ) : (
          <>
            <input
              id="sale-search"
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
                  const quantity = stock.get(product.id) ?? 0;
                  const reason =
                    product.sellingPrice === null
                      ? text.form.noPrice
                      : quantity <= 0
                        ? text.form.outOfStock
                        : inCart.has(product.id)
                          ? text.form.inSale
                          : null;
                  const blocked = product.sellingPrice === null || quantity <= 0;
                  return (
                    <li key={product.id}>
                      <button
                        type="button"
                        className="pick-button"
                        disabled={blocked}
                        onClick={() => addProduct(product)}
                      >
                        <span className="pick-name">{product.name}</span>
                        <span className="pick-meta">
                          {product.sellingPrice === null
                            ? ''
                            : `${formatRupeesExact(product.sellingPrice)} / ${unitName(product)}`}
                          {' · '}
                          {text.form.available
                            .replace('{qty}', formatQuantity(quantity))
                            .replace('{unit}', unitName(product))}
                        </span>
                        {reason && <span className="pick-reason">{reason}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {matches.length > MAX_RESULTS && (
              <p className="field-hint">{text.form.moreResults}</p>
            )}
          </>
        )}
      </section>

      <section className="form-card" aria-labelledby="sale-customer-heading">
        <h2 className="section-title" id="sale-customer-heading">
          {text.form.customerTitle}
        </h2>

        {selectedCustomer ? (
          <>
            <div className="customer-picked">
              <p className="product-name">{selectedCustomer.customer.name}</p>
              {selectedCustomer.customer.phone && (
                <p className="product-meta">{selectedCustomer.customer.phone}</p>
              )}
              <p className="field-hint">
                {text.form.balanceNow.replace(
                  '{balance}',
                  formatRupeesExact(selectedCustomer.outstanding),
                )}
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSelectedCustomerId(null)}
              >
                {text.form.change}
              </button>
            </div>

            <div className="field">
              <span className="field-label" id="pay-type-label">
                {text.form.payTypeLabel}
              </span>
              <div className="chip-row" role="radiogroup" aria-labelledby="pay-type-label">
                <button
                  type="button"
                  role="radio"
                  className="chip"
                  aria-checked={isCredit}
                  onClick={() => setIsCredit(true)}
                >
                  {text.form.payCredit}
                </button>
                <button
                  type="button"
                  role="radio"
                  className="chip"
                  aria-checked={!isCredit}
                  onClick={() => setIsCredit(false)}
                >
                  {text.form.payCash}
                </button>
              </div>
            </div>

            {isCredit ? (
              <p className="credit-note" role="status">
                {text.form.creditNote
                  .replace('{amount}', formatRupeesExact(grandTotal))
                  .replace('{name}', selectedCustomer.customer.name)}
              </p>
            ) : (
              <p className="cash-note" role="status">
                {text.form.cashNote}
              </p>
            )}
          </>
        ) : (
          <>
            {customers.length > 0 && (
              <div className="field">
                <label className="field-label" htmlFor="customer-pick">
                  {text.form.pickLabel}
                </label>
                <input
                  id="customer-pick"
                  className="text-input"
                  type="search"
                  value={customerQuery}
                  placeholder={text.form.pickPlaceholder}
                  autoComplete="off"
                  onChange={(event) => setCustomerQuery(event.target.value)}
                />
                {customerMatches.length === 0 ? (
                  <p className="field-hint">
                    {text.form.pickNone.replace('{query}', customerQuery.trim())}
                  </p>
                ) : (
                  <ul className="pick-list">
                    {customerMatches.map(({ customer, outstanding }) => (
                      <li key={customer.id}>
                        <button
                          type="button"
                          className="pick-button"
                          onClick={() => {
                            setSelectedCustomerId(customer.id);
                            setIsCredit(true);
                            setCustomerQuery('');
                          }}
                        >
                          <span className="pick-name">{customer.name}</span>
                          <span className="pick-meta">
                            {customer.phone ? `${customer.phone} · ` : ''}
                            {text.form.balanceNow.replace('{balance}', formatRupeesExact(outstanding))}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="field-hint">{text.form.orTypeName}</p>
              </div>
            )}

            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="customer-name">
                  {text.form.customerName}
                </label>
                <input
                  id="customer-name"
                  className="text-input"
                  type="text"
                  autoComplete="off"
                  value={customerName}
                  aria-invalid={formErrors.nameTooLong ? true : undefined}
                  onChange={(event) => setCustomerName(event.target.value)}
                />
                {formErrors.nameTooLong && (
                  <p className="field-error" role="alert">
                    {text.errors.nameTooLong}
                  </p>
                )}
              </div>
              <div className="field">
                <label className="field-label" htmlFor="customer-phone">
                  {text.form.customerPhone}
                </label>
                <input
                  id="customer-phone"
                  className="text-input"
                  type="text"
                  inputMode="tel"
                  autoComplete="off"
                  value={customerPhone}
                  aria-invalid={formErrors.phoneInvalid ? true : undefined}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                />
                <p className="field-hint">{text.form.phoneHint}</p>
                {formErrors.phoneInvalid && (
                  <p className="field-error" role="alert">
                    {text.errors.phoneInvalid}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </section>

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
