import React, { useState } from 'react';
import type { Product } from '../data/products';
import { CloseIcon, TrashIcon, PlusIcon, MinusIcon } from './Icons';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cartItems,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onCheckout
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'percent' | 'flat'; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  // Shipping calculation: free over 5000 INR, else 150 INR
  let shippingFee = subtotal > 5000 ? 0 : 150;
  if (appliedCoupon && appliedCoupon.code === 'GREENWAY') {
    shippingFee = 0;
  }

  // Tax (GST 18%)
  const gst = Math.round(subtotal * 0.18);

  // Discount calculation
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = Math.round(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === 'flat') {
      discount = appliedCoupon.value;
    }
  }

  const orderTotal = subtotal + gst + shippingFee - discount;

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'SAVING10') {
      setAppliedCoupon({ code: 'SAVING10', type: 'percent', value: 10 });
      setCouponSuccess('10% Discount Coupon Applied successfully!');
    } else if (code === 'GREENWAY') {
      setAppliedCoupon({ code: 'GREENWAY', type: 'flat', value: 0 }); // Flat shipping bypass
      setCouponSuccess('Free Shipping Coupon Applied successfully!');
    } else if (code === 'WELCOME500') {
      if (subtotal < 2000) {
        setCouponError('Minimum order of ₹2,000 required for this coupon.');
      } else {
        setAppliedCoupon({ code: 'WELCOME500', type: 'flat', value: 500 });
        setCouponSuccess('₹500 Discount Coupon Applied successfully!');
      }
    } else {
      setCouponError('Invalid coupon code. Try SAVING10 or GREENWAY.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
  };

  return (
    <div className="cart-backdrop" onClick={onClose}>
      <div className="cart-drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <h3>Shopping Cart ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)</h3>
          <button className="cart-close-btn" onClick={onClose} aria-label="Close Shopping Cart">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-view">
              <div className="empty-cart-icon">🛒</div>
              <h4>Your cart is empty</h4>
              <p>Explore high-quality refurbished and vintage goods to find unbeatable savings!</p>
              <button className="shop-now-empty-btn" onClick={onClose}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const { product, quantity } = item;
                return (
                  <div key={product.id} className="cart-item-card">
                    <img src={product.image} alt={product.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <div className="cart-item-category">{product.category}</div>
                      <h4 className="cart-item-title" title={product.name}>{product.name}</h4>
                      <div className="cart-item-condition">{product.salesTag}</div>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price">₹{product.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="cart-item-actions">
                      <div className="cart-qty-controls">
                        <button 
                          disabled={quantity <= 1}
                          onClick={() => onUpdateQty(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <MinusIcon size={12} />
                        </button>
                        <span className="cart-qty-display">{quantity}</span>
                        <button 
                          disabled={quantity >= 5}
                          onClick={() => onUpdateQty(product.id, quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <PlusIcon size={12} />
                        </button>
                      </div>

                      <button 
                        className="cart-item-remove-btn" 
                        onClick={() => onRemoveItem(product.id)}
                        title="Remove Item"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer (Calculations and Checkout) */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Promo Code Input */}
            <div className="promo-code-container">
              {!appliedCoupon ? (
                <div className="promo-input-row">
                  <input 
                    type="text" 
                    placeholder="ENTER COUPON CODE" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="promo-input"
                  />
                  <button className="promo-apply-btn" onClick={handleApplyCoupon}>
                    APPLY
                  </button>
                </div>
              ) : (
                <div className="promo-applied-row">
                  <span className="coupon-code-tag">
                    🎫 {appliedCoupon.code} Applied
                  </span>
                  <button className="coupon-remove-btn" onClick={handleRemoveCoupon}>
                    Remove
                  </button>
                </div>
              )}
              {couponError && <span className="promo-error">{couponError}</span>}
              {couponSuccess && <span className="promo-success">{couponSuccess}</span>}
            </div>

            {/* Calculations Panel */}
            <div className="calculations-panel">
              <div className="calc-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-row">
                <span>Estimated GST (18%)</span>
                <span>+ ₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="calc-row">
                <span>Delivery Charges</span>
                <span>{shippingFee === 0 ? <strong className="free-shipping">FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              {discount > 0 && (
                <div className="calc-row discount-row">
                  <span>Coupon Discount</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {appliedCoupon && appliedCoupon.code === 'GREENWAY' && (
                <div className="calc-row discount-row">
                  <span>Free Shipping Discount</span>
                  <span>- ₹150</span>
                </div>
              )}
              <div className="calc-row total-row">
                <span>Grand Total</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Trigger */}
            <button className="drawer-checkout-btn" onClick={onCheckout}>
              PROCEED TO SECURE CHECKOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
