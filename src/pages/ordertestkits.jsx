import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ordertestkits.css';

// Test Kit Selection Component
const TestKitSelection = ({ kits, selectedKits, setSelectedKits, nextStep }) => {
  const handleSelectKit = (kit) => {
    const existingKit = selectedKits.find((k) => k.id === kit.id);
    if (existingKit) {
      setSelectedKits((prev) =>
        prev.map((k) =>
          k.id === kit.id ? { ...k, quantity: k.quantity + 1 } : k
        )
      );
    } else {
      setSelectedKits((prev) => [...prev, { ...kit, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (kitId, quantity) => {
    setSelectedKits((prev) =>
      prev.map((k) =>
        k.id === kitId ? { ...k, quantity: parseInt(quantity) || 1 } : k
      )
    );
  };

  return (
    <div className="selection-container">
      <h2>Select Test Kits</h2>
      <ul className="kits-list">
        {kits.map((kit) => (
          <li key={kit.id} className="kit-item">
            <span className="kit-name" onClick={() => handleSelectKit(kit)}>{kit.name} - ${kit.price}</span>
            {selectedKits.some((k) => k.id === kit.id) && (
              <input
                type="number"
                min="1"
                value={selectedKits.find((k) => k.id === kit.id)?.quantity || 1}
                onChange={(e) => handleQuantityChange(kit.id, e.target.value)}
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
        {selectedKits.map((kit) => (
          <li key={kit.id}>
            {kit.name} - ${kit.price} x {kit.quantity}
          </li>
        ))}
      </ul>
      <button id="back" className="btn" onClick={prevStep}>Back</button>
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
      <button id="back" className="btn" onClick={prevStep}>Back</button>
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

  const handleSubmit = () => {
    const orderNumber = generateOrderNumber();
    completeOrder(paymentMethod, paymentDetails, orderNumber);
    nextStep();
  };

  const generateOrderNumber = () => {
    return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
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
      <button id="back" className="btn" onClick={prevStep}>Back</button>
      <button className="btn" onClick={handleSubmit}>Place Order</button>
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
      <p>Estimated Delivery: 3-5 business days</p>
    </div>
  );
};

// Checkout Steps Component
const CheckoutSteps = () => {
  const [step, setStep] = useState(1);
  const [kits, setKits] = useState([]);
  const [selectedKits, setSelectedKits] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({ address: '', phone: '', email: '' });
  const [orderDetails, setOrderDetails] = useState({});

  useEffect(() => {
    fetchTestKits();
  }, []);

  const fetchTestKits = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/testkits');
      setKits(response.data);
    } catch (error) {
      console.error('Error fetching test kits:', error);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const completeOrder = async (paymentMethod, paymentDetails, orderNumber) => {
    try {
      const response = await axios.post('http://localhost:3001/api/orders', {
        selectedKits,
        shippingInfo,
        paymentMethod,
        paymentDetails,
        orderNumber
      });
      setOrderDetails(response.data);
    } catch (error) {
      console.error('Error placing order:', error);
    }
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