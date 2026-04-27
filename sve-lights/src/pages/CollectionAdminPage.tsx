import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../context/useAuth';
import {
  createCollectionRequest,
  deleteCollectionRequest,
  fetchCollectionsRequest,
  updateCollectionRequest,
  type CollectionInput,
} from '../services/collections';
import type { CollectionItem } from '../types';
import './pages.css';

const emptyForm = {
  productName: '',
  description: '',
  price: '',
  image: '',
  category: '',
  marketplace: '',
  productUrl: '',
  stock: '0',
};

const CollectionAdminPage = () => {
  const { token } = useAuth();
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [formState, setFormState] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetchCollectionsRequest('?page=1&limit=100');
      setCollections(response.collections ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load collections.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCollections();
  }, []);

  const resetForm = () => {
    setFormState(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    const payload: CollectionInput = {
      productName: formState.productName.trim(),
      description: formState.description.trim(),
      price: Number(formState.price),
      image: formState.image.trim(),
      category: formState.category.trim(),
      marketplace: formState.marketplace.trim(),
      productUrl: formState.productUrl.trim(),
      stock: Number.parseInt(formState.stock, 10),
    };

    try {
      setIsSubmitting(true);
      setError('');
      setSuccess('');

      if (editingId) {
        await updateCollectionRequest(editingId, payload, token);
        setSuccess('Collection updated successfully.');
      } else {
        await createCollectionRequest(payload, token);
        setSuccess('Collection created successfully.');
      }

      resetForm();
      await loadCollections();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save collection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: CollectionItem) => {
    setEditingId(item.id);
    setFormState({
      productName: item.productName,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      marketplace: item.marketplace,
      productUrl: item.productUrl,
      stock: String(item.stock),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (item: CollectionItem) => {
    if (!token) {
      return;
    }

    if (!window.confirm(`Delete collection "${item.productName}"?`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await deleteCollectionRequest(item.id, token);
      setSuccess('Collection deleted successfully.');
      if (editingId === item.id) {
        resetForm();
      }
      await loadCollections();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete collection.');
    }
  };

  return (
    <div className="page">
      <section className="heroPanel">
        <span className="eyebrow">Collections Admin</span>
        <h1>Manage public collections from a separate admin-only page.</h1>
        <p>Users can view collections on the website, but only admins can add, update, or delete them.</p>
      </section>

      {error ? <div className="stateCard errorCard">{error}</div> : null}
      {success ? <div className="stateCard successCard">{success}</div> : null}

      <section className="formPanel">
        <h2>{editingId ? 'Edit collection' : 'Add collection'}</h2>

        <form className="adminForm" onSubmit={handleSubmit}>
          <div className="adminGrid">
            <label className="fieldGroup">
              <span>Product name</span>
              <input
                value={formState.productName}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, productName: event.target.value }))
                }
                required
              />
            </label>

            <label className="fieldGroup">
              <span>Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formState.price}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, price: event.target.value }))
                }
                required
              />
            </label>
          </div>

          <label className="fieldGroup">
            <span>Description</span>
            <textarea
              rows={4}
              value={formState.description}
              onChange={(event) =>
                setFormState((current) => ({ ...current, description: event.target.value }))
              }
              required
            />
          </label>

          <div className="adminGrid">
            <label className="fieldGroup">
              <span>Image URL</span>
              <input
                type="url"
                value={formState.image}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, image: event.target.value }))
                }
                required
              />
            </label>

            <label className="fieldGroup">
              <span>Stock</span>
              <input
                type="number"
                min="0"
                step="1"
                value={formState.stock}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, stock: event.target.value }))
                }
                required
              />
            </label>
          </div>

          <div className="adminGrid">
            <label className="fieldGroup">
              <span>Category</span>
              <input
                value={formState.category}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, category: event.target.value }))
                }
              />
            </label>

            <label className="fieldGroup">
              <span>Marketplace</span>
              <input
                value={formState.marketplace}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, marketplace: event.target.value }))
                }
              />
            </label>
          </div>

          <label className="fieldGroup">
            <span>Product URL</span>
            <input
              type="url"
              value={formState.productUrl}
              onChange={(event) =>
                setFormState((current) => ({ ...current, productUrl: event.target.value }))
              }
            />
          </label>

          <div className="formActions">
            <button className="primaryButton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingId ? 'Update collection' : 'Add collection'}
            </button>
            {editingId ? (
              <button className="toggleButton" type="button" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {isLoading ? <div className="stateCard">Loading collections...</div> : null}

      {!isLoading ? (
        <section className="adminList">
          {collections.length === 0 ? (
            <div className="stateCard">Out of stock right now. No collections are available.</div>
          ) : (
            collections.map((item) => (
              <article key={item.id} className="adminCard">
                <div className="adminCardImage">
                  <img src={item.image} alt={item.productName} />
                </div>
                <div className="adminCardBody">
                  <div className="adminCardTop">
                    <div>
                      <span className="eyebrow">{item.category || 'Collection'}</span>
                      <h3>{item.productName}</h3>
                    </div>
                    <span className={item.stock > 0 ? 'statusBadge statusGreen' : 'statusBadge statusRed'}>
                      {item.stockStatus}
                    </span>
                  </div>
                  <p>{item.description}</p>
                  <div className="adminMeta">
                    <span>Price: Rs. {item.price}</span>
                    <span>Stock: {item.stock}</span>
                    <span>Marketplace: {item.marketplace || 'Not set'}</span>
                  </div>
                  <div className="formActions">
                    <button className="toggleButton" type="button" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className="dangerInlineButton" type="button" onClick={() => handleDelete(item)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      ) : null}
    </div>
  );
};

export default CollectionAdminPage;
