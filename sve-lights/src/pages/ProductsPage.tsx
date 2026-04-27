import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import { fetchProducts } from '../services/products';
import type { Product } from '../types';
import './pages.css';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

    void loadProducts();
  }, []);

  return (
    <div className="page">
      <section className="heroPanel">
        <span className="eyebrow">Product Catalog</span>
        <h1>Lighting products with live stock visibility and role-based management.</h1>
        <p>
          Browse all products, check stock status instantly, and use the admin dashboard for secure
          product management.
        </p>
      </section>

      {isLoading ? <div className="stateCard">Loading products...</div> : null}
      {error ? <div className="stateCard errorCard">{error}</div> : null}

      {!isLoading && !error ? (
        <section className="productGrid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      ) : null}
    </div>
  );
};

export default ProductsPage;
