import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProduct } from '../services/products';
import type { Product } from '../types';
import './pages.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Missing product id.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        setProduct(await fetchProduct(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load product.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  if (isLoading) {
    return <div className="stateCard">Loading product details...</div>;
  }

  if (error || !product) {
    return <div className="stateCard errorCard">{error || 'Product not found.'}</div>;
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="page">
      <Link className="backLink" to="/">
        Back to products
      </Link>

      <section className="detailsGrid">
        <div className="detailsImageCard">
          <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `/${product.imageUrl}`} alt={product.name} />
        </div>

        <div className="detailsContent">
          <span className={`statusBadge ${isOutOfStock ? 'statusRed' : 'statusGreen'}`}>
            {product.stockStatus}
          </span>
          <h1>{product.name}</h1>
          <p className="detailsPrice">Rs. {product.price.toFixed(2)}</p>
          <p className="detailsDescription">{product.description}</p>
          <div className="infoList">
            <span>Current stock: {product.stock}</span>
            {product.lowStockMessage ? <span>{product.lowStockMessage}</span> : null}
            <span>Created: {new Date(product.createdAt).toLocaleString()}</span>
          </div>
          <button className="primaryButton" type="button" disabled={isOutOfStock}>
            {isOutOfStock ? 'Out of Stock' : 'Buy now'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailsPage;
