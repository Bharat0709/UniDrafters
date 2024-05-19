import React, { useState, useEffect } from 'react';
import { useFirebase } from '../../contexts/Firebase';
import OrderCard from './OrderCard';
import ErrorAlert from '../Alerts/Error';
import SuccessAlert from '../Alerts/Success';
import { NavLink } from 'react-router-dom';
import Profile from '../Profileheader/Profileheader';

const Order = () => {
  const { user, fetchOrders } = useFirebase();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) {
        setLoading(true);
        // navigate('/signup');x
      }
      if (user) {
        setLoading(true);
        try {
          const userOrders = await fetchOrders(
            user.uid,
            setIsSeller,
            setLoading
          );

          if (userOrders) {
            setOrders(userOrders);
            setSuccessMessage('Orders Found');
          } else {
            // Redirect to products if no orders found
            setErrorMessage('No orders found.');
          }
        } catch (error) {
          // Handle error
          setErrorMessage('Error Fetching Your Order');
          console.error('Error fetching user orders:', error.message);
        }
      }
    };

    fetchUserOrders();
  }, [user]);

  return (
    <>
      <Profile />
      <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
      <div className='order-container'>
        <div className='text-4xl flex justify-center text-center font-semibold mb-3 mt-2  p-10'>
          My Orders
        </div>
        {loading ? (
          <p className='text-1xl text-center mb-4  p-10'>Loading orders...</p>
        ) : (
          <div className='orders'>
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderCard key={order.id} order={order} isSeller={isSeller} />
              ))
            ) : (
              <p className='text-1xl text-red-400 text-center mb-4  p-10'>
                No orders found.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Order;
