import { useEffect, useState, type FormEvent } from 'react';
import styles from './ProductForm.module.css';
import type { Product } from '../../types';
import type { ProductInput } from '../../services/products';

type ProductFormProps = {
  initialProduct?: Product | null;
  isSubmitting: boolean;
  onSubmit: (payload: ProductInput) => Promise<void>;
  onCancel?: () => void;
};

const emptyForm = {
  name: '',
  price: '',
  description: '',
  imageUrl: '',
  stock: '0',
  category: 'General',
};

const getInitialFormState = (initialProduct?: Product | null) =>
  initialProduct
    ? {
        name: initialProduct.name,
        price: String(initialProduct.price),
        description: initialProduct.description,
        imageUrl: initialProduct.imageUrl,
        stock: String(initialProduct.stock),
        category: initialProduct.category,
      }
    : emptyForm;

const ProductForm = ({ initialProduct, isSubmitting, onCancel, onSubmit }: ProductFormProps) => {
  const [formState, setFormState] = useState(() => getInitialFormState(initialProduct));
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    setFormState(getInitialFormState(initialProduct));
    setImageLoadFailed(false);
  }, [initialProduct]);

  const previewSrc = formState.imageUrl
    ? formState.imageUrl.startsWith('http')
      ? formState.imageUrl
      : `/${formState.imageUrl}`
    : '';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      name: formState.name.trim(),
      description: formState.description.trim(),
      imageUrl: formState.imageUrl.trim(),
      price: Number(formState.price),
      stock: Number.parseInt(formState.stock, 10),
      category: formState.category.trim() || 'General',
    });

    if (!initialProduct) {
      setFormState(emptyForm);
    }
  };

  return (
    <section className={styles.shell}>
      <div className={styles.formIntro}>
        <span className={styles.eyebrow}>{initialProduct ? 'Edit Product' : 'Add Product'}</span>
        <h3>{initialProduct ? 'Update product details' : 'Create a new product'}</h3>
        {/* <p>Fill in the fields clearly and use a valid image so the catalog card looks polished.</p> */}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.layout}>
          <div className={styles.formColumn}>
            <section className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h4>Product details</h4>
                {/* <p>Enter the main product information clearly and neatly.</p> */}
              </div>

              <div className={styles.grid}>
                <div className={styles.field}>
                  <label htmlFor="name">Product name</label>
                  <input
                    id="name"
                    value={formState.name}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Example: Aurora Pendant Light"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="price">Price</label>
                  <input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formState.price}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, price: event.target.value }))
                    }
                    placeholder="890"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="category">Category</label>
                  <input
                    id="category"
                    value={formState.category}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, category: event.target.value }))
                    }
                    placeholder="General"
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="stock">Stock</label>
                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={formState.stock}
                    onChange={(event) =>
                      setFormState((current) => ({ ...current, stock: event.target.value }))
                    }
                    placeholder="3"
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="imageUrl">Product URL / Image URL</label>
                <input
                  id="imageUrl"
                  type="text"
                  value={formState.imageUrl}
                  onChange={(event) => {
                    setImageLoadFailed(false);
                    setFormState((current) => ({ ...current, imageUrl: event.target.value }));
                  }}
                  placeholder="https://example.com/product.jpg"
                  required
                />
                {/* <small>Paste the product image URL here so the preview and product card can display properly.</small> */}
              </div>

              <div className={styles.field}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={5}
                  value={formState.description}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Write a short and clear product description."
                  required
                />
              </div>
            </section>
          </div>

          <aside className={styles.previewPanel}>
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <span className={styles.previewLabel}>Live Preview</span>
                <span className={styles.previewCategory}>{formState.category || 'General'}</span>
              </div>

              <div className={styles.previewMedia}>
                {previewSrc && !imageLoadFailed ? (
                  <img
                    src={previewSrc}
                    alt="Product preview"
                    onError={() => setImageLoadFailed(true)}
                  />
                ) : (
                  <div className={styles.previewFallback}>Add a valid image to preview the product card.</div>
                )}
              </div>

              <div className={styles.previewBody}>
                <h4>{formState.name.trim() || 'Product name preview'}</h4>
                <p>{formState.description.trim() || 'Your product description will appear here.'}</p>
                <div className={styles.previewMeta}>
                  <span>Rs. {formState.price || '0.00'}</span>
                  <span>Stock: {formState.stock || '0'}</span>
                </div>
              </div>
            </div>

            <div className={styles.tipCard}>
              <h4>Quick tips</h4>
              <ul>
                <li>Use a short product name that is easy to scan.</li>
                <li>Keep the description useful and customer-facing.</li>
                <li>Make sure the image link opens correctly.</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className={styles.actions}>
          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialProduct ? 'Update product' : 'Add product'}
          </button>
          {onCancel ? (
            <button className={styles.cancel} type="button" onClick={onCancel}>
              {initialProduct ? 'Cancel edit' : 'Close'}
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
};

export default ProductForm;
