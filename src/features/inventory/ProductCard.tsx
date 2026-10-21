import type { Product } from '../../db';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatQuantity, formatRupeesExact } from '../../utils/formatCurrency';

interface ProductCardProps {
  product: Product;
  /** undefined = no stock has been recorded for this product. */
  stockQuantity: number | undefined;
  onEdit: () => void;
  onEditStock: () => void;
}

export function ProductCard({ product, stockQuantity, onEdit, onEditStock }: ProductCardProps) {
  const { t } = useLanguage();
  const card = t.inventory.card;
  const unitText = t.inventory.units[product.unit];

  const price = (amount: number | null) =>
    amount === null ? card.notSet : formatRupeesExact(amount);

  return (
    <article className="product-card">
      <div className="product-head">
        <h3 className="product-name">{product.name}</h3>
        <button
          type="button"
          className="edit-button"
          onClick={onEdit}
          aria-label={card.editAria.replace('{name}', product.name)}
        >
          {card.edit}
        </button>
      </div>

      <p className="product-meta">
        <span>
          {card.category}: <strong>{product.category || card.noCategory}</strong>
        </span>
        <span>
          {card.unit}: <strong>{unitText}</strong>
        </span>
      </p>

      <dl className="value-grid">
        <div className="value-box">
          <dt>{card.purchasePrice}</dt>
          <dd>{price(product.purchasePrice)}</dd>
        </div>
        <div className="value-box">
          <dt>{card.sellingPrice}</dt>
          <dd>{price(product.sellingPrice)}</dd>
        </div>
        <div className="value-box wide">
          <dt>{card.stock}</dt>
          <dd>
            {stockQuantity === undefined
              ? card.stockNotRecorded
              : `${formatQuantity(stockQuantity)} ${unitText}`}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        className="secondary-button stock-button"
        onClick={onEditStock}
        aria-label={`${t.inventory.stock.buttonAria.replace('{name}', product.name)}: ${
          stockQuantity === undefined
            ? t.inventory.stock.enterButton
            : t.inventory.stock.changeButton
        }`}
      >
        {stockQuantity === undefined
          ? t.inventory.stock.enterButton
          : t.inventory.stock.changeButton}
      </button>
    </article>
  );
}
