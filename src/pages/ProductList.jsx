import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data dari API menggunakan useCallback
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // GET request ke NestJS API
      const response = await api.get('/api/v1/products');
      console.log('Data products:', response.data);
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data produk');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data saat komponen pertama kali dirender
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products berdasarkan input search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 1. Conditional Rendering: Loading State
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  // 2. Conditional Rendering: Error State
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={fetchProducts} style={styles.retryButton}>
          Coba Lagi
        </button>
      </div>
    );
  }

  // 3. Conditional Rendering: Success State
  return (
    <div style={styles.container}>
      <h1>Daftar Produk</h1>
      <p>Total produk: {products.length}</p>

      {/* Search Input & Refresh */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="🔍 Cari produk..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={fetchProducts} style={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <p style={styles.noResults}>Tidak ada produk yang cocok dengan pencarian.</p>
      ) : (
        <div style={styles.grid}>
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card" style={styles.card}>
              <h3>{product.name}</h3>
              <p style={styles.price}>Rp {Number(product.price).toLocaleString()}</p>
              <p>{product.description}</p>
              <p style={styles.category}>{product.category}</p>
              <div style={styles.stockBadge}>
                {product.stock > 0 ? (
                  <span style={styles.inStock}>🟢 Stok: {product.stock}</span>
                ) : (
                  <span style={styles.outOfStock}>❌ Stok Habis</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// CSS Styles terintegrasi
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  searchInput: {
    width: '70%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
  },
  refreshButton: {
    padding: '12px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: '10px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.25s, box-shadow 0.25s',
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#28a745',
  },
  category: {
    fontSize: '14px',
    color: '#666',
    backgroundColor: '#e9ecef',
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    marginTop: '10px',
  },
  stockBadge: {
    marginTop: '10px',
  },
  inStock: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  outOfStock: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    color: '#888',
  },
};

// Menambahkan global keyframes animation untuk spinner dan hover card
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }
`;
document.head.appendChild(styleSheet);

export default ProductList;