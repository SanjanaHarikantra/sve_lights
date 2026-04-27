import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';
import type { Product } from '../../types';

type ProductCardProps = {
  product: Product;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
};

const ProductCard = ({ product, isAdmin = false, onDelete, onEdit }: ProductCardProps) => {
  const isOutOfStock = product.stock === 0;

  const imageSrc = product.imageUrl.startsWith('http') ? product.imageUrl : `/${product.imageUrl}`;

  return (
    <article className={styles.card}>
      <img className={styles.image} src={imageSrc} alt={product.name} />

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{product.name}</h3>
          <span className={styles.price}>Rs. {product.price.toFixed(2)}</span>
        </div>

        <p className={styles.description}>{product.description}</p>

        <div className={styles.statusRow}>
          <span
            className={`${styles.status} ${
              isOutOfStock ? styles.statusOutOfStock : styles.statusInStock
            }`}
          >
            {product.stockStatus}
          </span>

          <span>Stock: {product.stock}</span>
        </div>

        {product.lowStockMessage ? <span className={styles.lowStock}>{product.lowStockMessage}</span> : null}

        <div className={styles.actions}>
          <Link className={styles.secondaryAction} to={`/products/${product.id}`}>
            View details
          </Link>
          <button
            type="button"
            className={`${styles.primaryAction} ${isOutOfStock ? styles.disabled : ''}`}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Unavailable' : 'Buy now'}
          </button>
          {isAdmin ? (
            <>
              <button type="button" className={styles.secondaryAction} onClick={() => onEdit?.(product)}>
                Edit
              </button>
              <button type="button" className={styles.dangerAction} onClick={() => onDelete?.(product)}>
                Delete
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
