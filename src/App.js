import React from 'react';
import Home from './components/HeroSection/Hero';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/Signup';
import SellerInfo from './components/UserInfo/SellerInfo';
import BuyerInfo from './components/UserInfo/BuyerInfo';
import { Routes, Route } from 'react-router-dom';
import ProductList from './components/Products/Listing';
import Order from './components/Orders/Order';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<SignUp />} />
      {/* <Route path='/buyerinfo' element={<BuyerInfo />} /> */}
      <Route path='/sellerinfo' element={<SellerInfo />} />
      <Route path='/products' element={<ProductList />} />
      {/* <Route path='/orders' element={<Order />} /> */}
    </Routes>
  );
}

export default App;
