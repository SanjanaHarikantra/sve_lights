import React, { useEffect, useMemo, useState } from 'react';
import styles from './Collection.module.css';
import { fetchProducts } from '../../services/products';
import type { CollectionItem, Product } from '../../types';

const mapProductToCollectionItem = (product: Product): CollectionItem => ({
  id: product.id,
  productName: product.name,
  description: product.description,
  price: product.price.toFixed(2),
  image: product.imageUrl.startsWith('http') ? product.imageUrl : `/${product.imageUrl}`,
  category: product.category || 'General',
  marketplace: 'SVE Lights',
  productUrl: `/products/${product.id}`,
  stock: product.stock,
  stockStatus: product.stockStatus,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt ?? product.createdAt,
});

const Collection: React.FC = () => {
  const [allCollections, setAllCollections] = useState<CollectionItem[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedType, setAppliedType] = useState('all');

  const selectedCollection = useMemo(
    () => allCollections.find((item) => item.id === selectedCollectionId) ?? null,
    [allCollections, selectedCollectionId]
  );

  const typeOptions = useMemo(() => ['all', ...categories], [categories]);

  const filteredCollections = useMemo(() => {
    const normalizedSearch = appliedSearch.trim().toLowerCase();

    return allCollections.filter((item) => {
      const matchesType = appliedType === 'all' || item.category === appliedType;
      const matchesSearch =
        !normalizedSearch ||
        item.productName.toLowerCase().includes(normalizedSearch) ||
        item.description.toLowerCase().includes(normalizedSearch) ||
        item.marketplace.toLowerCase().includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [allCollections, appliedSearch, appliedType]);

  const paginatedCollections = useMemo(() => {
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    return filteredCollections.slice(start, start + pageSize);
  }, [filteredCollections, page]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const products = await fetchProducts();
        const collectionItems = products.map(mapProductToCollectionItem);
        const uniqueCategories = [...new Set(collectionItems.map((item) => item.category).filter(Boolean))];

        setAllCollections(collectionItems);
        setCategories(uniqueCategories);
      } catch (error) {
        setAllCollections([]);
        setCategories([]);
        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to fetch products right now.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCollections();
  }, []);

  useEffect(() => {
    const pageSize = 12;
    setHasMore(page * pageSize < filteredCollections.length);
  }, [filteredCollections, page]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredCollections.length / 12));
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filteredCollections.length, page]);

  useEffect(() => {
    if (!selectedCollection) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedCollectionId(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [selectedCollection]);

  const handleApplyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedType(selectedType);
    setAppliedSearch(searchInput);
    setPage(1);
    setSelectedCollectionId(null);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedType('all');
    setAppliedSearch('');
    setAppliedType('all');
    setPage(1);
    setSelectedCollectionId(null);
  };

  return (
    <section id="collections" className={styles.section}>
      <div className={styles.header}>
        <div className={styles.curatedLine}>
          <div className={styles.smallLine}></div>
          <span>COLLECTIONS</span>
          <div className={styles.smallLine}></div>
        </div>
        <h2 className={styles.mainHeading}>
          Product <span className={styles.purpleText}>Collections</span>
        </h2>
      </div>

      <div className={styles.managementShell}>
        <div className={styles.listPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelEyebrow}>View Collections</span>
      
          </div>

          <form className={styles.filterBar} onSubmit={handleApplyFilters}>
            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Product Type</span>
              <select
                className={styles.filterSelect}
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterField}>
              <span className={styles.filterLabel}>Search Product</span>
              <input
                className={styles.filterInput}
                type="text"
                placeholder="Search by name, description, or marketplace"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </label>

            <div className={styles.filterActions}>
              <button type="submit" className={styles.primaryButton}>
                Search
              </button>
              <button type="button" className={styles.secondaryButton} onClick={handleResetFilters}>
                Reset
              </button>
            </div>
          </form>

          <div className={styles.grid}>
            {isLoading ? <div className={styles.emptyState}>Loading collections...</div> : null}

            {!isLoading && errorMessage ? (
              <div className={styles.emptyState}>Failed to load collections: {errorMessage}</div>
            ) : null}

            {!isLoading && !errorMessage && paginatedCollections.length === 0 ? (
              <div className={styles.emptyState}>Out of stock right now. No collections are available.</div>
            ) : null}

            {!isLoading &&
              !errorMessage &&
              paginatedCollections.map((item) => (
                <article key={item.id} className={styles.card}>
                  <div className={styles.imageWrapper}>
                    <img src={item.image} alt={item.productName} />
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.cardCategory}>{item.category}</span>
                    <span
                      className={`${styles.stockBadge} ${
                        item.stock > 0 ? styles.inStockBadge : styles.outOfStockBadge
                      }`}
                    >
                      {item.stockStatus}
                    </span>
                    <h3>{item.productName}</h3>
                    <p>{item.description}</p>
                    {item.stock > 0 && item.stock <= 5 ? (
                      <span className={styles.lowStockText}>Only {item.stock} items left</span>
                    ) : null}
                    <div className={styles.cardFooter}>
                      <span className={styles.priceTag}>Rs. {item.price}</span>
                      <button
                        type="button"
                        className={styles.viewDetails}
                        onClick={() => setSelectedCollectionId(item.id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          </div>

          {!isLoading && !errorMessage && filteredCollections.length > 0 ? (
            <div className={styles.paginationBar}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className={styles.pageInfo}>Page {page}</span>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setPage((current) => current + 1)}
                disabled={!hasMore}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {selectedCollection && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedCollectionId(null)}
          role="presentation"
        >
          <div
            className={styles.modalCard}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-details-title"
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setSelectedCollectionId(null)}
              aria-label="Close collection details"
            >
              Close
            </button>

            <div className={styles.modalImageWrapper}>
              <img src={selectedCollection.image} alt={selectedCollection.productName} />
            </div>

            <div className={styles.modalContent}>
              <span className={styles.modalEyebrow}>{selectedCollection.category}</span>
              <h3 id="collection-details-title" className={styles.modalTitle}>
                {selectedCollection.productName}
              </h3>
              <p className={styles.modalDescription}>{selectedCollection.description}</p>

              <div className={styles.modalSpecs}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Product Name</span>
                  <span className={styles.specValue}>{selectedCollection.productName}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Price</span>
                  <span className={styles.specValue}>Rs. {selectedCollection.price}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Image URL</span>
                  <span className={styles.specValue}>{selectedCollection.image}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Stock</span>
                  <span className={styles.specValue}>
                    {selectedCollection.stockStatus} ({selectedCollection.stock})
                  </span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Marketplace</span>
                  <span className={styles.specValue}>{selectedCollection.marketplace || 'Not set'}</span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Product Link</span>
                  <span className={styles.specValue}>
                    {selectedCollection.productUrl ? (
                      <a href={selectedCollection.productUrl} target="_blank" rel="noreferrer">
                        {selectedCollection.productUrl}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Collection;
