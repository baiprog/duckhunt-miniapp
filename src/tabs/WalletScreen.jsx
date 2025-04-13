// src/tabs/WalletScreen.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function WalletScreen() {
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    (async () => {
      try {
        const uid = user.uid;

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setBalance(userSnap.data().balance || 0);
        }

        const q = query(collection(db, "history"), where("uid", "==", uid));
        const snap = await getDocs(q);
        const items = [];
        snap.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });

        items.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(items);
      } catch (err) {
        console.error("Ошибка при получении истории:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = history.filter((item) => {
    if (filter === "all") return true;
    if (filter === "earn") return item.type.includes("Награда");
    if (filter === "withdraw") return item.type.includes("Вывод");
    return true;
  });

  const chartData = [...filtered]
    .reverse()
    .map((item) => ({
      name: new Date(item.timestamp).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
      }),
      amount: item.amount,
    }));

  return (
    <div className="p-6 text-yellow-300 pb-24">
      <h2 className="text-2xl font-bold mb-2">💰 Кошелёк</h2>
      <p className="text-yellow-400 mb-2">Баланс: {balance.toFixed(2)} DUCK</p>

      <button
        disabled
        className="mb-6 px-4 py-2 bg-yellow-500 text-black rounded-lg font-bold opacity-50 cursor-not-allowed w-full"
      >
        🔁 Вывести DUCK (скоро)
      </button>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">📊 График начислений</h3>
        {chartData.length === 0 ? (
          <p className="text-yellow-500 text-sm">Недостаточно данных</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="name" stroke="#facc15" />
              <YAxis stroke="#facc15" />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#facc15" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">🧾 История</h3>
        <div className="flex gap-2 mb-2 text-sm">
          {["all", "earn", "withdraw"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded border ${
                filter === f ? "bg-yellow-400 text-black font-bold" : "border-yellow-400 text-yellow-400"
              }`}
            >
              {f === "all" && "Все"}
              {f === "earn" && "Начисления"}
              {f === "withdraw" && "Вывод"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-yellow-500">⏳ Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-yellow-500">Нет транзакций</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#1e1e1e] p-3 rounded-lg border border-yellow-600 flex justify-between"
            >
              <div>
                <p className="font-bold">{item.type}</p>
                <p className="text-sm text-yellow-400">
                  {new Date(item.timestamp).toLocaleString("ru-RU")}
                </p>
              </div>
              <p className="font-bold text-green-400">+{item.amount.toFixed(2)} DUCK</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


