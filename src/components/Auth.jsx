import React, { useState, useEffect } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function Auth() {
  const [user, setUser] = useState(null);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="text-center mt-4">
      {user ? (
        <>
          <h4>Welcome, {user.displayName}</h4>
        </>
      ) : (
        <button onClick={login}>Sign in with Google</button>
      )}
    </div>
  );
}
