import React, { useState } from 'react';
import type { Product } from '../data/products';
import { CloseIcon, CartIcon, StarIcon, CheckIcon, ShieldIcon } from './Icons';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');

  const {
    name,
    price,
    originalPrice,
    rating,
    reviewCount,
    image,
    inStock,
    salesTag,
    conditionText,
    description,
    features,
    specifications,
    reviews
  } = product;

  const savedAmount = originalPrice ? originalPrice - price : 0;
  const discountPercent = originalPrice 
    ? Math.round((savedAmount / originalPrice) * 100) 
    : 0;

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="detail-modal-close" onClick={onClose} aria-label="Close modal">
          <CloseIcon size={20} />
        </button>

        <div className="detail-modal-body">
          {/* Left Column: Image and Badges */}
          <div className="detail-left-column">
            <div className="detail-main-img-container">
              <img src={image} alt={name} className="detail-main-image" />
              {salesTag && (
                <span className={`detail-sales-tag ${salesTag.includes('Sold') ? 'detail-sold-tag' : 'detail-condition-tag'}`}>
                  {salesTag}
                </span>
              )}
            </div>

            {/* Micro Gallery / Alternates (simulation) */}
            <div className="detail-image-gallery">
              <div className="gallery-thumbnail active">
                <img src={image} alt={name} />
              </div>
              <div className="gallery-thumbnail">
                <img src={image} alt={name} style={{ filter: 'grayscale(0.5) sepia(0.2)' }} />
              </div>
              <div className="gallery-thumbnail">
                <img src={image} alt={name} style={{ filter: 'hue-rotate(90deg)' }} />
              </div>
            </div>

            {/* Trust Badges */}
            <div className="detail-trust-badges">
              <div className="trust-badge-item">
                <ShieldIcon size={16} />
                <div>
                  <span className="badge-title">100% Inspected</span>
                  <span className="badge-subtitle">Verified Condition</span>
                </div>
              </div>
              <div className="trust-badge-item">
                <CheckIcon size={16} />
                <div>
                  <span className="badge-title">Seller Guarantee</span>
                  <span className="badge-subtitle">7-Day Return Policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="detail-right-column">
            <div className="detail-category-path">
              Home &gt; {product.category} &gt; {name}
            </div>
            
            <h2 className="detail-title">{name}</h2>

            <div className="detail-rating-row">
              <div className="stars-container">
                <StarIcon fillPercent={rating * 20} size={16} />
              </div>
              <span className="rating-num">{rating}</span>
              <span className="rating-sep">|</span>
              <span className="rating-count">{reviewCount} Customer Reviews</span>
              <span className="rating-sep">|</span>
              <span className={`stock-status ${inStock ? 'in' : 'out'}`}>
                {inStock ? "Item Available" : "Sold Out"}
              </span>
            </div>

            {/* Pricing Box */}
            <div className="detail-price-box">
              <div className="price-row">
                <span className="current-price">₹{price.toLocaleString('en-IN')}</span>
                {originalPrice && (
                  <>
                    <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                    <span className="detail-discount-tag">{discountPercent}% OFF</span>
                  </>
                )}
              </div>
              {originalPrice && (
                <div className="savings-row">
                  You save: <strong className="savings-amount">₹{savedAmount.toLocaleString('en-IN')}</strong> (Eco-friendly choice!)
                </div>
              )}
            </div>

            {/* Condition report */}
            <div className="detail-condition-report">
              <span className="report-label">Condition Report:</span>
              <p className="report-text">{conditionText}</p>
            </div>

            {/* Description */}
            <div className="detail-description">
              <p>{description}</p>
            </div>

            {/* Features */}
            <div className="detail-features">
              <span className="features-label">Highlights:</span>
              <ul>
                {features.map((feat, i) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>

            {/* Add to Cart Actions */}
            <div className="detail-action-panel">
              {inStock && (
                <div className="qty-selector">
                  <button 
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(prev => prev - 1)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="qty-val">{quantity}</span>
                  <button 
                    disabled={quantity >= 5} // Limit checkout qty to 5 for used goods
                    onClick={() => setQuantity(prev => prev + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              )}

              <button 
                className="detail-add-to-cart-btn"
                disabled={!inStock}
                onClick={handleAddToCartClick}
              >
                <CartIcon size={18} />
                <span>{inStock ? "ADD TO CART" : "SOLD OUT"}</span>
              </button>

            </div>
          </div>
        </div>

        {/* Bottom Tabs Section: Specifications and Reviews */}
        <div className="detail-tabs-section">
          <div className="detail-tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Product Specifications
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Buyer Reviews ({reviews.length})
            </button>
          </div>

          <div className="detail-tabs-body">
            {activeTab === 'specs' && (
              <table className="specs-table">
                <tbody>
                  {Object.entries(specifications).map(([key, val]) => (
                    <tr key={key}>
                      <td className="specs-key">{key}</td>
                      <td className="specs-val">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-list">
                {reviews.length > 0 ? (
                  reviews.map(rev => (
                    <div key={rev.id} className="review-item-box">
                      <div className="review-item-header">
                        <span className="review-user">{rev.username}</span>
                        <div className="review-rating-stars">
                          <StarIcon fillPercent={rev.rating * 20} size={12} />
                        </div>
                        <span className="review-date">{rev.date}</span>
                      </div>
                      <p className="review-comment">{rev.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews">No reviews for this product yet. Be the first to purchase and review!</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
