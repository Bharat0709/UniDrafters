import React, { useEffect, useState } from 'react';
import { useFirebase } from '../../contexts/Firebase';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import Profileheader from '../Profileheader/Profileheader';
import { useNavigate } from 'react-router-dom';
import { sendEmailToBuyer } from '../../MailService/OrderMail';
import { sendEmailToSeller } from '../../MailService/OrderMail';
import ErrorAlert from '../Alerts/Error';
import SuccessAlert from '../Alerts/Success';
import Logo from '../../assets/images/LogoIcon.png';

const ProductList = () => {
  const {
    getProducts,
    user,
    checkUserProfile,
    getProductDetailsforOrders,
    getProductAmountforOrder,
    handleCreateOrder,
    checkOrders,
    markProductAsSold,
  } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [priceFilter, setPriceFilter] = useState(null);
  const [productTypeFilter, setProductTypeFilter] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [buyDisabled, setBuyDisabled] = useState();
  const [successMessage, setSuccessMessage] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [identity, setIdentity] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!user || user === null) {
          setLoading(true);
          navigate('/signup');
        } else if (user && loading) {
          const profileExists = await checkUserProfile(user.uid, setLoading);
          if (profileExists) {
            setUserDetails(profileExists);
            setIdentity(profileExists.identity);
          } else {
            setErrorMessage('User Not Found');
          }
          if (profileExists.identity === 'seller') {
            setBuyDisabled(true);
          } else {
            setBuyDisabled(false);
          }
        }
      } catch (error) {
        setErrorMessage('Error Checking User Profile');
      }
    };
    checkUser();
  }, [user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (userDetails) {
          const CollegeName = userDetails.collegeName;
          if (CollegeName) {
            const productsData = await getProducts(CollegeName);
            if (productsData.length === 0) {
              setErrorMessage(`No Products found for ${CollegeName} College!`);
            } else {
              setProducts(productsData);
              console.log(productsData);
              setLoading(false);
            }
          }
        }
      } catch (error) {
        setErrorMessage('Error Fetching Please Try Again Later');
      }
    };

    fetchProducts();
  }, [userDetails]);

  useEffect(() => {
    const fetchProductImages = async () => {
      const updatedProducts = await Promise.all(
        products.map(async (product) => {
          if (product.imageURL1) {
            try {
              const imageUrl = await renderProductImages(product);
              return { ...product, imageUrl };
            } catch (error) {
              console.error(`Error fetching image`, error.message);
              return { ...product, imageUrl: null };
            }
          } else {
            return { ...product, imageUrl: null };
          }
        })
      );
      setProducts(updatedProducts);
    };
    fetchProductImages();
  }, [products]);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) {
        setLoading(true);
      }
      if (user) {
        setLoading(true);
        try {
          const userOrders = await checkOrders(user.uid, setLoading);
          console.log(userOrders);
          if (userOrders === true) {
            setBuyDisabled(true);
          }
        } catch (error) {
          // Handle error
          console.error('Error fetching user orders:', error.message);
        }
      }
    };

    fetchUserOrders();
  }, [user]);

  const renderProductImages = async (product) => {
    const storage = getStorage();
    try {
      const imageUrl = await getDownloadURL(ref(storage, product.imageURL1));
      return imageUrl; // Return the image URL
    } catch (error) {
      console.error(`Error fetching image`, error.message);
      throw error; // Throw the error to handle it in fetchProductImages
    }
  };

  const applyPriceFilter = (products) => {
    if (priceFilter === 'lowToHigh') {
      return products.slice().sort((a, b) => a.minimumPrice - b.minimumPrice);
    } else if (priceFilter === 'highToLow') {
      return products.slice().sort((a, b) => b.minimumPrice - a.minimumPrice);
    } else {
      return products;
    }
  };

  const applyProductTypeFilter = (products) => {
    if (productTypeFilter) {
      return products.filter((product) => product.item === productTypeFilter);
    } else {
      return products;
    }
  };

  const filteredProducts = applyProductTypeFilter(applyPriceFilter(products));

  const handleOrder = async (product) => {
    setBuyDisabled(true);
    const productAmount = await getProductAmountforOrder(
      product.id,
      setLoading
    );
    if (
      (productAmount !== null || productAmount !== undefined) &&
      productAmount === product.minimumPrice &&
      userDetails !== null &&
      product.isSold === false
    ) {
      const response = await fetch(
        'https://unidrafters-server.onrender.com/api/v1/order/createorder',
        {
          method: 'POST',
          body: JSON.stringify({
            amount: productAmount * 100,
            currency: 'INR',
            receipt: 'woqqpq',
          }),
          headers: {
            'Content-type': 'application/json',
          },
        }
      );
      if (!response) {
        setErrorMessage('Error Creating Your Order Please try again!!');
        setBuyDisabled(false);
        return;
      }
      const order = await response.json();
      if (!order) {
        setErrorMessage('Error Creating Your Order Please try again!!');
        setBuyDisabled(false);
        return;
      }
      const sellerDetails = await getProductDetailsforOrders(
        product.id,
        setLoading
      );
      var options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: productAmount,
        currency: 'INR',
        name: 'IPU Drafters',
        description: 'Test Transaction',
        image: Logo,
        order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: async function (response) {
          const isSoldresponse = await markProductAsSold(
            product.id,
            setLoading
          );
          const orderResponse = await handleCreateOrder(
            userDetails,
            sellerDetails,
            response.razorpay_order_id,
            response.razorpay_payment_id
          );
          if (orderResponse === 'success') {
            setSuccessMessage('Order Created Succesfully');
          } else {
            setErrorMessage('Error Saving Order Details');
          }

          await sendEmailToBuyer(
            userDetails.email,
            sellerDetails,
            setSuccessMessage
          );
          await sendEmailToSeller(
            sellerDetails.email,
            userDetails,
            setSuccessMessage
          );

          if (isSoldresponse === 'success') {
            navigate('/products');
            setSuccessMessage(
              'Order Placed Successfully ! Check your mail for further Details'
            );
          } else {
            setErrorMessage(
              'Error Sending Seller Details! Please Visit Orders Page'
            );
          }
          setBuyDisabled(true);
        },
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.mobileNumber,
        },
        notes: {
          address: 'Razorpay Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      };
      if (sellerDetails) {
        var rzp1 = new window.Razorpay(options);
      } else {
        setErrorMessage("Can't Process Payments Please Try Again Later!");
        return;
      }
      rzp1.on('payment.failed', function (response) {
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
        setBuyDisabled(false);
      });

      rzp1.open();
      if (!rzp1) {
        setBuyDisabled(false);
      }
    } else {
      setBuyDisabled(false);
      setErrorMessage('Error Getting Product Details!! Please try again');
    }
  };

  return (
    <div className='products-container'>
      <div className='full'>
        <ErrorAlert
          message={errorMessage}
          onClose={() => setErrorMessage('')}
        />
        <SuccessAlert
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />
        <Profileheader />
      </div>
      <p className='bg-blue-50 text-center text-blue-800 font-medium pt-3 p-2 text-[1rem]'>
        Note: Hover or click on the image to see its actual size.
      </p>
      <div className='Filters w-full  flex justify-center items-center gap-4 p-6 px-10 bg-white'>
        <label className='w-max items-center  flex flex-wrap'>
          Price:
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className='p-2 xl:md:lg:ml-2 border-none rounded-md bg-[#f9f9f9]'
          >
            <option value=''>All</option>
            <option value='lowToHigh'>Low to High</option>
            <option value='highToLow'>High to Low</option>
          </select>
        </label>
        <label className='w-max items-center flex flex-wrap'>
          Product Type:
          <select
            value={productTypeFilter}
            onChange={(e) => setProductTypeFilter(e.target.value)}
            className='p-2 w-min border-none xl:md:lg:ml-2 rounded-md bg-[#f9f9f9]'
          >
            <option value=''>All</option>
            <option value='draftersheetholder'>Drafter + Sheetholder</option>
            <option value='drafter'>Drafter Only</option>
            <option value='sheetholder'>Sheetholder Only</option>
          </select>
        </label>
      </div>

      <div className='grid bg-gray-100 p-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {loading ? (
          <p className='text-center w-screen justify-center self-center items-center'>
            Loading...
          </p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className=' flex flex-col text-sm bg-white justify-start items-start rounded-md p-4'
            >
              {product.imageUrl ? (
                <div className='flex flex-wrap'>
                  <img
                    src={product.imageUrl}
                    alt={`Product ${product.name}`}
                    className='w-screen rounded-md h-[18rem] hover-zoom mb-3'
                  />
                </div>
              ) : (
                <p className='text-center w-full p-2'>No images available </p>
              )}
              <div className='flex rounded-md font-medium  bg-white justify-center mt-1 mb-1 w-full px-2 p-2'>
                <p className='font-medium text-md px-6 p-2 rounded-md bg-gradient-to-r from-blue-100 to-cyan-100  text-blue-950'>
                  {product.item === 'draftersheetholder'
                    ? 'Drafter + Sheetholder'
                    : product.item === 'drafter'
                    ? 'Drafter Only'
                    : product.item === 'sheetholder'
                    ? 'Sheetholder Only'
                    : ''}
                </p>
              </div>
              <div className='p-2 rounded-md w-full flex flex-col bg-gray-100'>
                <div className='w-full rounded-md  bg-white flex justify-between px-2 mt-1 mb-1 p-1 '>
                  <p> Company: </p>
                  <p className='font-medium text-sm  text-blue-950'>
                    {' '}
                    {product.company.length > 10
                      ? product.company.substring(0, 15) + '...'
                      : product.company}
                  </p>
                </div>
                <div className='rounded-md bg-white w-full px-2 mt-1 mb-1 p-1 flex justify-between'>
                  <p>Condition: </p>
                  <span className=' font-medium text-sm  text-blue-950'>
                    {product.condition === 'likeNew'
                      ? 'Like New'
                      : product.condition.charAt(0).toUpperCase() +
                        product.condition.slice(1)}
                  </span>
                </div>
                <div className='rounded-md  bg-white w-full px-2 mt-1 mb-1 p-1 flex justify-between'>
                  <p>College:</p>
                  <p className='font-medium text-sm  text-blue-950'>
                    {product.collegeName}
                  </p>{' '}
                </div>
              </div>
              <div className='flex justify-between items-center w-full'>
                <div className='flex gap-2 items-end py-3'>
                  <p className='text-black mb-2 mt-2 p-1  text-2xl font-semibold w-min rounded-full'>
                    ₹{product.minimumPrice}
                  </p>
                  <p className='text-black line-through opacity-80 mb-3 mt-2 p-1  font-medium w-min rounded-full'>
                    ₹{product.maximumRetailPrice}
                  </p>
                </div>
                <div className='text-white rounded-md font-medium text-sm bg-gradient-to-r from-blue-800 to-indigo-900 p-2 px-3'>
                  {(
                    ((product.maximumRetailPrice - product.minimumPrice) /
                      product.maximumRetailPrice) *
                    100
                  ).toFixed(0)}
                  % OFF
                </div>
              </div>
              <div className='flex justify-center'>
                <button
                  onClick={() => {
                    setSuccessMessage('Sale Live Soon! Stay Tuned!');
                  }}
                  disabled={false}
                  className={`rounded-full bg-gradient-to-r from-slate-900 to-slate-700 text-white px-5 py-2 ${
                    buyDisabled || product.isSold
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {product.isSold ? 'Sold Out' : 'Buy Now'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductList;
