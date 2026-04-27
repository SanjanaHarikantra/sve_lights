import { useEffect, useMemo, useState, type FormEvent } from 'react';
import ProductForm from '../components/ProductForm/ProductForm';
import { useAuth } from '../context/useAuth';
import {
  createProductRequest,
  deleteProductRequest,
  fetchProducts,
  updateProductRequest,
  type ProductInput,
} from '../services/products';
import type { Product } from '../types';
import './pages.css';

const AdminProductsPage = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productPendingDelete, setProductPendingDelete] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      setProducts(await fetchProducts());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const closeProductModal = () => {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmit = async (payload: ProductInput) => {
    if (!token) {
      setError('Please log in again as admin before saving products.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      if (selectedProduct) {
        await updateProductRequest(selectedProduct.id, payload, token);
        setSuccess('Product updated successfully.');
      } else {
        await createProductRequest(payload, token);
        setSuccess('Product created successfully.');
      }

      await loadProducts();
      setIsModalOpen(false);
      setSelectedProduct(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setError('');
    setSuccess('');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setError('');
    setSuccess('');
    setProductPendingDelete(product);
  };

  const handleDeleteConfirm = async () => {
    if (!token) {
      setError('Please log in again as admin before deleting products.');
      setProductPendingDelete(null);
      return;
    }

    if (!productPendingDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setError('');
      setSuccess('');
      await deleteProductRequest(productPendingDelete.id, token);
      setSuccess('Product deleted successfully.');
      setProductPendingDelete(null);
      await loadProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete product.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNew = () => {
    setError('');
    setSuccess('');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedSearch(searchInput.trim().toLowerCase());
  };

  const filteredProducts = useMemo(() => {
    if (!appliedSearch) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.category,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(appliedSearch);
    });
  }, [appliedSearch, products]);

  if (isLoading) return <div className="stateCard">Loading products...</div>;

  return (
    <div className="page adminPage">
      <section className="heroPanel adminHero">
        <span className="eyebrow">Products</span>
        {/* <h1>Shape the storefront catalog from a matching admin workspace.</h1>
        <p>
          Add new lighting products, refine descriptions, and keep stock numbers current without
          leaving the same brand atmosphere customers see on the homepage.
        </p> */}
      </section>

      <section className="adminToolbarPanel">
        <div>
          <span className="eyebrow">Catalog actions</span>
          <h2>Manage products beautifully and quickly.</h2>
          <p className="adminMutedText">
            {filteredProducts.length} of {products.length} products shown.
          </p>
        </div>

        <div className="adminToolbarActions">
          <form className="adminSearchForm" onSubmit={handleSearchSubmit}>
            <input
              className="adminSearchInput"
              type="text"
              placeholder="Search by name, description, or category"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <button type="submit" className="toggleButton">
              Search
            </button>
          </form>

          <button
            type="button"
            onClick={handleAddNew}
            className="adminPrimaryButton"
            disabled={isSubmitting || isDeleting}
          >
            Add New Product
          </button>
        </div>
      </section>

      {error ? <div className="stateCard errorCard">{error}</div> : null}
      {success ? <div className="stateCard successCard">{success}</div> : null}

      <section className="adminTableSection">
        <div className="adminTable">
          <div className="adminTableHeader">
            <div className="adminTableCell headerCell">Product</div>
            <div className="adminTableCell headerCell">Price</div>
            <div className="adminTableCell headerCell">Stock</div>
            <div className="adminTableCell headerCell">Category</div>
            <div className="adminTableCell headerCell">Actions</div>
          </div>

          {filteredProducts.map((product) => {
            const imageSrc = product.imageUrl.startsWith('http')
              ? product.imageUrl
              : `/${product.imageUrl}`;

            return (
              <div key={product.id} className="adminTableRow">
                <div className="adminTableCell">
                  <div className="productCell">
                    <img className="cellImage" src={imageSrc} alt={product.name} />
                    <div className="cellContent">
                      <span className="cellName">{product.name}</span>
                      <span className="cellDescription">{product.description}</span>
                    </div>
                  </div>
                </div>

                <div className="adminTableCell">
                  <span className="priceValue">Rs. {product.price.toFixed(2)}</span>
                </div>

                <div className="adminTableCell">
                  <span className={`statusBadge ${product.stock > 0 ? 'statusGreen' : 'statusRed'}`}>
                    {product.stockStatus} ({product.stock})
                  </span>
                </div>

                <div className="adminTableCell">
                  <span className="categoryPill">{product.category}</span>
                </div>

                <div className="adminTableCell">
                  <div className="actionButtons">
                    <button
                      type="button"
                      className="actionBtn updateBtn"
                      onClick={() => handleEdit(product)}
                      disabled={isDeleting}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="actionBtn deleteBtn"
                      onClick={() => handleDeleteClick(product)}
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 ? (
            <div className="adminEmptyState">
              <span className="eyebrow">{products.length === 0 ? 'Empty catalog' : 'No matches'}</span>
              <h3>{products.length === 0 ? 'No products added yet.' : 'No products matched your search.'}</h3>
              <p>
                {products.length === 0
                  ? 'Use the add button above to create the first product in the catalog.'
                  : 'Try a different keyword for name, description, or category.'}
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {isModalOpen && (
        <div
          className="modalOverlay"
          role="presentation"
          onClick={closeProductModal}
        >
          <div
            className="modal productEditorModal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modalHeader">
              <div>
                <span className="eyebrow">Product Editor</span>
                <h2>{selectedProduct ? 'Edit product' : 'Add product'}</h2>
              </div>
              <button
                type="button"
                className="modalCloseBtn"
                onClick={closeProductModal}
                aria-label="Close product form"
              >
                ×
              </button>
            </div>

            <div className="modalContent">
              <ProductForm
                initialProduct={selectedProduct || undefined}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                onCancel={closeProductModal}
              />
            </div>
          </div>
        </div>
      )}

      {productPendingDelete ? (
        <div
          className="modalOverlay"
          role="presentation"
          onClick={() => {
            if (!isDeleting) {
              setProductPendingDelete(null);
            }
          }}
        >
          <div
            className="modal adminDeleteModal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-product-title"
          >
            <div className="modalHeader">
              <div>
                <span className="eyebrow">Delete Product</span>
                <h2 id="delete-product-title">Remove this product?</h2>
              </div>
              <button
                type="button"
                className="modalCloseBtn"
                onClick={() => setProductPendingDelete(null)}
                aria-label="Close delete dialog"
                disabled={isDeleting}
              >
                x
              </button>
            </div>

            <div className="modalContent adminDeleteContent">
              <div className="adminDeletePreview">
                <strong>{productPendingDelete.name}</strong>
                <span>{productPendingDelete.category}</span>
                <span>Stock: {productPendingDelete.stock}</span>
              </div>

              <p className="adminDeleteText">
                This will permanently remove the product from the catalog and admin list.
              </p>

              <div className="adminDeleteActions">
                <button
                  type="button"
                  className="toggleButton"
                  onClick={() => setProductPendingDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="dangerInlineButton"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminProductsPage;
