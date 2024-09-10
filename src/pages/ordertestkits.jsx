import React, { useState } from 'react';
import './ordertestkits.css';

// Test Kit Selection Component
const TestKitSelection = ({ kits, selectedKits, setSelectedKits, nextStep }) => {
  const handleSelectKit = (kit) => {
    const existingKit = selectedKits.find((k) => k.name === kit.name);
    if (existingKit) {
      setSelectedKits((prev) =>
        prev.map((k) =>
          k.name === kit.name ? { ...k, quantity: k.quantity + 1 } : k
        )
      );
    } else {
      setSelectedKits((prev) => [...prev, { ...kit, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (kitName, quantity) => {
    setSelectedKits((prev) =>
      prev.map((k) =>
        k.name === kitName ? { ...k, quantity: parseInt(quantity) || 1 } : k
      )
    );
  };

  return (
    <div className="selection-container">
      <h2>Select Test Kits</h2>
      <ul className="kits-list">
        {kits.map((kit, index) => (
          <li key={index} className="kit-item">
            <span className="kit-name" onClick={() => handleSelectKit(kit)}>{kit.name} - {kit.price}</span>
            {selectedKits.some((k) => k.name === kit.name) && (
              <input
                type="number"
                min="1"
                value={selectedKits.find((k) => k.name === kit.name)?.quantity || 1}
                onChange={(e) => handleQuantityChange(kit.name, e.target.value)}
                className="quantity-input"
              />
            )}
          </li>
        ))}
      </ul>
      <button className="btn" onClick={nextStep}>Proceed to Review</button>
    </div>
  );
};

// Review and Confirm Component
const ReviewAndConfirm = ({ selectedKits, prevStep, nextStep }) => {
  return (
    <div className="review-container">
      <h2>Review and Confirm</h2>
      <ul className="review-list">
        {selectedKits.map((kit, index) => (
          <li key={index}>
            {kit.name} - {kit.price} x {kit.quantity}
          </li>
        ))}
      </ul>
      <button className="btn" onClick={prevStep}>Back</button>
      <button className="btn" onClick={nextStep}>Proceed to Shipping</button>
    </div>
  );
};

// Shipping Information Component
const ShippingInformation = ({ shippingInfo, setShippingInfo, prevStep, nextStep }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo({ ...shippingInfo, [name]: value });
  };

  return (
    <div className="shipping-container">
      <h2>Shipping Information</h2>
      <form className="shipping-form">
        <input name="address" placeholder="Address" onChange={handleChange} value={shippingInfo.address} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} value={shippingInfo.phone} required />
        <input name="email" placeholder="Email" onChange={handleChange} value={shippingInfo.email} required />
      </form>
      <button className="btn" onClick={prevStep}>Back</button>
      <button className="btn" onClick={nextStep}>Proceed to Payment</button>
    </div>
  );
};

// Payment Options Component
const PaymentOptions = ({ prevStep, nextStep, completeOrder }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({ cardNumber: '', expiry: '', cvv: '', mpesaNumber: '', paypalEmail: '' });

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  return (
    <div className="payment-container">
      <h2>Payment Options</h2>
      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="Stripe"
            checked={paymentMethod === 'Stripe'}
            onChange={() => handlePaymentMethodChange('Stripe')}
          />
          Pay with Stripe
        </label>
        {paymentMethod === 'Stripe' && (
          <div className="payment-details">
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="expiry"
              placeholder="Expiry Date"
              value={paymentDetails.expiry}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={paymentDetails.cvv}
              onChange={handleChange}
              required
            />
          </div>
        )}
      </div>
      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="PayPal"
            checked={paymentMethod === 'PayPal'}
            onChange={() => handlePaymentMethodChange('PayPal')}
          />
          Pay with PayPal
        </label>
        {paymentMethod === 'PayPal' && (
          <input
            type="email"
            name="paypalEmail"
            placeholder="PayPal Email"
            value={paymentDetails.paypalEmail}
            onChange={handleChange}
            required
          />
        )}
      </div>
      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="Mpesa"
            checked={paymentMethod === 'Mpesa'}
            onChange={() => handlePaymentMethodChange('Mpesa')}
          />
          Pay with Mpesa
        </label>
        {paymentMethod === 'Mpesa' && (
          <input
            type="text"
            name="mpesaNumber"
            placeholder="Mpesa Number"
            value={paymentDetails.mpesaNumber}
            onChange={handleChange}
            required
          />
        )}
      </div>
      <button className="btn" onClick={prevStep}>Back</button>
      <button className="btn" onClick={() => { completeOrder(); nextStep(); }}>Place Order</button>
    </div>
  );
};

// Order Confirmation Component
const OrderConfirmation = ({ orderDetails }) => {
  return (
    <div className="confirmation-container">
      <h2>Order Confirmation</h2>
      <p>Thank you for your order!</p>
      <p>Order Number: {orderDetails.orderNumber}</p>
      <p>Estimated Delivery: {orderDetails.estimatedDelivery}</p>
    </div>
  );
};

// Checkout Steps Component
const CheckoutSteps = () => {
  const [step, setStep] = useState(1);
  const [selectedKits, setSelectedKits] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({ address: '', phone: '', email: '' });
  const [orderDetails, setOrderDetails] = useState({});

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const kits = [
    { name: 'COVID-19 Test Kit', price: '$30' },
    { name: 'Blood Test Kit', price: '$25' },
    { name: 'DNA Test Kit', price: '$50' },
    // Add more kits here
  ];

  const completeOrder = () => {
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderDetails({
      orderNumber,
      estimatedDelivery: '3-5 business days'
    });
  };

  switch (step) {
    case 1:
      return <TestKitSelection kits={kits} selectedKits={selectedKits} setSelectedKits={setSelectedKits} nextStep={nextStep} />;
    case 2:
      return <ReviewAndConfirm selectedKits={selectedKits} prevStep={prevStep} nextStep={nextStep} />;
    case 3:
      return <ShippingInformation shippingInfo={shippingInfo} setShippingInfo={setShippingInfo} prevStep={prevStep} nextStep={nextStep} />;
    case 4:
      return <PaymentOptions prevStep={prevStep} nextStep={nextStep} completeOrder={completeOrder} />;
    case 5:
      return <OrderConfirmation orderDetails={orderDetails} />;
    default:
      return null;
  }
};

const App = () => {
  return (
    <div className="App">
      <h1>Test Kit Order System</h1>
      <CheckoutSteps />
    </div>
  );
};

export default App;
