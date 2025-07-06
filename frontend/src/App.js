import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State'ler
  const [products, setProducts] = useState([]);
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Her sayfada kaç ürün gösterilecek
  const PRODUCTS_PER_PAGE = 4;

  // Ürünleri API'den çek
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://jewelry-store-internship-production.up.railway.app/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
      setLoading(false);
    }
  };

  // Önceki sayfa
  const previousPage = () => {
    if (currentStartIndex > 0) {
      setCurrentStartIndex(currentStartIndex - PRODUCTS_PER_PAGE);
    }
  };

  // Sonraki sayfa
  const nextPage = () => {
    if (currentStartIndex + PRODUCTS_PER_PAGE < products.length) {
      setCurrentStartIndex(currentStartIndex + PRODUCTS_PER_PAGE);
    }
  };

  // Renk değiştirme fonksiyonu
  const handleColorChange = (productIndex, newColor) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex].selectedColor = newColor;
    setProducts(updatedProducts);
  };

  if (loading) {
    return <div className="loading">Ürünler yükleniyor...</div>;
  }

  if (products.length === 0) {
    return <div className="error">Ürün bulunamadı</div>;
  }

  // Şu anki sayfadaki ürünler
  const currentProducts = products.slice(currentStartIndex, currentStartIndex + PRODUCTS_PER_PAGE);
  
  // Her ürün için varsayılan renk ayarla
  currentProducts.forEach((product, index) => {
    if (!product.selectedColor) {
      product.selectedColor = 'yellow';
    }
  });

  // Progress hesaplama
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const currentPage = Math.floor(currentStartIndex / PRODUCTS_PER_PAGE) + 1;
  const progressPercent = (currentPage / totalPages) * 100;

  return (
    <div className="App">
      <header className="app-header">
        <h1>Product List</h1>
        <div className="font-info">Avenir - Book - 45</div>
      </header>

      <main className="product-grid-container">
        {/* Sol Navigation */}
        <button 
          className="nav-arrow nav-left" 
          onClick={previousPage}
          disabled={currentStartIndex === 0}
        >
          &#8249;
        </button>

        {/* Ürün Grid */}
        <div className="product-grid">
          {currentProducts.map((product, index) => {
            const actualIndex = currentStartIndex + index;
            return (
              <div key={actualIndex} className="product-card-grid">
                <div className="product-image-grid">
                  <img 
                    src={product.images[product.selectedColor]} 
                    alt={product.name}
                  />
                </div>
                
                <div className="product-info-grid">
                  <h3>Product Title</h3>
                  <p className="price-grid">${product.price} USD</p>
                  
                  {/* Renk Seçici Küçük Daireler */}
                  <div className="color-dots">
                    <button 
                      className={`color-dot yellow ${product.selectedColor === 'yellow' ? 'active' : ''}`}
                      onClick={() => handleColorChange(actualIndex, 'yellow')}
                    ></button>
                    <button 
                      className={`color-dot white ${product.selectedColor === 'white' ? 'active' : ''}`}
                      onClick={() => handleColorChange(actualIndex, 'white')}
                    ></button>
                    <button 
                      className={`color-dot rose ${product.selectedColor === 'rose' ? 'active' : ''}`}
                      onClick={() => handleColorChange(actualIndex, 'rose')}
                    ></button>
                  </div>
                  
                  <p className="selected-color">
                    {product.selectedColor === 'yellow' ? 'Yellow Gold' : 
                     product.selectedColor === 'white' ? 'White Gold' : 'Rose Gold'}
                  </p>
                  
                  {/* Rating */}
                  <div className="rating-grid">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(product.popularityScore * 5) ? 'star filled' : 'star'}>
                        ★
                      </span>
                    ))}
                    <span className="rating-text">
                      {(product.popularityScore * 5).toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sağ Navigation */}
        <button 
          className="nav-arrow nav-right" 
          onClick={nextPage}
          disabled={currentStartIndex + PRODUCTS_PER_PAGE >= products.length}
        >
          &#8250;
        </button>
      </main>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Sayfa Bilgisi */}
      <div className="page-info">
        {currentPage} of {totalPages}
      </div>
    </div>
  );
}

export default App;
