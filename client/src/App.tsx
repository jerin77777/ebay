import { useState, useEffect, useMemo } from 'react';
import { PRODUCTS, CATEGORIES } from './data/products';
import type { Product } from './data/products';
import { HeroSlider } from './components/HeroSlider';
import type { SlideItem } from './components/HeroSlider';
import { supabase } from './supabaseClient';

const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: 0,
    productId: 2,
    badge: "REFURBISHED",
    title: "MACBOOK PRO M1",
    subtitle: "8GB RAM | 256GB SSD | RETINA DISPLAY",
    tagline: "Eco-Friendly Savings | Verified Performance",
    features: ["Apple M1 Chip", "15+ Hr Battery", "Silent Cooling", "True Tone Display"],
    specs: [
      "M1 8-Core CPU & GPU",
      "Retina 13.3\" Display",
      "92% Battery Health",
      "Tested & Certified",
      "Includes Original Charger"
    ],
    buttonText: "SHOP NOW",
    image: "/refurbished_laptop.png"
  },
  {
    id: 1,
    productId: 1,
    badge: "VINTAGE DEALS",
    title: "CLASSIC BOMBER JACKET",
    subtitle: "GENUINE LEATHER | 90s RETRO COWHIDE",
    tagline: "Timeless Quality | Rugged Appeal",
    features: ["Premium Leather", "Heavy Brass Zips", "Quilted Lining", "Timeless Cut"],
    specs: [
      "100% Genuine Leather",
      "Heavy Duty YKK Hardware",
      "Size L (Chest 42-44\")",
      "No Tears or Defects",
      "Excellent Patina"
    ],
    buttonText: "SHOP NOW",
    image: "/vintage_jacket.png"
  },
  {
    id: 2,
    productId: 4,
    badge: "COLLECTIBLES",
    title: "CANON AE-1 SLR CAMERA",
    subtitle: "35MM FILM | FD 50MM F/1.8 PRIME LENS",
    tagline: "Classic Analog Vibe | Fully Tested & Serviced",
    features: ["Light Seals Replaced", "Working Meter", "Clear Finder", "No Fungus/Haze"],
    specs: [
      "Canon FD 50mm Lens",
      "1/1000s Shutter Speed",
      "Satin Chrome Finish",
      "Free Neck Strap",
      "Battery Chamber Clean"
    ],
    buttonText: "SHOP NOW",
    image: "/vintage_camera.png"
  }
];
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem } from './components/CartDrawer';
import { CheckoutWizard } from './components/CheckoutWizard';
import { AuthModal } from './components/AuthModal';
import { AdminPortal } from './components/AdminPortal';
import { 
  SearchIcon, 
  CartIcon, 
  UserIcon, 
  PhoneIcon, 
  MailIcon, 
  ClockIcon,
  ChevronRightIcon,
  ShieldIcon,
  TruckIcon,
  AwardIcon,
  DropdownIcon
} from './components/Icons';
import './App.css';

function App() {
  // --- STATE MANAGEMENT ---
  const [homeSettings, setHomeSettings] = useState(() => {
    const local = localStorage.getItem('valuebay_home_settings');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback below
      }
    }
    return {
      theme: 'classic-blue',
      logo: { shield: 'VB', bold: 'VALUEBAY', sub: 'PRE-OWNED STORE' },
      siteName: 'practecal',
      slides: DEFAULT_SLIDES
    };
  });

  useEffect(() => {
    localStorage.setItem('valuebay_home_settings', JSON.stringify(homeSettings));
  }, [homeSettings]);

  useEffect(() => {
    const root = document.documentElement;
    const theme = homeSettings.theme;
    if (theme === 'classic-blue') {
      root.style.setProperty('--brand-blue', '#0066cc');
      root.style.setProperty('--brand-blue-hover', '#0052a3');
      root.style.setProperty('--brand-blue-light', '#e6f0fa');
    } else if (theme === 'emerald-green') {
      root.style.setProperty('--brand-blue', '#10b981');
      root.style.setProperty('--brand-blue-hover', '#059669');
      root.style.setProperty('--brand-blue-light', '#ecfdf5');
    } else if (theme === 'dark-slate') {
      root.style.setProperty('--brand-blue', '#334155');
      root.style.setProperty('--brand-blue-hover', '#1e293b');
      root.style.setProperty('--brand-blue-light', '#f1f5f9');
    } else if (theme === 'amber-orange') {
      root.style.setProperty('--brand-blue', '#f59e0b');
      root.style.setProperty('--brand-blue-hover', '#d97706');
      root.style.setProperty('--brand-blue-light', '#fef3c7');
    }
  }, [homeSettings.theme]);



  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    const local = localStorage.getItem('valuebay_user_id');
    return local ? parseInt(local, 10) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const userId = localStorage.getItem('valuebay_user_id');
    if (!userId) return [];
    const local = localStorage.getItem('valuebay_cart');
    return local ? JSON.parse(local) : [];
  });

  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('valuebay_user') || null;
  });

  // Modal / Drawer visibility
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Buffer for input submit
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');

  // Custom Dropdowns
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const conditionOptions = [
    { value: 'all', label: 'All Conditions' },
    { value: 'refurbished', label: 'Refurbished' },
    { value: 'vintage', label: 'Vintage & Collectibles' },
    { value: 'good', label: 'Good / Pre-Owned' }
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.custom-dropdown')) {
        setIsConditionOpen(false);
        setIsSortOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);
  
  // Custom toast notifications for e-commerce updates
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Products List State
  const [productsList, setProductsList] = useState<Product[]>(() => {
    const local = localStorage.getItem('valuebay_products');
    return local ? JSON.parse(local) : PRODUCTS;
  });

  // Categories List State
  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    const local = localStorage.getItem('valuebay_categories');
    return local ? JSON.parse(local) : CATEGORIES;
  });

  // Client-side Router State
  const [currentPath, setCurrentPath] = useState(window.location.pathname.replace(/\/$/, '') || '/');

  useEffect(() => {
    localStorage.setItem('valuebay_products', JSON.stringify(productsList));
  }, [productsList]);

  useEffect(() => {
    localStorage.setItem('valuebay_categories', JSON.stringify(categoriesList));
  }, [categoriesList]);

  // Fetch Categories from Supabase Database on Mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });

        if (error) {
          console.error("Error fetching categories from database:", error);
          return;
        }

        if (data && data.length > 0) {
          const names = data.map(item => item.name);
          setCategoriesList(names);
        }
      } catch (err) {
        console.error("Failed to connect to database for categories:", err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch User's Cart from Supabase Database on Mount / Login
  useEffect(() => {
    if (currentUserId) {
      const fetchCart = async () => {
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .select('product_id, quantity')
            .eq('user_id', currentUserId);
          
          if (error) {
            console.error("Error fetching cart from Supabase:", error);
            return;
          }
          
          if (data) {
            const loadedCart = data.map(item => {
              const product = productsList.find(p => p.id === item.product_id);
              return product ? { product, quantity: item.quantity } : null;
            }).filter((item): item is CartItem => item !== null);
            
            setCart(loadedCart);
          }
        } catch (err) {
          console.error("Failed to fetch cart from Supabase:", err);
        }
      };
      fetchCart();
    } else {
      setCart([]);
    }
  }, [currentUserId, productsList]);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const getProductIdFromPath = () => {
    const match = currentPath.match(/\/product\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };
  const urlProductId = getProductIdFromPath();

  const activeProduct = useMemo(() => {
    if (urlProductId === null) return null;
    return productsList.find(p => p.id === urlProductId) || null;
  }, [urlProductId, productsList]);

  const handleProductSelect = (product: Product) => {
    navigateTo(`/product/${product.id}`);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setSelectedCondition('all');
    if (currentPath !== '/') {
      navigateTo('/');
    }
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('valuebay_cart', JSON.stringify(cart));
  }, [cart]);


  // --- TOAST NOTIFICATIONS ---
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // --- CART HANDLERS ---
  const handleAddToCart = async (product: Product, quantity: number = 1) => {
    if (!product.inStock) return;
    if (!currentUser || !currentUserId) {
      showToast("Please log in to add items to your cart.");
      setIsAuthOpen(true);
      return;
    }

    const existing = cart.find(item => item.product.id === product.id);
    const newQty = existing ? Math.min(existing.quantity + quantity, 5) : quantity;

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: currentUserId, product_id: product.id, quantity: newQty },
          { onConflict: 'user_id,product_id' }
        );

      if (error) {
        console.error("Error saving to database cart:", error);
        showToast("Failed to save item to database cart.");
        return;
      }

      setCart((prev) => {
        const hasExisting = prev.some(item => item.product.id === product.id);
        if (hasExisting) {
          showToast(`Updated quantity of ${product.name} in cart!`);
          return prev.map(item => item.product.id === product.id ? { ...item, quantity: newQty } : item);
        }
        showToast(`Added ${product.name} to cart!`);
        return [...prev, { product, quantity: newQty }];
      });
    } catch (err) {
      console.error("Failed to add to database cart:", err);
      showToast("Error updating database cart.");
    }
  };

  const handleUpdateQty = async (productId: number, qty: number) => {
    if (!currentUserId) return;
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: qty })
        .eq('user_id', currentUserId)
        .eq('product_id', productId);

      if (error) {
        console.error("Error updating quantity in Supabase:", error);
        return;
      }

      setCart((prev) => 
        prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item)
      );
    } catch (err) {
      console.error("Failed to update quantity in database:", err);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    if (!currentUserId) return;
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', currentUserId)
        .eq('product_id', productId);

      if (error) {
        console.error("Error removing item from Supabase:", error);
        return;
      }

      setCart((prev) => prev.filter(item => item.product.id !== productId));
      showToast("Removed item from cart.");
    } catch (err) {
      console.error("Failed to remove item from database:", err);
    }
  };

  const handleOrderComplete = async (orderData: {
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
  }) => {
    const newOrder = {
      ...orderData,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'Pending' as const
    };

    const existingOrdersStr = localStorage.getItem('valuebay_orders');
    const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('valuebay_orders', JSON.stringify(updatedOrders));

    if (currentUserId) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', currentUserId);
        if (error) {
          console.error("Error clearing database cart on order complete:", error);
        }
      } catch (err) {
        console.error("Failed to clear database cart on order complete:", err);
      }
    }

    setCart([]);
    showToast("Order Placed Successfully! Your cart has been cleared.");
  };



  // --- USER AUTH HANDLERS ---
  const handleLoginSuccess = (username: string, email: string, userId: number) => {
    setCurrentUser(username);
    setCurrentUserId(userId);
    localStorage.setItem('valuebay_user', username);
    localStorage.setItem('valuebay_user_email', email);
    localStorage.setItem('valuebay_user_id', String(userId));
    showToast(`Logged in successfully as ${username}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserId(null);
    localStorage.removeItem('valuebay_user');
    localStorage.removeItem('valuebay_user_email');
    localStorage.removeItem('valuebay_user_id');
    localStorage.removeItem('valuebay_cart');
    setCart([]);
    showToast("Logged out successfully.");
  };

  // --- FILTER & SEARCH IMPLEMENTATION ---
  const filteredProducts = useMemo(() => {
    return productsList.filter(product => {
      // 1. Category Filter
      const matchesCategory = activeCategory === 'All' || 
        (activeCategory === 'Special Discount' && product.originalPrice && product.originalPrice > product.price) ||
        product.category === activeCategory;

      // 2. Search Query Filter
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.conditionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.specifications.Brand && product.specifications.Brand.toLowerCase().includes(searchQuery.toLowerCase()));

      // 3. Condition Filter
      let matchesCondition = true;
      if (selectedCondition !== 'all') {
        const tag = product.salesTag ? product.salesTag.toLowerCase() : '';
        if (selectedCondition === 'refurbished') {
          matchesCondition = tag.includes('refurbished');
        } else if (selectedCondition === 'vintage') {
          matchesCondition = tag.includes('vintage') || tag.includes('collectible');
        } else if (selectedCondition === 'good') {
          matchesCondition = tag.includes('good') || tag.includes('pre-owned') || tag.includes('second-hand');
        }
      }

      return matchesCategory && matchesSearch && matchesCondition;
    }).sort((a, b) => {
      // 4. Sorting
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // default: popularity (based on review counts / ID)
      return b.reviewCount - a.reviewCount;
    });
  }, [searchQuery, activeCategory, sortBy, selectedCondition]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setActiveCategory('All');
    setSortBy('popularity');
    setSelectedCondition('all');
    if (currentPath !== '/') {
      navigateTo('/');
    }
  };

  // Total items in cart
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cleanPath = currentPath.split('?')[0].split('#')[0].replace(/\/$/, '');
  if (cleanPath === '/admin' || cleanPath.endsWith('/admin')) {
    return (
      <AdminPortal 
        products={productsList}
        categories={categoriesList}
        onAddProduct={(newProd) => {
          setProductsList(prev => [newProd, ...prev]);
        }}
        onDeleteProduct={(id) => {
          if (window.confirm("Are you sure you want to delete this product from the store catalog?")) {
            setProductsList(prev => prev.filter(p => p.id !== id));
            showToast("Product deleted from inventory.");
          }
        }}
        onAddCategory={async (newCat) => {
          try {
            const { error } = await supabase
              .from('categories')
              .insert([{ name: newCat }]);
            
            if (error) {
              showToast(`Error adding category: ${error.message}`);
              console.error(error);
              return;
            }
            
            setCategoriesList(prev => [...prev, newCat]);
            showToast(`Category "${newCat}" added successfully!`);
          } catch (err) {
            console.error(err);
            showToast("Failed to add category to database.");
          }
        }}
        onDeleteCategory={async (catName) => {
          try {
            const { error } = await supabase
              .from('categories')
              .delete()
              .eq('name', catName);
            
            if (error) {
              showToast(`Error deleting category: ${error.message}`);
              console.error(error);
              return;
            }
            
            setCategoriesList(prev => prev.filter(c => c !== catName));
            showToast(`Category "${catName}" deleted successfully!`);
          } catch (err) {
            console.error(err);
            showToast("Failed to delete category from database.");
          }
        }}
        onGoToStorefront={() => navigateTo('/')}
        homeSettings={homeSettings}
        onUpdateHomeSettings={(settings) => {
          setHomeSettings(settings);
          showToast("Storefront customizer settings saved!");
        }}
      />
    );
  }

  return (
    <>
      {/* Toast Notification popup */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP BAR */}
      <div className="top-bar">
        <div className="top-bar-inner" style={{ justifyContent: 'flex-end' }}>
          <div className="top-nav-links">
            <button className="top-link" onClick={() => setIsAuthOpen(true)}>
              <UserIcon size={13} />
              <span>{currentUser ? `Hi, ${currentUser}` : 'My Account'}</span>
            </button>
            <button className="top-link" onClick={() => cart.length > 0 ? setIsCheckoutOpen(true) : showToast("Your cart is empty.")}>
              <span>Checkout</span>
            </button>
            {currentUser ? (
              <button className="top-link btn-auth-toggle" onClick={handleLogout}>Log Out</button>
            ) : (
              <button className="top-link btn-auth-toggle" onClick={() => setIsAuthOpen(true)}>Log In</button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW */}
      <header className="main-header">
        <div className="main-header-inner">
          {/* Logo */}
          <div className="logo-container logo-img-container" onClick={handleClearFilters}>
            <img src="/logo.png" alt={`${homeSettings.siteName || 'practecal'} Logo`} className="logo-image" />
            <div className="logo-text">
              <span className="logo-bold">{homeSettings.siteName || 'practecal'}</span>
              <span className="logo-subtitle">PRE-OWNED STORE</span>
            </div>
          </div>

          {/* Search Bar */}
          <form className="search-container" onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              placeholder="Search for laptops, vintage leather, retro consoles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" aria-label="Search button">
              <SearchIcon size={18} />
            </button>
          </form>

          {/* Support Contacts */}
          <div className="header-right-panel">
            <div className="support-phone-box">
              <PhoneIcon size={18} className="support-phone-icon" />
              <div className="support-text">
                <span className="support-label">Support Helpline</span>
                <span className="support-number">+91-9510223097</span>
              </div>
            </div>

            {/* Cart Button indicator */}
            <button 
              className="header-cart-btn" 
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping Cart, ${cartItemCount} items`}
            >
              <div className="cart-btn-left">
                <CartIcon size={18} />
                <span>My Cart</span>
              </div>
              <span className="cart-badge-count">{cartItemCount}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. CONTACT & WORKING HOURS SUB-HEADER ROW */}
      <div className="contacts-sub-header">
        <div className="contacts-inner">
          <div className="sub-contact-item">
            <PhoneIcon size={13} />
            <span>Support: +91-9510223097, +91-7487077796</span>
          </div>
          <div className="sub-contact-item">
            <PhoneIcon size={13} />
            <span>Condition Tech Support: +91-9510223086</span>
          </div>
          <div className="sub-contact-item">
            <MailIcon size={13} />
            <span>support@valuebay.co.in</span>
          </div>
          <div className="sub-contact-item hours-item">
            <ClockIcon size={13} />
            <span>Mon-Sat: 9:30am-5:30pm; Sun: Non Working</span>
          </div>
        </div>
      </div>

      {/* 4. MAIN LAYOUT */}
      <main className="main-content-layout">
        
        {/* Left Sidebar */}
        <aside className="sidebar-left">
          
          {/* Sidebar Categories Box */}
          <div className="sidebar-box category-sidebar-box">
            <h3 className="sidebar-header-title">CATEGORIES</h3>
            <div className="category-menu-list">
              <button 
                className={`category-menu-item ${activeCategory === 'All' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('All')}
              >
                <span>All Used Goods</span>
                <ChevronRightIcon size={14} />
              </button>
              {categoriesList.map(cat => (
                <button 
                  key={cat}
                  className={`category-menu-item ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <span>{cat}</span>
                  <ChevronRightIcon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Trust badges stack */}
          <div className="sidebar-badges-stack">
            <div className="sidebar-trust-card">
              <div className="card-icon-wrapper blue-circle">
                <AwardIcon size={18} />
              </div>
              <div className="card-text">
                <span className="trust-card-title">VERIFIED PRODUCTS</span>
                <span className="trust-card-desc">100% Inspected & Graded</span>
              </div>
            </div>

            <div className="sidebar-trust-card">
              <div className="card-icon-wrapper blue-circle">
                <TruckIcon size={18} />
              </div>
              <div className="card-text">
                <span className="trust-card-title">GREEN SHIPPING</span>
                <span className="trust-card-desc">Eco-packaging across India</span>
              </div>
            </div>

            <div className="sidebar-trust-card">
              <div className="card-icon-wrapper blue-circle">
                <ShieldIcon size={18} />
              </div>
              <div className="card-text">
                <span className="trust-card-title">SAFE & SECURE</span>
                <span className="trust-card-desc">7-Day Seller Returns</span>
              </div>
            </div>

            <div className="sidebar-trust-card">
              <div className="card-icon-wrapper blue-circle">
                <PhoneIcon size={18} />
              </div>
              <div className="card-text">
                <span className="trust-card-title">EXPERT GRADING</span>
                <span className="trust-card-desc">Real-time support checks</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right main grid content */}
        <section className="main-grid-content">
          
          {activeProduct ? (
            <ProductDetailPage 
              product={activeProduct}
              onBack={() => navigateTo('/')}
              onAddToCart={handleAddToCart}
            />
          ) : (
            <>
              {/* Main banner slider carousel */}
              {activeCategory === 'All' && (
                <HeroSlider 
                  products={productsList} 
                  onSelectProduct={handleProductSelect} 
                  slides={homeSettings.slides}
                />
              )}

              {/* Horizontal badges row (below slider) */}
              {activeCategory === 'All' && (
                <div className="horizontal-trust-strip">
                  <div className="trust-strip-item">
                    <div className="trust-strip-icon-box">♻</div>
                    <div className="trust-strip-text">
                      <strong>BEST DEALS</strong>
                      <span>Eco savings on quality</span>
                    </div>
                  </div>
                  <div className="trust-strip-item">
                    <div className="trust-strip-icon-box">📦</div>
                    <div className="trust-strip-text">
                      <strong>WIDE COLLECTION</strong>
                      <span>Refurbished & Vintage</span>
                    </div>
                  </div>
                  <div className="trust-strip-item">
                    <div className="trust-strip-icon-box">🛡</div>
                    <div className="trust-strip-text">
                      <strong>QUALITY CERTIFIED</strong>
                      <span>Fully Tested & Repaired</span>
                    </div>
                  </div>
                  <div className="trust-strip-item">
                    <div className="trust-strip-icon-box">🌱</div>
                    <div className="trust-strip-text">
                      <strong>CIRCULAR PLEDGE</strong>
                      <span>Supporting Sustainability</span>
                    </div>
                  </div>
                </div>
              )}


              {/* Product Listing Section */}
              <div className="product-listing-header-row">
                <div className="listing-title-box">
                  <h3>Featured Pre-Owned Goods</h3>
                  <span className="listing-count-tag">
                    {filteredProducts.length} items found in <strong>{activeCategory}</strong>
                  </span>
                </div>

                {/* Filter controls */}
                <div className="listing-filters-box">
                  {/* Condition Filters */}
                  <div className="filter-select-group">
                    <label>Condition:</label>
                    <div className={`custom-dropdown ${isConditionOpen ? 'open' : ''}`}>
                      <button 
                        type="button" 
                        className="custom-dropdown-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsConditionOpen(!isConditionOpen);
                          setIsSortOpen(false);
                        }}
                      >
                        <span>{conditionOptions.find(o => o.value === selectedCondition)?.label}</span>
                        <DropdownIcon size={12} className="dropdown-arrow" />
                      </button>
                      {isConditionOpen && (
                        <ul className="custom-dropdown-menu">
                          {conditionOptions.map(option => (
                            <li 
                              key={option.value}
                              className={`custom-dropdown-item ${selectedCondition === option.value ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedCondition(option.value);
                                setIsConditionOpen(false);
                              }}
                            >
                              {option.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Sorting */}
                  <div className="filter-select-group">
                    <label>Sort By:</label>
                    <div className={`custom-dropdown ${isSortOpen ? 'open' : ''}`}>
                      <button 
                        type="button" 
                        className="custom-dropdown-trigger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSortOpen(!isSortOpen);
                          setIsConditionOpen(false);
                        }}
                      >
                        <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                        <DropdownIcon size={12} className="dropdown-arrow" />
                      </button>
                      {isSortOpen && (
                        <ul className="custom-dropdown-menu">
                          {sortOptions.map(option => (
                            <li 
                              key={option.value}
                              className={`custom-dropdown-item ${sortBy === option.value ? 'selected' : ''}`}
                              onClick={() => {
                                setSortBy(option.value);
                                setIsSortOpen(false);
                              }}
                            >
                              {option.label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Reset button */}
                  {(searchQuery || activeCategory !== 'All' || selectedCondition !== 'all') && (
                    <button className="reset-filters-btn" onClick={handleClearFilters}>
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Active filters display badges */}
              {(searchQuery || activeCategory !== 'All' || selectedCondition !== 'all') && (
                <div className="active-filters-badges">
                  <span className="badge-intro">Active Filters:</span>
                  {activeCategory !== 'All' && (
                    <span className="active-badge">
                      Category: {activeCategory}
                      <button className="badge-clear" onClick={() => setActiveCategory('All')}>×</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="active-badge">
                      Search: "{searchQuery}"
                      <button className="badge-clear" onClick={() => { setSearchQuery(''); setSearchInput(''); }}>×</button>
                    </span>
                  )}
                  {selectedCondition !== 'all' && (
                    <span className="active-badge">
                      Condition: {selectedCondition}
                      <button className="badge-clear" onClick={() => setSelectedCondition('all')}>×</button>
                    </span>
                  )}
                </div>
              )}

              {/* The Product Cards Grid */}
              {filteredProducts.length > 0 ? (
                <div className="product-cards-grid">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      onSelectProduct={handleProductSelect}
                      onAddToCart={(prod, e) => {
                        e.stopPropagation();
                        handleAddToCart(prod, 1);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-listing-results">
                  <div className="empty-results-icon">🔍</div>
                  <h4>No matches found</h4>
                  <p>We couldn't find any used goods matching your search or filters. Try adjusting your settings.</p>
                  <button className="reset-listing-btn" onClick={handleClearFilters}>
                    Reset Search Filters
                  </button>
                </div>
              )}
            </>
          )}

        </section>
      </main>

      {/* 5. FOOTER */}
      <footer className="footer-main-container">
        <div className="footer-green-pledge">
          <div className="green-pledge-inner">
            <span className="green-eco-icon">♻</span>
            <div>
              <h4>VALUEBAY CIRCULAR SHOPPING PLEDGE</h4>
              <p>Every pre-owned product purchased extends its lifecycle, reducing electronic waste and manufacturing emissions. Join us in making sustainable shopping affordable.</p>
            </div>
          </div>
        </div>

        <div className="footer-info-links-grid">
          <div className="footer-column">
            <h4>ValueBay</h4>
            <p className="footer-about-text">
              India's premium online marketplace for certified pre-owned, refurbished, and vintage goods. Bringing trust, quality inspection, and warranty to used items.
            </p>
          </div>
          <div className="footer-column">
            <h4>Shopping Resources</h4>
            <ul>
              <li><a href="#how" onClick={(e) => {e.preventDefault(); showToast("How We Inspect link clicked.");}}>How We Grade Condition</a></li>
              <li><a href="#return" onClick={(e) => {e.preventDefault(); showToast("7-Day Return Policy details.");}}>7-Day Return & Refunds</a></li>
              <li><a href="#shipping" onClick={(e) => {e.preventDefault(); showToast("Green Shipping details.");}}>Green Shipping Details</a></li>
              <li><a href="#sell" onClick={(e) => {e.preventDefault(); showToast("How to Sell details.");}}>Sell Your Used Goods</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Customer Support</h4>
            <ul>
              <li><a href="#contact" onClick={(e) => {e.preventDefault(); showToast("Contact support form.");}}>Support Center</a></li>
              <li><a href="#warranty" onClick={(e) => {e.preventDefault(); showToast("Warranty Verification.");}}>Verify Seller Warranty</a></li>
              <li><a href="#faq" onClick={(e) => {e.preventDefault(); showToast("FAQ list.");}}>Frequently Asked Questions</a></li>
              <li><a href="#feedback" onClick={(e) => {e.preventDefault(); showToast("Submit feedback.");}}>Buyer Feedback Form</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-copyright-strip">
          <p>© 2026 ValueBay India Private Limited. All rights reserved. All product names, logos, and brands are property of their respective owners.</p>
        </div>
      </footer>

      {/* --- FLOATING COMPONENTS / DRAWER / MODALS --- */}
      
      {/* 1. Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        cartItems={cart}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* ProductDetailModal removed - product now opens as a dedicated page */}

      {/* 3. Checkout Wizard Modal */}
      <CheckoutWizard 
        isOpen={isCheckoutOpen}
        cartItems={cart}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={handleOrderComplete}
      />

      {/* 4. Authentication Login Modal */}
      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />


    </>
  );
}

export default App;
