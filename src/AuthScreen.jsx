import { useState } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [status, setStatus] = useState("");

  const handleAuth = async () => {
    setStatus("⏳ Подключаемся к охоте...");
    try {
      if (mode === "register") {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        await setDoc(doc(db, "users", res.user.uid), {
          email: res.user.email,
          createdAt: Date.now(),
          balance: 0.0,
        });
        setStatus("✅ Добро пожаловать в Duck Hunt!");
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
        setStatus("✅ Возвращение охотника успешно!");
      }
    } catch (err) {
      setStatus("❌ Ошибка: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1c1c1c] p-6 rounded-2xl shadow-xl border border-yellow-400">
        <h1 className="text-yellow-400 font-extrabold text-3xl mb-4 text-center tracking-widest drop-shadow">
          DUCK HUNT {mode === "login" ? "LOGIN" : "SIGN UP"}
        </h1>
        <input
          type="email"
          className="w-full bg-black text-white border border-yellow-500 rounded-md p-3 mb-3 focus:outline-none"
          placeholder="🦆 Введи email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full bg-black text-white border border-yellow-500 rounded-md p-3 mb-4 focus:outline-none"
          placeholder="🔒 Пароль охотника"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />
        <button
          onClick={handleAuth}
          className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-500 transition"
        >
          {mode === "login" ? "Войти" : "Зарегистрироваться"}
        </button>
        <p
          className="mt-4 text-center text-yellow-300 cursor-pointer text-sm hover:underline"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Нет аккаунта? Зарегистрируйся"
            : "Уже охотник? Войти"}
        </p>
        {status && (
          <p className="mt-4 text-center text-sm text-yellow-400">{status}</p>
        )}
      </div>
    </div>
  );
}
