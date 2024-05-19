import React, { useState, useEffect } from 'react';
import { sendEmailToAdmin } from '../../MailService/OrderMail';
import ErrorAlert from '../Alerts/Error';
import SuccessAlert from '../Alerts/Success';
import { useFirebase } from '../../contexts/Firebase';

const OrderCard = ({ order, isSeller }) => {
  const [transactionId, setTransactionId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const { markTrannsactionComplete } = useFirebase();

  useEffect(() => {
    console.log("HIIHI")
    if (isOrderComplete === true) {
      setIsOrderComplete(true);
      console.log(isOrderComplete);
    } else {
      console.log(isOrderComplete);
      setIsOrderComplete(false);
    }
  }, [isOrderComplete]);

  console.log('TID', transactionId);
  const handleSubmit = async (transactionId) => {
    setIsSubmitting(true);
    try {
      // Compare the entered transaction ID with the one in the order
      if (Number(transactionId) === order.transactionId) {
        // Transaction ID matches, proceed to send email to admin
        // await sendEmailToAdmin(order);
        // const res = await markTrannsactionComplete(order.id);
        // console.log(res);
        setIsOrderComplete(true);
        // if (res === 'success') {
        // }
        // Display success message or any other action
        setSuccessMessage('Transaction ID matched. Email sent to admin.');
        setIsSubmitting(false);
      } else {
        // Transaction ID doesn't match, display error message or any other action
        setErrorMessage('Transaction ID does not match.');
      }
    } catch (error) {
      // Handle error if sending email fails
      setErrorMessage('Error sending email to admin:', error);
    }
  };

  const handleChange = (e) => {
    setTransactionId(e.target.value);
  };
  return (
    <>
      <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
      <SuccessAlert
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
      <div className='flex flex-col pb-8 justify-center items-center'>
        <div
          id='productdetails'
          className='mt-2 flex flex-col gap-3 bg-white justify-center items-center w-auto'
        >
          <div className='justify-start items-start flex flex-col gap-4 max-w-[64rem] bg-[#f9f9f9] px-10 rounded-xl py-4'>
            <h2 className='text-2xl font-semibold mt-4 mb-2'>Order Details</h2>
            <div className='justify-start items-start flex flex-wrap gap-10 max-w-[64rem] py-4 rounded-xl'>
              <div>
                <label htmlFor='productName' className='block mb-2'>
                  Order ID
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.order.orderID}
                </p>
              </div>
              <div>
                {isSeller ? (
                  <div>
                    <label htmlFor='transactionId' className='block mb-2'>
                      Transaction Id
                    </label>
                    {isOrderComplete === false ? (
                      <div>
                        <input
                          type='text'
                          id='transactionId'
                          className='w-[18rem] px-2 py-2 mr-2 rounded-md text-sm'
                          placeholder='Enter Transaction ID'
                          value={transactionId}
                          onChange={handleChange}
                        />
                        <button
                          className={`bg-blue-900 text-white px-4 py-2 rounded-md mt-2 ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleSubmit(transactionId)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className='w-[18rem] py-2 rounded-md text-xl'>
                          {order.transactionId}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label htmlFor='transactionId' className='block mb-2'>
                      Transaction Id
                    </label>
                    <p className='w-[18rem] py-2 rounded-md text-xl'>
                      {order.transactionId}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor='productName' className='block mb-2'>
                  Amount
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  ₹{order.product.price}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div
          id='productdetails'
          className='mt-2 flex flex-col gap-3 bg-white justify-center items-center w-auto'
        >
          <div className='justify-start items-start flex flex-col gap-4 max-w-[64rem] bg-[#f9f9f9] px-10 rounded-xl py-4'>
            <h2 className='text-2xl font-semibold mt-4 mb-2'>
              Product Details
            </h2>
            <div className='justify-start items-start flex flex-wrap gap-4 max-w-[64rem] py-4 rounded-xl'>
              <div>
                <label htmlFor='productName' className='block mb-2'>
                  Item
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.product.items.toUpperCase()}
                </p>
              </div>{' '}
              <div>
                <label htmlFor='productName' className='block mb-2'>
                  Company
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.product.company}
                </p>
              </div>{' '}
              <div>
                <label htmlFor='productName' className='block mb-2'>
                  Condition
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.product.condition.toUpperCase()}
                </p>
              </div>
              <div>
                <label htmlFor='productPrice' className='block mb-2'>
                  Price
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  ₹{order.product.price}
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Buyer Details */}
        <div
          id='buyerdetails'
          className='mt-2 flex flex-col gap-3 bg-white justify-center items-center w-auto'
        >
          <div className='justify-start items-start flex flex-col gap-4 max-w-[64rem] bg-[#f9f9f9] px-10 rounded-xl py-4'>
            <h2 className='text-2xl font-semibold mt-4 mb-2'>Buyer Details</h2>
            <div className='justify-start items-start flex flex-wrap gap-4 max-w-[64rem] py-4 rounded-xl'>
              <div>
                <label htmlFor='buyerName' className='block mb-2'>
                  Name
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl text-xl'>
                  {order.buyer.name}
                </p>
              </div>
              <div>
                <label htmlFor='buyerEmail' className='block mb-2'>
                  Email
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl text-xl'>
                  {order.buyer.email}
                </p>
              </div>
              <div>
                <label htmlFor='buyerMobile' className='block mb-2'>
                  Mobile Number
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl text-xl'>
                  {order.buyer.mobileNumber}
                </p>
              </div>
              <div>
                <label htmlFor='buyerCollege' className='block mb-2'>
                  College Name
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl text-xl'>
                  {order.buyer.collegeName}
                </p>
              </div>
              <div>
                <label htmlFor='buyerSemester' className='block mb-2'>
                  Semester
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl text-xl'>
                  {order.buyer.collegeSemester}
                </p>
              </div>
              <div>
                <label htmlFor='buyerBranch' className='block mb-2'>
                  Branch
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl text-xl'>
                  {order.buyer.collegeBranch}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Details */}
        <div
          id='sellerdetails'
          className='mt-2 flex flex-col gap-3 bg-white justify-center items-center w-auto'
        >
          <div className='justify-start items-start flex flex-col gap-4 max-w-[64rem] bg-[#f9f9f9] px-10 rounded-xl py-4'>
            <h2 className='text-2xl font-semibold mt-4 mb-2'>Seller Details</h2>
            <div className='justify-start items-start flex flex-wrap gap-4 max-w-[64rem] py-4 rounded-xl'>
              <div>
                <label htmlFor='sellerName' className='block mb-2'>
                  Name
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.seller.name}
                </p>
              </div>
              <div>
                <label htmlFor='sellerEmail' className='block mb-2'>
                  Email
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.seller.email}
                </p>
              </div>
              <div>
                <label htmlFor='sellerMobile' className='block mb-2'>
                  Mobile Number
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.seller.mobileNumber}
                </p>
              </div>
              <div>
                <label htmlFor='sellerCollege' className='block mb-2'>
                  College Name
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.seller.collegeName}
                </p>
              </div>
              <div>
                <label htmlFor='sellerSemester' className='block mb-2'>
                  Semester
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.seller.collegeSemester}
                </p>
              </div>
              <div>
                <label htmlFor='sellerBranch' className='block mb-2'>
                  Branch
                </label>
                <p className='w-[18rem] py-2 rounded-md text-xl'>
                  {order.seller.collegeBranch}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderCard;
