import React, { useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../../Firebase/Firebase.init';
import { useState } from 'react';


  const googleProvider = new GoogleAuthProvider();


const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const registerUser = (email,password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const signInUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password)
    }

//    Observe user State
    const signInGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    const logOut = () =>{
        setLoading(true)
        return signOut(auth)
    }

    const updateUserProfile = (profile) =>{
        return updateProfile(auth.currentUser, profile)
    }

    useEffect(() => {
         const unSubscribe = onAuthStateChanged(auth, (currentUser) =>{
              setUser (currentUser);
              setLoading(false)
         })
      return () => {
        unSubscribe();
      }

    },[])

    const authInfo = {
          user,
          loading,
          logOut,
          registerUser,
          signInUser,
          signInGoogle,
          updateUserProfile 
    }

    return (
    <AuthContext value={authInfo}>
           {children}
    </AuthContext>
    );
};

export default AuthProvider;