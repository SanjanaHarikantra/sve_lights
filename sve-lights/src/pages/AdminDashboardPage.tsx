import { useEffect, useState } from 'react';
import { fetchProducts } from '../services/products';
import type { Product } from '../types';
import './pages.css';

const AdminDashboardPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prods = await fetchProducts();
        setProducts(prods);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const inStockCount = products.filter((product) => product.stock > 0).length;
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 5).length;

  if (isLoading) return <div className="stateCard">Loading dashboard...</div>;

  return (
    <div className="page adminPage">
      <section className="heroPanel adminHero">
        <span className="eyebrow">Dashboard</span>
        <h1>Run the catalog with the same premium feel as the storefront.</h1>
        <p>
          Keep inventory tidy, watch low-stock items, and jump quickly into product or collection
          updates without switching to a different-looking admin system.
        </p>
      </section>

      <section className="adminStatGrid">
        <article className="adminStatCard">
          <span className="adminStatLabel">Total products</span>
          <strong>{products.length}</strong>
          <p>All catalog items currently available in the store.</p>
        </article>
        <article className="adminStatCard">
          <span className="adminStatLabel">In stock</span>
          <strong>{inStockCount}</strong>
          <p>Products customers can browse and purchase right now.</p>
        </article>
        <article className="adminStatCard">
          <span className="adminStatLabel">Low stock</span>
          <strong>{lowStockCount}</strong>
          <p>Items with 5 units or fewer that may need attention soon.</p>
        </article>
      </section>

      <section className="adminSpotlightPanel">
        <div>
          <span className="eyebrow">Quick focus</span>
          <h2>Keep the admin experience consistent and calm.</h2>
          <p>
            The admin panel now follows the same visual language as the homepage: warm surfaces,
            rounded cards, accent buttons, and softer spacing.
          </p>
        </div>
        <div className="adminMiniList">
          <div className="adminMiniItem">
            <span>Catalog tone</span>
            <strong>Aligned with home UI</strong>
          </div>
          <div className="adminMiniItem">
            <span>Management flow</span>
            <strong>Products and collections in one place</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
