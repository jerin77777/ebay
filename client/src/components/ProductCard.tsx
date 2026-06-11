import React from 'react';
import type { Product } from '../data/products';
import { CartIcon, StarIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onAddToCart
}) => {
  const {
    name,
    price,
    originalPrice,
    rating,
    reviewCount,
    image,
    inStock,
    salesTag,
    conditionText
  } = product;

  // Calculate discount percentage if original price is present
  const discountPercent = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100) 
    : 0;

  return (
    <div 
      className={`product-card ${!inStock ? 'out-of-stock' : ''}`}
      onClick={() => onSelectProduct(product)}
    >
      {/* Badges / Tags */}
      <div className="product-card-badges">
        {salesTag && (
          <span className={`badge-sales ${salesTag.includes('Sold') ? 'badge-sold' : 'badge-condition'}`}>
            {salesTag}
          </span>
        )}
        {discountPercent > 0 && inStock && (
          <span className="badge-discount">-{discountPercent}%</span>
        )}
      </div>

      {/* Product Image */}
      <div className="product-card-img-container">
        <img 
          src={image} 
          alt={name} 
          className="product-card-image"
          loading="lazy"
        />
        {!inStock && (
          <div className="out-of-stock-overlay">
            <span>SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="product-card-info">
        <div className="product-card-category">{product.category}</div>
        <h4 className="product-card-title" title={name}>{name}</h4>
        
        {/* Rating Row */}
        <div className="product-card-rating">
          <div className="stars-wrapper">
            <StarIcon fillPercent={rating * 20} size={14} />
          </div>
          <span className="rating-value">{rating}</span>
          <span className="reviews-count">({reviewCount})</span>
        </div>

        {/* Condition Preview Text */}
        <p className="product-card-condition-preview" title={conditionText}>
          {conditionText}
        </p>

        {/* Pricing & Add to Cart Row */}
        <div className="product-card-footer">
          <div className="product-card-price-box">
            <span className="product-card-price">₹{price.toLocaleString('en-IN')}</span>
            {originalPrice && (
              <span className="product-card-original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          <button 
            className="product-card-cart-btn"
            disabled={!inStock}
            onClick={(e) => onAddToCart(product, e)}
            title={inStock ? "Add to Cart" : "Sold Out"}
          >
            <CartIcon size={16} />
            <span>{inStock ? "Add" : "Sold"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
