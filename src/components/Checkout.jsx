import React, { useState } from 'react';

const Checkout = ({ processOrder }) => {
  const [orderDetails, setOrderDetails] = useState({
    name: '',
    email: '',
    address: '',
    paymentInfo: '',
  });

  const handleChange = (e) => {
    setOrderDetails({ ...orderDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processOrder(orderDetails);
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <h2>Checkout</h2>
      <input
        name="name"
        placeholder="Name"
        value={orderDetails.name}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={orderDetails.email}
        onChange={handleChange}
        required
      />
      <input
        name="address"
        placeholder="Shipping Address"
        value={orderDetails.address}
        onChange={handleChange}
        required
      />
      <input
        name="paymentInfo"
        placeholder="Payment Information"
        value={orderDetails.paymentInfo}
        onChange={handleChange}
        required
      />
      <button type="submit">Submit Order</button>
    </form>
  );
};

export default Checkout;
