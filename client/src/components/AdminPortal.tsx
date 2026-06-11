import React, { useState, useEffect } from 'react';
import type { Product } from '../data/products';
import type { SlideItem } from './HeroSlider';
import { TrashIcon } from './Icons';
import { supabase } from '../supabaseClient';

interface AdminPortalProps {
  products: Product[];
  categories: string[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onGoToStorefront: () => void;
  homeSettings: {
    theme: string;
    logo: { shield: string; bold: string; sub: string };
    siteName?: string;
    slides: SlideItem[];
  };
  onUpdateHomeSettings: (settings: {
    theme: string;
    logo: { shield: string; bold: string; sub: string };
    siteName?: string;
    slides: SlideItem[];
  }) => void;
}

interface OrderRecord {
  id: string;
  customerName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  items: { productName: string; qty: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered';
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  products,
  categories,
  onAddProduct,
  onDeleteProduct,
  onAddCategory,
  onDeleteCategory,
  onGoToStorefront,
  homeSettings,
  onUpdateHomeSettings
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Tab: 'categories' | 'products' | 'orders' | 'home'
  const [activeTab, setActiveTab] = useState<'categories' | 'products' | 'orders' | 'home'>('categories');

  // Popup Modal Visibility
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    category: 'Electronics (Refurbished)',
    image: '/refurbished_laptop.png',
    salesTag: 'Refurbished (Excellent)',
    conditionText: 'Tested and 100% functional.',
    description: '',
    featuresStr: 'Verified Quality, Eco-Friendly, Tested',
    specBrand: '',
    specCondition: '9/10',
    specMaterial: '',
    specWeight: '',
  });

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // New Category State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catError, setCatError] = useState('');
  const [catSuccess, setCatSuccess] = useState('');

  // Orders State
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  // Load orders on mount
  useEffect(() => {
    const localOrders = localStorage.getItem('valuebay_orders');
    if (localOrders) {
      setOrders(JSON.parse(localOrders));
    }
  }, []);

  // Home settings states
  const [editTheme, setEditTheme] = useState(homeSettings?.theme || 'classic-blue');
  const [editLogo, setEditLogo] = useState(homeSettings?.logo || { shield: 'VB', bold: 'VALUEBAY', sub: 'PRE-OWNED STORE' });
  const [editSiteName, setEditSiteName] = useState(homeSettings?.siteName || 'practecal');
  const [editSlides, setEditSlides] = useState<SlideItem[]>(homeSettings?.slides || []);

  const [homeError, setHomeError] = useState('');
  const [homeSuccess, setHomeSuccess] = useState('');

  // Update edit state if prop changes
  useEffect(() => {
    if (homeSettings) {
      setEditTheme(homeSettings.theme);
      setEditLogo(homeSettings.logo);
      setEditSiteName(homeSettings.siteName || 'practecal');
      setEditSlides(homeSettings.slides);
    }
  }, [homeSettings]);

  const handleSaveHomeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setHomeError('');
    setHomeSuccess('');

    onUpdateHomeSettings({
      theme: editTheme,
      logo: editLogo,
      siteName: editSiteName,
      slides: editSlides
    });

    setHomeSuccess('Home settings saved and applied successfully!');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const { data, error } = await supabase
        .from('users')
        .select('password')
        .eq('role', 'admin');

      if (error) {
        console.error("Database connection error fetching admins:", error);
        setAuthError('Failed to verify admin credentials via database.');
        return;
      }

      const matched = data && data.some(user => user.password === passwordInput);
      if (matched) {
        setIsAuthenticated(true);
      } else {
        setAuthError('Incorrect admin password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setAuthError('Database verification error.');
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const {
      name,
      price,
      originalPrice,
      category,
      image,
      salesTag,
      conditionText,
      description,
      featuresStr,
      specBrand,
      specCondition,
      specMaterial,
      specWeight
    } = newProduct;

    if (!name.trim()) return setFormError('Product Name is required.');
    if (!price || isNaN(Number(price))) return setFormError('Valid price is required.');
    if (!description.trim()) return setFormError('Description is required.');

    // Build specs object
    const specifications: Record<string, string> = {
      "Condition": specCondition || "8.5/10"
    };
    if (specBrand.trim()) specifications["Brand"] = specBrand.trim();
    if (specMaterial.trim()) specifications["Material"] = specMaterial.trim();
    if (specWeight.trim()) specifications["Weight"] = specWeight.trim();

    // Features array
    const features = featuresStr.split(',').map(f => f.trim()).filter(f => f.length > 0);

    const generatedProduct: Product = {
      id: Date.now(), // Generate unique ID
      name: name.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      rating: 4.5, // Default rating for new items
      reviewCount: 0,
      category,
      image,
      inStock: true,
      salesTag: salesTag.trim(),
      conditionText: conditionText.trim(),
      description: description.trim(),
      features,
      specifications,
      reviews: []
    };

    onAddProduct(generatedProduct);
    setFormSuccess('Product added successfully to catalog!');
    
    // Reset product input except category and image defaults
    setNewProduct({
      name: '',
      price: '',
      originalPrice: '',
      category: category, // keep last selected category
      image: image,       // keep last selected image
      salesTag: 'Refurbished (Excellent)',
      conditionText: 'Tested and 100% functional.',
      description: '',
      featuresStr: 'Verified Quality, Eco-Friendly, Tested',
      specBrand: '',
      specCondition: '9/10',
      specMaterial: '',
      specWeight: '',
    });

    // Close modal after showing success state
    setTimeout(() => {
      setIsAddProductOpen(false);
      setFormSuccess('');
    }, 1500);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');
    setCatSuccess('');

    const formattedCat = newCategoryName.trim();
    if (!formattedCat) {
      setCatError('Category Name is required.');
      return;
    }

    if (categories.some(c => c.toLowerCase() === formattedCat.toLowerCase())) {
      setCatError('This category already exists.');
      return;
    }

    onAddCategory(formattedCat);
    setCatSuccess(`Category "${formattedCat}" added successfully!`);
    setNewCategoryName('');

    // Close modal after showing success state
    setTimeout(() => {
      setIsAddCategoryOpen(false);
      setCatSuccess('');
    }, 1500);
  };

  const handleDeleteCategoryClick = (catName: string) => {
    const count = products.filter(p => p.category === catName).length;
    if (count > 0) {
      window.alert(`Cannot delete category "${catName}" because it has ${count} linked products. Please reassign or delete the products first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${catName}"?`)) {
      onDeleteCategory(catName);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: 'Pending' | 'Shipped' | 'Delivered') => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('valuebay_orders', JSON.stringify(updatedOrders));
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order record?")) {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('valuebay_orders', JSON.stringify(updatedOrders));
    }
  };

  // Calculations for stats
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // --- PASSWORD GATING SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="admin-login-backdrop">
        <div className="admin-login-card">
          <div className="admin-lock-icon">🔒</div>
          <h2>ValueBay Admin Portal</h2>
          <p>Please enter the administrator password to manage inventory and monitor customer orders.</p>

          <form onSubmit={handleLoginSubmit} className="admin-login-form">
            {authError && <div className="admin-auth-error">{authError}</div>}
            <div className="input-group">
              <label htmlFor="adminPass">Admin Password</label>
              <input 
                type="password" 
                id="adminPass"
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                placeholder="Enter password (hint: admin)"
                required
              />
            </div>
            <button type="submit" className="admin-login-submit">
              UNLOCK DASHBOARD
            </button>
          </form>

          <button className="admin-back-store-btn" onClick={onGoToStorefront}>
            ← Back to Storefront
          </button>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED ADMIN DASHBOARD (SIDEBAR DESIGN) ---
  return (
    <div className="admin-layout-wrapper">
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="admin-sidebar-left">
        <div className="admin-sidebar-brand">
          <div className="admin-logo-icon">{homeSettings?.logo?.shield || 'VB'}</div>
          <div className="admin-brand-text">
            <span className="admin-logo-bold">{homeSettings?.logo?.bold || 'VALUEBAY'}</span>
            <span className="admin-logo-sub">{homeSettings?.logo?.sub || 'OPERATIONS'}</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button 
            className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <span className="nav-icon">📁</span>
            <span className="nav-title-text">Categories</span>
          </button>

          <button 
            className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-title-text">Products</span>
          </button>

          <div className="nav-divider"></div>

          <button 
            className={`admin-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-title-text">Home</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info-box">
            <div className="user-avatar-circle">AD</div>
            <div className="user-details-text">
              <strong>Admin User</strong>
              <span>Verified Console</span>
            </div>
          </div>
          <button className="btn-logout-sidebar" onClick={() => setIsAuthenticated(false)}>
            Lock Console 🔒
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="admin-main-content">
        
        {/* Admin Top Header */}
        <header className="admin-dash-header">
          <div className="header-left">
            <h2>
              {activeTab === 'home' && "Storefront Settings Customizer"}
              {activeTab === 'products' && "Products Catalog Management"}
              {activeTab === 'categories' && "Store Categories Management"}
              {activeTab === 'orders' && "Customer Transactions History"}
            </h2>
            <span>Operations Console</span>
          </div>
          <div className="header-right">
            {activeTab === 'products' && (
              <button 
                className="btn-store-admin" 
                onClick={() => {
                  setFormError('');
                  setFormSuccess('');
                  setIsAddProductOpen(true);
                }}
                style={{ marginRight: '8px', backgroundColor: 'var(--brand-blue)', color: 'white' }}
              >
                ➕ Add Product
              </button>
            )}
            {activeTab === 'categories' && (
              <button 
                className="btn-store-admin" 
                onClick={() => {
                  setCatError('');
                  setCatSuccess('');
                  setIsAddCategoryOpen(true);
                }}
                style={{ marginRight: '8px', backgroundColor: 'var(--brand-blue)', color: 'white' }}
              >
                ➕ Add Category
              </button>
            )}
            {orders.length > 0 && (
              <button 
                className={`btn-logout-admin ${activeTab === 'orders' ? 'active' : ''}`} 
                onClick={() => setActiveTab('orders')}
                style={{ marginRight: '8px' }}
              >
                📥 Orders ({orders.length})
              </button>
            )}
            <button className="btn-store-admin" onClick={onGoToStorefront}>
              Preview Storefront →
            </button>
          </div>
        </header>

        {/* Summary Statistics Panels */}
        {activeTab !== 'products' && activeTab !== 'categories' && (
          <section className="admin-stats-grid">
            <div className="stat-panel-card">
              <span className="stat-label">Active Products</span>
              <strong className="stat-value">{products.length} Items</strong>
              <span className="stat-sub">Pre-owned goods online</span>
            </div>
            <div className="stat-panel-card">
              <span className="stat-label">Categories Count</span>
              <strong className="stat-value">{categories.length} Categories</strong>
              <span className="stat-sub">Dynamic catalog divisions</span>
            </div>
            <div className="stat-panel-card">
              <span className="stat-label">Total Sales Revenue</span>
              <strong className="stat-value">₹{totalSales.toLocaleString('en-IN')}</strong>
              <span className="stat-sub">{orders.length} secure checkouts</span>
            </div>
          </section>
        )}

        {/* Dynamic Tab Panels */}
        <div className="admin-tab-content-wrapper">
          
          {/* TAB: HOME CONFIG / SETTINGS */}
          {activeTab === 'home' && (
            <div className="admin-home-settings-container">
              <div className="add-product-form-box" style={{ maxWidth: '100%' }}>
                <h3>Storefront Layout & Theme Settings</h3>
                
                <form onSubmit={handleSaveHomeSettings} className="admin-add-prod-form">
                  {homeError && <div className="form-error-banner">{homeError}</div>}
                  {homeSuccess && <div className="form-success-banner">{homeSuccess}</div>}

                  <div className="settings-section">
                    <h4 style={{ fontSize: '15px', color: 'var(--text-dark)', marginBottom: '12px' }}>1. Custom Brand & Website Name</h4>
                    <div className="input-row" style={{ marginBottom: '16px' }}>
                      <div className="input-group" style={{ flex: '1' }}>
                        <label>Website Name (Shown next to header logo)</label>
                        <input 
                          type="text" 
                          value={editSiteName}
                          onChange={(e) => setEditSiteName(e.target.value)}
                          placeholder="e.g. practecal"
                          required
                        />
                      </div>
                    </div>
                    <div className="input-row">
                      <div className="input-group">
                        <label>Shield Icon Text (e.g. VB)</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          value={editLogo.shield}
                          onChange={(e) => setEditLogo(prev => ({ ...prev, shield: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Brand Name (Bold)</label>
                        <input 
                          type="text" 
                          value={editLogo.bold}
                          onChange={(e) => setEditLogo(prev => ({ ...prev, bold: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="input-group">
                        <label>Brand Subtitle / Tagline</label>
                        <input 
                          type="text" 
                          value={editLogo.sub}
                          onChange={(e) => setEditLogo(prev => ({ ...prev, sub: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <hr style={{ margin: '24px 0', borderColor: 'var(--border-color)' }} />

                  <div className="settings-section">
                    <h4 style={{ fontSize: '15px', color: 'var(--text-dark)', marginBottom: '12px' }}>2. Storefront Color Theme</h4>
                    <div className="input-group">
                      <label>Primary Highlight Color Palette</label>
                      <select 
                        value={editTheme} 
                        onChange={(e) => setEditTheme(e.target.value)}
                        style={{ padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', width: '100%' }}
                      >
                        <option value="classic-blue">🔵 Classic Blue (ValueBay Brand)</option>
                        <option value="emerald-green">🟢 Emerald Green (Sustainable Vibe)</option>
                        <option value="dark-slate">⚫ Sleek Dark Slate (Modern Clean)</option>
                        <option value="amber-orange">🟠 Amber Orange (Vibrant Retro Accent)</option>
                      </select>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        Updating this changes CSS variables dynamically and alters button, text link and icon colors throughout the app.
                      </span>
                    </div>
                  </div>

                  <hr style={{ margin: '24px 0', borderColor: 'var(--border-color)' }} />

                  <div className="settings-section">
                    <h4 style={{ fontSize: '15px', color: 'var(--text-dark)', marginBottom: '12px' }}>3. Hero Banner Slides (3 Slides Carousel)</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Edit the slider banner slides content and associate each slide button link to a storefront product.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {editSlides.map((slide, idx) => (
                        <div key={slide.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', backgroundColor: 'var(--bg-light)' }}>
                          <h5 style={{ margin: '0 0 12px 0', fontSize: '13px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                            <span>Slide {idx + 1} Configuration</span>
                            <span style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Active Carousel Slide</span>
                          </h5>

                          <div className="input-row">
                            <div className="input-group">
                              <label>Badge Title (e.g. REFURBISHED)</label>
                              <input 
                                type="text"
                                value={slide.badge}
                                onChange={(e) => {
                                  const list = [...editSlides];
                                  list[idx] = { ...slide, badge: e.target.value };
                                  setEditSlides(list);
                                }}
                                required
                              />
                            </div>
                            <div className="input-group">
                              <label>Heading Title</label>
                              <input 
                                type="text"
                                value={slide.title}
                                onChange={(e) => {
                                  const list = [...editSlides];
                                  list[idx] = { ...slide, title: e.target.value };
                                  setEditSlides(list);
                                }}
                                required
                              />
                            </div>
                          </div>

                          <div className="input-row">
                            <div className="input-group">
                              <label>Subtitle / Models Info</label>
                              <input 
                                type="text"
                                value={slide.subtitle}
                                onChange={(e) => {
                                  const list = [...editSlides];
                                  list[idx] = { ...slide, subtitle: e.target.value };
                                  setEditSlides(list);
                                }}
                                required
                              />
                            </div>
                            <div className="input-group">
                              <label>Promo Tagline</label>
                              <input 
                                type="text"
                                value={slide.tagline}
                                onChange={(e) => {
                                  const list = [...editSlides];
                                  list[idx] = { ...slide, tagline: e.target.value };
                                  setEditSlides(list);
                                }}
                                required
                              />
                            </div>
                          </div>

                          <div className="input-row">
                            <div className="input-group">
                              <label>Highlights (Comma separated list)</label>
                              <input 
                                type="text"
                                value={slide.features.join(', ')}
                                onChange={(e) => {
                                  const list = [...editSlides];
                                  list[idx] = { ...slide, features: e.target.value.split(',').map(f => f.trim()) };
                                  setEditSlides(list);
                                }}
                                required
                              />
                            </div>
                            <div className="input-group">
                              <label>Specs Strip (Comma separated list)</label>
                              <input 
                                type="text"
                                value={slide.specs.join(', ')}
                                onChange={(e) => {
                                  const list = [...editSlides];
                                  list[idx] = { ...slide, specs: e.target.value.split(',').map(s => s.trim()) };
                                  setEditSlides(list);
                                }}
                                required
                              />
                            </div>
                          </div>

                          <div className="input-row">
                            <div className="input-group">
                              <label>Slide Image</label>
                              <select
                                value={slide.image}
                                onChange={(e) => {
                                  const list = [...editSlides];
                                  list[idx] = { ...slide, image: e.target.value };
                                  setEditSlides(list);
                                }}
                              >
                                <option value="/refurbished_laptop.png">Laptop Image (Electronics)</option>
                                <option value="/vintage_jacket.png">Jacket Image (Fashion)</option>
                                <option value="/vintage_camera.png">Camera Image (Collectibles)</option>
                                <option value="/retro_console.png">Console Image (Gaming)</option>
                                <option value="/acoustic_guitar.png">Guitar Image (Sports/Media)</option>
                              </select>
                            </div>
                            <div className="input-group">
                              <label>Linked Product Action Target</label>
                              <select
                                value={slide.productId}
                                onChange={(e) => {
                                  const list = [...editSlides];
                                  list[idx] = { ...slide, productId: Number(e.target.value) };
                                  setEditSlides(list);
                                }}
                              >
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>{p.name} (₹{p.price.toLocaleString('en-IN')})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn-admin-add-product" style={{ background: 'var(--brand-blue)', color: 'white', marginTop: '24px' }}>
                    SAVE & APPLY STORE CONFIGURATION
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 1: PRODUCT MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="admin-full-width-layout">
              {/* Products List Table */}
              <div className="admin-product-table-box">
                <h3>Active Store Inventory</h3>
                
                <div className="admin-table-scroll">
                  <table className="admin-inventory-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Product details</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td>
                            <img src={product.image} alt={product.name} className="admin-tbl-img" />
                          </td>
                          <td>
                            <div className="admin-tbl-name">{product.name}</div>
                            <div className="admin-tbl-tag">{product.salesTag}</div>
                          </td>
                          <td>{product.category}</td>
                          <td>₹{product.price.toLocaleString('en-IN')}</td>
                          <td>
                            <button 
                              className="admin-tbl-delete-btn" 
                              onClick={() => onDeleteProduct(product.id)}
                              title="Delete Product"
                            >
                              <TrashIcon size={14} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="admin-full-width-layout">
              {/* Categories List & Counts */}
              <div className="admin-product-table-box">
                <h3>Active Store Categories ({categories.length})</h3>
                
                <table className="admin-inventory-table">
                  <thead>
                    <tr>
                      <th>Category Name</th>
                      <th>Linked Products count</th>
                      <th>Grade Priority</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat, idx) => {
                      const count = products.filter(p => p.category === cat).length;
                      return (
                        <tr key={idx}>
                          <td>
                            <strong className="admin-tbl-name">{cat}</strong>
                          </td>
                          <td>
                            <span className="badge-discount" style={{ background: '#0066cc', padding: '3px 8px', borderRadius: '4px' }}>
                              {count} items
                            </span>
                          </td>
                          <td>High-Priority Grade</td>
                          <td>
                            <button 
                              className="admin-tbl-delete-btn" 
                              onClick={() => handleDeleteCategoryClick(cat)}
                              title="Delete Category"
                            >
                              <TrashIcon size={14} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER ORDERS MONITOR */}
          {activeTab === 'orders' && (
            <div className="admin-orders-tab-box">
              <h3>Customer Checkout Orders History</h3>
              
              {orders.length === 0 ? (
                <div className="admin-empty-orders">
                  <span className="orders-empty-icon">📦</span>
                  <h4>No customer orders found.</h4>
                  <p>When users complete checkouts on the storefront, orders will display here in real-time.</p>
                </div>
              ) : (
                <div className="admin-orders-list-stack">
                  {orders.map(order => (
                    <div key={order.id} className="admin-order-record-card">
                      
                      {/* Order header banner */}
                      <div className="order-record-header">
                        <div className="order-header-info">
                          <strong>Order Ref: {order.id}</strong>
                          <span className="order-date-tag">Date Placed: {order.date}</span>
                        </div>
                        
                        <div className="order-record-status-actions">
                          <label>Status:</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className={`status-select ${order.status.toLowerCase()}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                          
                          <button 
                            className="btn-delete-order-record"
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Delete Order Record"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Order details grid */}
                      <div className="order-record-details-grid">
                        
                        {/* Customer Info */}
                        <div className="order-rec-col">
                          <h5>Customer Information</h5>
                          <div className="rec-info-line"><strong>Name:</strong> {order.customerName}</div>
                          <div className="rec-info-line"><strong>Email:</strong> {order.email}</div>
                          <div className="rec-info-line"><strong>Phone:</strong> {order.phone}</div>
                          <div className="rec-info-line"><strong>Address:</strong> {order.address}, {order.city} - {order.zipCode}</div>
                        </div>

                        {/* Payment info */}
                        <div className="order-rec-col">
                          <h5>Transaction Summary</h5>
                          <div className="rec-info-line"><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</div>
                          <div className="rec-info-line"><strong>Gateway Status:</strong> Mock Success</div>
                          <div className="rec-info-line grand-total-line">
                            <strong>Order Grand Total:</strong>
                            <span className="order-total-price">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Items lists */}
                        <div className="order-rec-col span-two">
                          <h5>Ordered Items</h5>
                          <div className="rec-items-box-list">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="rec-item-row-entry">
                                <span className="rec-item-name">{item.productName}</span>
                                <span className="rec-item-details">₹{item.price.toLocaleString('en-IN')} x {item.qty}</span>
                                <strong className="rec-item-subtotal">₹{(item.price * item.qty).toLocaleString('en-IN')}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      {/* ADD PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddProductOpen(false)}>
          <div className="admin-modal-content add-product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setIsAddProductOpen(false)} aria-label="Close form">
              &times;
            </button>
            <h3>Add New Used/Refurbished Item</h3>
            
            <form onSubmit={handleAddProductSubmit} className="admin-add-prod-form">
              {formError && <div className="form-error-banner">{formError}</div>}
              {formSuccess && <div className="form-success-banner">{formSuccess}</div>}

              <div className="input-group">
                <label>Product Name/Title</label>
                <input 
                  type="text" 
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Refurbished Apple Watch Series 7"
                  required
                />
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="18999"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Original Price (₹ - Optional)</label>
                  <input 
                    type="number" 
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
                    placeholder="41900"
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label>Product Image</label>
                  <select
                    value={newProduct.image}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                  >
                    <option value="/refurbished_laptop.png">Laptop Image (Electronics)</option>
                    <option value="/vintage_jacket.png">Jacket Image (Fashion)</option>
                    <option value="/vintage_camera.png">Camera Image (Collectibles)</option>
                    <option value="/retro_console.png">Console Image (Gaming)</option>
                    <option value="/acoustic_guitar.png">Guitar Image (Sports/Media)</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Condition Tag (Sales Label)</label>
                <input 
                  type="text" 
                  value={newProduct.salesTag}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, salesTag: e.target.value }))}
                  placeholder="Refurbished (Excellent)"
                  required
                />
              </div>

              <div className="input-group">
                <label>Condition Report Details</label>
                <input 
                  type="text" 
                  value={newProduct.conditionText}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, conditionText: e.target.value }))}
                  placeholder="Zero visible scratches. Battery health is at 94%."
                  required
                />
              </div>

              <div className="input-group">
                <label>Full Product Description</label>
                <textarea 
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide detailed description of item features, age, and specifications..."
                  rows={3}
                  required
                />
              </div>

              <div className="input-group">
                <label>Key Bullet Highlights (Comma separated)</label>
                <input 
                  type="text" 
                  value={newProduct.featuresStr}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, featuresStr: e.target.value }))}
                  placeholder="Item Point 1, Item Point 2, Item Point 3"
                />
              </div>

              <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-dark)' }}>Specifications (Compare Attributes)</h4>
              
              <div className="input-row">
                <div className="input-group">
                  <label>Brand</label>
                  <input 
                    type="text" 
                    value={newProduct.specBrand}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, specBrand: e.target.value }))}
                    placeholder="e.g. Apple"
                  />
                </div>
                <div className="input-group">
                  <label>Condition Score</label>
                  <input 
                    type="text" 
                    value={newProduct.specCondition}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, specCondition: e.target.value }))}
                    placeholder="e.g. 9.2/10"
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label>Material / Composition</label>
                  <input 
                    type="text" 
                    value={newProduct.specMaterial}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, specMaterial: e.target.value }))}
                    placeholder="e.g. Aluminum & Glass"
                  />
                </div>
                <div className="input-group">
                  <label>Weight (kg/g)</label>
                  <input 
                    type="text" 
                    value={newProduct.specWeight}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, specWeight: e.target.value }))}
                    placeholder="e.g. 36g"
                  />
                </div>
              </div>

              <button type="submit" className="btn-admin-add-product" style={{ marginTop: '20px' }}>
                ADD PRODUCT TO STORE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isAddCategoryOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddCategoryOpen(false)}>
          <div className="admin-modal-content add-category-modal" onClick={(e) => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setIsAddCategoryOpen(false)} aria-label="Close form">
              &times;
            </button>
            <h3>Create New Category</h3>
            
            <form onSubmit={handleAddCategorySubmit} className="admin-add-prod-form">
              {catError && <div className="form-error-banner">{catError}</div>}
              {catSuccess && <div className="form-success-banner">{catSuccess}</div>}

              <div className="input-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Vintage Watches"
                  required
                />
              </div>

              <button type="submit" className="btn-admin-add-product" style={{ marginTop: '20px' }}>
                CREATE CATEGORY
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
