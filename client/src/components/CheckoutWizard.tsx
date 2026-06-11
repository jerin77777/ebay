import React, { useState } from 'react';
import type { CartItem } from './CartDrawer';
import { CloseIcon, CheckIcon, ShieldIcon, TruckIcon } from './Icons';

interface CheckoutWizardProps {
  isOpen: boolean;
  cartItems: CartItem[];
  onClose: () => void;
  onOrderComplete: (orderData: {
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
  }) => void;
}

type CheckoutStep = 'shipping' | 'payment' | 'success';

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({
  isOpen,
  cartItems,
  onClose,
  onOrderComplete
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingForm, setShippingForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    state: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    method: 'upi',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const gst = Math.round(subtotal * 0.18);
  const delivery = subtotal > 5000 ? 0 : 150;
  const grandTotal = subtotal + gst + delivery;

  // Validation
  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    if (!shippingForm.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!shippingForm.email.trim() || !/\S+@\S+\.\S+/.test(shippingForm.email)) newErrors.email = 'Valid Email is required';
    if (!shippingForm.phone.trim() || shippingForm.phone.length < 10) newErrors.phone = 'Valid 10-digit Phone Number is required';
    if (!shippingForm.address.trim()) newErrors.address = 'Shipping Address is required';
    if (!shippingForm.city.trim()) newErrors.city = 'City is required';
    if (!shippingForm.zipCode.trim() || shippingForm.zipCode.length !== 6) newErrors.zipCode = 'Valid 6-digit PIN code is required';
    if (!shippingForm.state.trim()) newErrors.state = 'State is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};
    if (paymentForm.method === 'card') {
      if (!paymentForm.cardName.trim()) newErrors.cardName = 'Name on Card is required';
      if (!paymentForm.cardNumber.trim() || paymentForm.cardNumber.replace(/\s/g, '').length !== 16) newErrors.cardNumber = 'Valid 16-digit Card Number is required';
      if (!paymentForm.expiry.trim() || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(paymentForm.expiry)) newErrors.expiry = 'Expiry MM/YY is required';
      if (!paymentForm.cvv.trim() || paymentForm.cvv.length !== 3) newErrors.cvv = '3-digit CVV is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePayment()) {
      setIsProcessing(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsProcessing(false);
        const randomOrderNum = 'VAL-' + Math.floor(10000000 + Math.random() * 90000000);
        setOrderNumber(randomOrderNum);
        setStep('success');
      }, 2000);
    }
  };

  const handleFinish = () => {
    onOrderComplete({
      id: orderNumber,
      customerName: shippingForm.fullName,
      email: shippingForm.email,
      address: shippingForm.address,
      city: shippingForm.city,
      zipCode: shippingForm.zipCode,
      phone: shippingForm.phone,
      items: cartItems.map(item => ({
        productName: item.product.name,
        qty: item.quantity,
        price: item.product.price
      })),
      totalAmount: grandTotal,
      paymentMethod: paymentForm.method
    });
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, form: 'shipping' | 'payment') => {
    const { name, value } = e.target;
    if (form === 'shipping') {
      setShippingForm(prev => ({ ...prev, [name]: value }));
    } else {
      setPaymentForm(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="modal-backdrop" onClick={step !== 'success' && !isProcessing ? onClose : undefined}>
      <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header (Hidden on success) */}
        {step !== 'success' && (
          <div className="checkout-modal-header">
            <h3>Secure Checkout</h3>
            <button className="checkout-close" onClick={onClose} disabled={isProcessing} aria-label="Close Checkout">
              <CloseIcon size={20} />
            </button>
          </div>
        )}

        {/* Steps Breadcrumbs Indicator */}
        {step !== 'success' && (
          <div className="checkout-steps-bar">
            <div className={`step-item ${step === 'shipping' ? 'active' : ''} ${step === 'payment' ? 'completed' : ''}`}>
              <div className="step-num">{step === 'payment' ? <CheckIcon size={12} /> : '1'}</div>
              <span>Shipping Info</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step === 'payment' ? 'active' : ''}`}>
              <div className="step-num">2</div>
              <span>Payment Details</span>
            </div>
          </div>
        )}

        {/* Main Content Body */}
        <div className="checkout-modal-body">
          
          {/* STEP 1: SHIPPING INFORMATION */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="checkout-form-grid">
              <div className="checkout-form-fields">
                <h4>Delivery Address</h4>
                
                <div className="input-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input 
                    type="text" 
                    id="fullName"
                    name="fullName" 
                    value={shippingForm.fullName} 
                    onChange={(e) => handleInputChange(e, 'shipping')} 
                    placeholder="John Doe"
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="field-error">{errors.fullName}</span>}
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email"
                      name="email" 
                      value={shippingForm.email} 
                      onChange={(e) => handleInputChange(e, 'shipping')} 
                      placeholder="johndoe@example.com"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className="input-group">
                    <label htmlFor="phone">Contact Mobile Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone" 
                      value={shippingForm.phone} 
                      onChange={(e) => handleInputChange(e, 'shipping')} 
                      placeholder="9876543210"
                      maxLength={10}
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="field-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="address">Address (House No, Street, Area)</label>
                  <input 
                    type="text" 
                    id="address"
                    name="address" 
                    value={shippingForm.address} 
                    onChange={(e) => handleInputChange(e, 'shipping')} 
                    placeholder="Apartment 4B, 3rd Block, Park Street"
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>

                <div className="input-row-three">
                  <div className="input-group">
                    <label htmlFor="city">City</label>
                    <input 
                      type="text" 
                      id="city"
                      name="city" 
                      value={shippingForm.city} 
                      onChange={(e) => handleInputChange(e, 'shipping')} 
                      placeholder="Mumbai"
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="field-error">{errors.city}</span>}
                  </div>
                  <div className="input-group">
                    <label htmlFor="state">State</label>
                    <input 
                      type="text" 
                      id="state"
                      name="state" 
                      value={shippingForm.state} 
                      onChange={(e) => handleInputChange(e, 'shipping')} 
                      placeholder="Maharashtra"
                      className={errors.state ? 'error' : ''}
                    />
                    {errors.state && <span className="field-error">{errors.state}</span>}
                  </div>
                  <div className="input-group">
                    <label htmlFor="zipCode">6-Digit PIN Code</label>
                    <input 
                      type="text" 
                      id="zipCode"
                      name="zipCode" 
                      value={shippingForm.zipCode} 
                      onChange={(e) => handleInputChange(e, 'shipping')} 
                      placeholder="400001"
                      maxLength={6}
                      className={errors.zipCode ? 'error' : ''}
                    />
                    {errors.zipCode && <span className="field-error">{errors.zipCode}</span>}
                  </div>
                </div>

                <div className="form-footer-nav">
                  <button type="button" className="btn-cancel" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-next">
                    Continue to Payment
                  </button>
                </div>
              </div>

              {/* Order summary sidebar */}
              <div className="checkout-summary-sidebar">
                <h4>Order Summary</h4>
                <div className="summary-items-list">
                  {cartItems.map(item => (
                    <div key={item.product.id} className="summary-item-row">
                      <span className="summary-item-name">{item.product.name} <strong className="summary-qty">x{item.quantity}</strong></span>
                      <span className="summary-item-price">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <hr />
                <div className="summary-calc-box">
                  <div className="calc-item">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="calc-item">
                    <span>GST (18%)</span>
                    <span>₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="calc-item">
                    <span>Delivery</span>
                    <span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                  </div>
                  <div className="calc-item grand-total-item">
                    <span>Total Amount</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <div className="checkout-trust-box">
                  <ShieldIcon size={16} />
                  <span>Secure 256-bit SSL encrypted checkout. ValueBay guarantees verified quality on all pre-owned goods.</span>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="checkout-form-grid">
              <div className="checkout-form-fields">
                <h4>Payment Method</h4>
                
                <div className="payment-options-grid">
                  <label className={`payment-option-card ${paymentForm.method === 'upi' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="method" 
                      value="upi" 
                      checked={paymentForm.method === 'upi'}
                      onChange={(e) => handleInputChange(e, 'payment')}
                    />
                    <div className="payment-option-info">
                      <strong>UPI (Paytm, PhonePe, GPay)</strong>
                      <span>Scan & Pay instantly using secure QR.</span>
                    </div>
                  </label>

                  <label className={`payment-option-card ${paymentForm.method === 'card' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="method" 
                      value="card" 
                      checked={paymentForm.method === 'card'}
                      onChange={(e) => handleInputChange(e, 'payment')}
                    />
                    <div className="payment-option-info">
                      <strong>Credit / Debit Card</strong>
                      <span>Pay securely with Visa, Mastercard, or RuPay.</span>
                    </div>
                  </label>

                  <label className={`payment-option-card ${paymentForm.method === 'cod' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="method" 
                      value="cod" 
                      checked={paymentForm.method === 'cod'}
                      onChange={(e) => handleInputChange(e, 'payment')}
                    />
                    <div className="payment-option-info">
                      <strong>Cash / UPI on Delivery (COD)</strong>
                      <span>Pay directly at your doorstep during delivery (+ ₹50 fee waived).</span>
                    </div>
                  </label>
                </div>

                {/* Sub-form: Credit Card Details */}
                {paymentForm.method === 'card' && (
                  <div className="sub-payment-form card-form fade-in">
                    <div className="input-group">
                      <label htmlFor="cardName">Cardholder Name</label>
                      <input 
                        type="text" 
                        id="cardName"
                        name="cardName" 
                        value={paymentForm.cardName} 
                        onChange={(e) => handleInputChange(e, 'payment')} 
                        placeholder="Johnathan Doe"
                        className={errors.cardName ? 'error' : ''}
                      />
                      {errors.cardName && <span className="field-error">{errors.cardName}</span>}
                    </div>

                    <div className="input-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input 
                        type="text" 
                        id="cardNumber"
                        name="cardNumber" 
                        value={paymentForm.cardNumber} 
                        onChange={(e) => handleInputChange(e, 'payment')} 
                        placeholder="4321 8765 2468 1357"
                        maxLength={16}
                        className={errors.cardNumber ? 'error' : ''}
                      />
                      {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
                    </div>

                    <div className="input-row">
                      <div className="input-group">
                        <label htmlFor="expiry">Expiry Date (MM/YY)</label>
                        <input 
                          type="text" 
                          id="expiry"
                          name="expiry" 
                          value={paymentForm.expiry} 
                          onChange={(e) => handleInputChange(e, 'payment')} 
                          placeholder="12/28"
                          maxLength={5}
                          className={errors.expiry ? 'error' : ''}
                        />
                        {errors.expiry && <span className="field-error">{errors.expiry}</span>}
                      </div>
                      <div className="input-group">
                        <label htmlFor="cvv">CVV Code</label>
                        <input 
                          type="password" 
                          id="cvv"
                          name="cvv" 
                          value={paymentForm.cvv} 
                          onChange={(e) => handleInputChange(e, 'payment')} 
                          placeholder="123"
                          maxLength={3}
                          className={errors.cvv ? 'error' : ''}
                        />
                        {errors.cvv && <span className="field-error">{errors.cvv}</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form: UPI QR Mock Code */}
                {paymentForm.method === 'upi' && (
                  <div className="sub-payment-form upi-qr-form fade-in">
                    <div className="qr-box-mock">
                      {/* Stylized CSS QR Code */}
                      <div className="qr-code-graphic">
                        <div className="qr-corner qr-top-left"></div>
                        <div className="qr-corner qr-top-right"></div>
                        <div className="qr-corner qr-bottom-left"></div>
                        <div className="qr-center-pixels"></div>
                      </div>
                      <span className="qr-merchant-label">UPI ID: valuebay@ybl</span>
                    </div>
                    <p className="qr-instruction">
                      Scan this QR code using any UPI App (Google Pay, BHIM, PhonePe, Paytm) to transfer <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>. The order will process automatically once payment is received.
                    </p>
                  </div>
                )}

                {/* Sub-form: Cash on Delivery */}
                {paymentForm.method === 'cod' && (
                  <div className="sub-payment-form cod-form fade-in">
                    <p className="cod-instruction">
                      ✔ You will pay <strong>₹{grandTotal.toLocaleString('en-IN')}</strong> in cash or via mobile UPI QR to the delivery associate when your shipment arrives. 
                      <br /><br />
                      Please make sure someone is available at the provided mobile number (<strong>{shippingForm.phone}</strong>) to receive and verify the package.
                    </p>
                  </div>
                )}

                <div className="form-footer-nav">
                  <button 
                    type="button" 
                    className="btn-back" 
                    onClick={() => setStep('shipping')}
                    disabled={isProcessing}
                  >
                    Back to Address
                  </button>
                  <button 
                    type="submit" 
                    className="btn-pay" 
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing Payment...' : `Confirm & Pay ₹${grandTotal.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>

              {/* Sidebar review */}
              <div className="checkout-summary-sidebar">
                <h4>Order Summary</h4>
                <div className="summary-calc-box">
                  <div className="calc-item">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="calc-item">
                    <span>GST (18%)</span>
                    <span>₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="calc-item">
                    <span>Delivery</span>
                    <span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                  </div>
                  <div className="calc-item grand-total-item">
                    <span>Grand Total</span>
                    <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: ORDER SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="checkout-success-view">
              {/* Checkmark Animation Wrapper */}
              <div className="success-checkmark-wrapper">
                <div className="checkmark-circle">
                  <CheckIcon size={48} className="checkmark-svg" />
                </div>
                {/* Confetti Elements */}
                <div className="success-particles">
                  <span className="particle p1"></span>
                  <span className="particle p2"></span>
                  <span className="particle p3"></span>
                  <span className="particle p4"></span>
                  <span className="particle p5"></span>
                  <span className="particle p6"></span>
                </div>
              </div>

              <h2>Thank you for your order!</h2>
              <p className="success-desc">
                Your purchase has been placed successfully. We have sent a confirmation email to <strong>{shippingForm.email}</strong>.
              </p>

              <div className="order-details-card">
                <div className="order-details-row">
                  <span>Order Reference:</span>
                  <strong>{orderNumber}</strong>
                </div>
                <div className="order-details-row">
                  <span>Ship To:</span>
                  <span>{shippingForm.fullName}, {shippingForm.city}</span>
                </div>
                <div className="order-details-row">
                  <span>Estimated Delivery:</span>
                  <span className="delivery-est">
                    <TruckIcon size={14} /> 3 Business Days (Express)
                  </span>
                </div>
              </div>

              <div className="success-green-badge">
                ♻ By purchasing certified pre-owned items, you saved approx. <strong>12kg of CO2</strong> from entering the atmosphere!
              </div>

              <button className="btn-finish-checkout" onClick={handleFinish}>
                CONTINUE SHOPPING
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
