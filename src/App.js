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

function App() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  // Отслеживаем авторизацию
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
          // Новый пользователь — создаём документ
          await setDoc(ref, {
            email: user.email,
            createdAt: Date.now(),
            balance: 0,
          });
          setBalance(0);
        }
      } else {
        setUser(null);
        setBalance(null);
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) return <div className="text-white p-8">⏳ Загрузка...</div>;

  if (!user) return <AuthScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-yellow-400 text-3xl font-bold mb-4 tracking-widest">
        🎯 Duck Hunt Dashboard
      </h1>
      <p className="text-white text-lg mb-2">
        Добро пожаловать, {user.email}
      </p>
      <p className="text-yellow-300 text-2xl font-mono mb-4">
        💰 Баланс: {balance?.toFixed(2)} DUCK
      </p>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl"
      >
        Выйти
      </button>
    </div>
  );
}

export default App;


