import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATA_BASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECTID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENTID,
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const FirebaseContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(firebaseAuth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });
  }, []);

  const handleCreateBuyerInfo = async (buyerInfo) => {
    try {
      await addDoc(collection(firestore, 'buyers'), {
        userId: user.uid,
        email: user.email,
        name: buyerInfo.name,
        mobileNumber: buyerInfo.mobileNumber,
        collegeName: buyerInfo.collegeName,
        collegeYear: buyerInfo.collegeYear,
        collegeBranch: buyerInfo.collegeBranch,
        identity: 'buyer',
      });
      return 'success';
    } catch (error) {
      console.error('Error uploading buyer information:', error.message);
      return error;
    }
  };

  const generateUniqueID = () => {
    const randomNumber = Math.floor(Math.random() * 9000000000) + 1000000000; // Generate random number between 1000000000 and 9999999999
    return randomNumber; // Concatenate timestamp and random number
  };

  const handleCreateOrder = async (
    buyerDetails,
    sellerDetails,
    orderID,
    paymentID
  ) => {
    try {
      await addDoc(collection(firestore, 'orders'), {
        sellerId: sellerDetails.userId,
        buyerId: buyerDetails.userId,
        isOrderComplete: false,
        transactionId: generateUniqueID(),
        order: {
          orderID,
          paymentID,
        },
        buyer: {
          name: buyerDetails.name,
          email: buyerDetails.email,
          mobileNumber: buyerDetails.mobileNumber,
          collegeName: buyerDetails.collegeName,
          collegeBranch: buyerDetails.collegeBranch,
          collegeSemester: buyerDetails.collegeYear,
        },
        seller: {
          name: sellerDetails.name,
          email: sellerDetails.email,
          mobileNumber: sellerDetails.mobileNumber,
          collegeName: sellerDetails.collegeName,
          collegeBranch: sellerDetails.collegeBranch,
          collegeSemester: sellerDetails.collegeYear,
        },
        product: {
          company: sellerDetails.company,
          condition: sellerDetails.condition,
          image: sellerDetails.imageURL1,
          price: sellerDetails.minimumPrice,
          items: sellerDetails.item,
        },
      });
      return 'success';
    } catch (error) {
      console.error('Error uploading order information:', error.message);
      return error;
    }
  };

  const fetchOrders = async (userId, setIsSeller, setLoading) => {
    try {
      const ordersSnapshot = await getDocs(
        query(collection(firestore, 'orders'), where('buyerId', '==', userId))
      );
      const userOrders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLoading(false);
      if (userOrders.length > 0) {
        setIsSeller(false);
        return userOrders;
      } else {
        const sellerOrdersSnapshot = await getDocs(
          query(
            collection(firestore, 'orders'),
            where('sellerId', '==', userId)
          )
        );
        const sellerOrders = sellerOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLoading(false);
        setIsSeller(true);
        return sellerOrders;
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      setLoading(false);
    }
  };

  const checkOrders = async (userId, setLoading) => {
    try {
      const ordersSnapshot = await getDocs(
        query(collection(firestore, 'orders'), where('buyerId', '==', userId))
      );
      const userOrders = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLoading(false);
      if (userOrders.length > 0) {
        return true;
      } else {
        const sellerOrdersSnapshot = await getDocs(
          query(
            collection(firestore, 'orders'),
            where('sellerId', '==', userId)
          )
        );
        const sellerOrders = sellerOrdersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (sellerOrders.length > 0) {
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error.message);
      setLoading(false);
    }
  };

  const handleCreateSellerInfo = async (sellerInfo) => {
    try {
      // Check if at least one image is provided
      if (!sellerInfo.photos || sellerInfo.photos.length === 0) {
        return 'nopics';
      }

      // Upload images
      const uploadImage = async (image, index) => {
        if (!image) return null; // Skip if no image provided
        const imageRef = ref(
          storage,
          `uploads/images/${Date.now()}-${image.name}`
        );
        const uploadResult = await uploadBytes(imageRef, image);
        return uploadResult.ref.fullPath;
      };

      const imageURLs = await Promise.all(
        sellerInfo.photos.map((photo, index) => uploadImage(photo, index))
      );

      // Add document to Firestore
      await addDoc(collection(firestore, 'sellers'), {
        name: sellerInfo.name,
        userId: user.uid,
        email: sellerInfo.email,
        item: sellerInfo.items,
        mobileNumber: sellerInfo.mobileNumber,
        collegeName: sellerInfo.collegeName,
        collegeYear: sellerInfo.collegeYear,
        collegeBranch: sellerInfo.collegeBranch,
        imageURL1: imageURLs[0] || null,
        imageURL2: imageURLs[1] || null,
        imageURL3: imageURLs[2] || null,
        condition: sellerInfo.condition,
        company: sellerInfo.company,
        maximumRetailPrice: sellerInfo.maximumRetailPrice,
        minimumPrice: sellerInfo.minimumPrice,
        isSold: false,
        identity: 'seller',
      });
      console.log('Seller info created successfully.');
      return 'success';
    } catch (error) {
      console.error('Error creating seller info:', error.message);
      return error;
    }
  };

  const checkUserProfile = async (userId, setLoading) => {
    if (userId) {
      setLoading(true);
      try {
        // Check if the user ID exists in the buyers collection
        const buyersQuerySnapshot = await getDocs(
          query(collection(firestore, 'buyers'), where('userId', '==', userId))
        );
        if (!buyersQuerySnapshot.empty) {
          const buyerDoc = buyersQuerySnapshot.docs[0];
          const buyerData = buyerDoc.data();
          if (buyerData) {
            return buyerData;
          } else return 'notfound';
        } else {
          const sellerQuerySnapshot = await getDocs(
            query(
              collection(firestore, 'sellers'),
              where('userId', '==', userId)
            )
          );
          console.log(sellerQuerySnapshot.empty);
          if (!sellerQuerySnapshot.empty) {
            const sellerDoc = sellerQuerySnapshot.docs[0];
            const sellerData = sellerDoc.data();
            if (sellerData) {
              setLoading(false);
              return sellerData;
            } else {
              setLoading(false);
              return 'notfound';
            }
          } else {
            setLoading(false);
            return 'notfound';
          }
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        setLoading(false);
        return error;
      }
    }
  };

  const getProducts = async (buyerCollegeName) => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'sellers'));
      const products = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        collegeName: doc.data().collegeName,
        condition: doc.data().condition,
        imageURL1: doc.data().imageURL1,
        minimumPrice: doc.data().minimumPrice,
        item: doc.data().item,
        isSold: doc.data().isSold,
        company: doc.data().company,
        maximumRetailPrice: doc.data().maximumRetailPrice,
      }));
      const filteredProducts = products.filter(
        (product) => product.collegeName === buyerCollegeName
      );

      return filteredProducts;
    } catch (error) {
      console.error('Error fetching products:', error.message);
      throw error;
    }
  };

  const getProductAmountforOrder = async (productID, setLoading) => {
    if (productID) {
      // setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'sellers'));
        let MinimumPrice = 0;
        querySnapshot.forEach((doc) => {
          if (doc.id === productID) {
            MinimumPrice = doc.data().minimumPrice;
          }
        });
        return MinimumPrice;
      } catch (error) {
        console.error('Error fetching seller details:', error);
        setLoading(false);
        throw error;
      }
    }
  };

  const getProductDetailsforOrders = async (productID, setLoading) => {
    if (productID) {
      // setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'sellers'));
        let SellerDetails;
        querySnapshot.forEach((doc) => {
          if (doc.id === productID) {
            SellerDetails = doc.data();
          }
        });
        return SellerDetails;
      } catch (error) {
        console.error('Error fetching seller details:', error);
        setLoading(false);
        throw error;
      }
    }
  };

  const markProductAsSold = async (productID, setLoading) => {
    if (productID) {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'sellers'));
        let sellerDocRef;
        querySnapshot.forEach((doc) => {
          if (doc.id === productID) {
            sellerDocRef = doc.ref;
          }
        });

        if (sellerDocRef) {
          // Update the isSold property of the matched product document
          await updateDoc(sellerDocRef, {
            isSold: true,
          });
          return 'success';
        } else {
          return 'failure';
        }
      } catch (error) {
        console.error('Error updating seller details:', error);
        setLoading(false);
        throw error;
      }
    }
  };

  const markTrannsactionComplete = async (orderID) => {
    if (orderID) {
      console.log(orderID);
      try {
        const querySnapshot = await getDocs(collection(firestore, 'orders'));
        let orderDocRef;
        querySnapshot.forEach((doc) => {
          if (doc.id === orderID) {
            orderDocRef = doc.ref;
          }
        });

        if (orderDocRef) {
          // Update the isSold property of the matched product document
          await updateDoc(orderDocRef, {
            isOrderComplete: true,
          });
          return 'success';
        } else {
          return 'failure';
        }
      } catch (error) {
        console.error('Error updating order details:', error);
        throw error;
      }
    }
  };

  const isLoggedIn = user ? true : false;

  
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      return null; // Return null if login is successful
    } catch (error) {
      return error; // Return the error if login fails
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      console.log('Signed out successfully');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(
        firebaseAuth,
        googleProvider
      );
      const user = userCredential.user;
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      throw error;
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        signup,
        login,
        logout,
        signInWithGoogle,
        isLoggedIn,
        handleCreateSellerInfo,
        handleCreateBuyerInfo,
        handleCreateOrder,
        getProducts,
        markProductAsSold,
        checkUserProfile,
        getProductDetailsforOrders,
        fetchOrders,
        checkOrders,
        markTrannsactionComplete,
        getProductAmountforOrder,
      }}
    >
      {props.children}
    </FirebaseContext.Provider>
  );
};
