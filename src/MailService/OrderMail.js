// emailService.js

const sendEmailToSeller = async (sellerEmail, buyerDetails) => {
  const response = await fetch(
    `http://localhost:8000/submit/seller/${sellerEmail}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buyerDetails),
    }
  );

  if (response.ok) {
    console.log('Email sent to seller successfully');
  } else {
    console.error('Failed to send email to seller');
  }
};

const sendEmailToBuyer = async (buyerEmail, sellerDetails) => {
  console.log(sellerDetails);
  const response = await fetch(
    `http://localhost:8000/submit/buyer/${buyerEmail}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sellerDetails),
    }
  );

  if (response.ok) {
    console.log('Email sent to buyer successfully');
    return 'success';
  } else {
    console.error('Failed to send email to buyer');
    return 'failed';
  }
};

const sendEmailToAdmin = async (orderDetails) => {
  console.log(orderDetails);
  const response = await fetch(
    `http://localhost:8000/submit/admin/ipudrafters@gmail.com`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderDetails),
    }
  );

  if (response.ok) {
    console.log('Email sent to Adminsuccessfully');
    return 'success';
  } else {
    console.error('Failed to send email to Admin');
    return 'failed';
  }
};

export { sendEmailToSeller, sendEmailToBuyer, sendEmailToAdmin };
