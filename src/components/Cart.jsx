import React, { useContext } from 'react';
import CartContext from './CartContext';

const Cart = ({ checkout }) => {
  const { cartItems } = useContext(CartContext);

  if (!cartItems) {
    // Handle the case when cartItems is undefined
    return <div>Your cart is empty.</div>;
  }

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="cart">
      <h2>Cart Summary</h2>
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>
            {item.name} x {item.quantity} - ${item.price * item.quantity}
          </li>
        ))}
      </ul>
      <p>Total Price: ${totalPrice.toFixed(2)}</p>
      <button onClick={checkout}>Checkout</button>
    </div>
  );
};

export default Cart;
import React, { useState } from 'react';
import { CartProvider } from './CartContext'; // Import CartProvider
import Product from './Product';
import Cart from './Cart';
import Checkout from './Checkout';

const App = () => {
  const [checkoutStarted, setCheckoutStarted] = useState(false);

  const handleCheckout = () => {
    setCheckoutStarted(true);
  };

  const handleProcessOrder = (orderDetails) => {
    // Replace with actual order processing logic
    console.log('Order processed:', orderDetails);
    setCheckoutStarted(false);
  };

  const product = {
    name: 'COVID-19 Test Kit',
    description: 'A reliable test kit for COVID-19.',
    price: 49.99,
  };

  return (
    <CartProvider>
      <div className="app">
        <header>
          <h1>Order Test Kits</h1>
        </header>
        <main>
          <Product product={product} />
          {checkoutStarted ? (
            <Checkout processOrder={handleProcessOrder} />
          ) : (
            <Cart checkout={handleCheckout} />
          )}
        </main>
        <footer>
          <p>&copy; 2024 Test Kit Company</p>
        </footer>
      </div>
    </CartProvider>
  );
};

export default App;
