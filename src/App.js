import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import AuthScreen from "./AuthScreen";
import Dashboard from "./Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(false);
      if (user) {
        setUser(user);

        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setBalance(data.balance || 0);
        } else {
          await setDoc(ref, {
            email: user.email,
            createdAt: Date.now(),
            balance: 0,
          });
          setBalance(0);
        }
      } else {
        setUser(null);
        setBalance(0);
      }
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="text-white p-8">⏳ Загрузка...</div>;
  if (!user) return <AuthScreen />;

  return <Dashboard user={user} balance={balance} />;
}

export default App;


