import { useEffect, useState } from "react";
import { auth, db, app } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const BOOSTERS = [
  {
    id: "bronze",
    name: "Hunter Bronze",
    price: "Бесплатно",
    desc: "Начальный охотник",
    profit: "0.01 DUCK",
    available: true,
  },
  {
    id: "silver",
    name: "Hunter Silver",
    price: "$5",
    desc: "Приносит больше DUCK",
    profit: "0.10 DUCK",
    available: false,
  },
  {
    id: "gold",
    name: "Hunter Gold",
    price: "$20",
    desc: "Продвинутый охотник",
    profit: "0.50 DUCK",
    available: false,
  },
];

export default function MainScreen() {
  const [tasks, setTasks] = useState({
    steps: 0,
    story: false,
    game: 0,
    claimed: false,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [uid, setUid] = useState(null);
  const [balance, setBalance] = useState(0);
  const [storyCode, setStoryCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [energy, setEnergy] = useState(0);

  const today = new Date().toISOString().slice(0, 10);
  const functions = getFunctions(app);
  const claimReward = httpsCallable(functions, "claimReward");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.warn("❌ Пользователь не авторизован");
      setLoading(false);
      return;
    }

    const uid = user.uid;
    setUid(uid);
    const taskId = `${uid}_${today}`;
    const ref = doc(db, "tasks", taskId);
    const userRef = doc(db, "users", uid);

    const code = "DUCK-" + Math.floor(1000 + Math.random() * 9000);
    setStoryCode(code);

    (async () => {
      try {
        const snap = await getDoc(ref);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setBalance(userSnap.data().balance || 0);
        }

        if (snap.exists()) {
          const data = snap.data();
          setTasks(data);
          setEnergy((data.steps || 0) + (data.game || 0) + (data.story ? 50 : 0));
        } else {
          await setDoc(ref, {
            steps: 0,
            story: false,
            game: 0,
            claimed: false,
          });
        }
      } catch (err) {
        console.error("❌ Ошибка доступа к Firestore:", err.message);
        setStatus("🚫 Нет доступа к заданиям");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateTask = async (key, value) => {
    const ref = doc(db, "tasks", `${uid}_${today}`);
    const updated = { ...tasks, [key]: value };
    setTasks(updated);
    setEnergy((updated.steps || 0) + (updated.game || 0) + (updated.story ? 50 : 0));
    await updateDoc(ref, { [key]: value });
  };

  const verifyStory = () => {
    if (inputCode.trim().toUpperCase() === storyCode) {
      updateTask("story", true);
      setStatus("✅ Сторис подтверждён!");
    } else {
      setStatus("❌ Неверный код");
    }
  };

  const handleClaim = async () => {
    if (!uid || tasks.claimed) return;
    setStatus("⏳ Проверка и начисление...");

    try {
      const result = await claimReward();
      if (result?.data?.message) {
        setStatus(result.data.message);
        updateTask("claimed", true);
        setBalance(result.data.balance || 0);
      } else {
        setStatus("⚠️ Что-то пошло не так");
      }
    } catch (err) {
      console.error("❌ Ошибка claimReward:", err.message);
      setStatus("❌ Ошибка: " + err.message);
    }
  };

  if (loading) return <div className="text-white p-4">⏳ Загружаем задания...</div>;

  return (
    <div className="text-yellow-300 space-y-6 pb-24">
      <h2 className="text-2xl font-bold animate-pulse">🎮 GAME ROUND ENDS</h2>
      <p className="text-sm text-yellow-400">💰 Баланс: {balance.toFixed(2)} DUCK</p>
      <p className="text-sm">⚡ Энергия: {energy}/100</p>
      <div className="w-full bg-gray-700 h-3 rounded">
        <div
          className="bg-yellow-400 h-3 rounded transition-all duration-300"
          style={{ width: `${Math.min(100, energy)}%` }}
        ></div>
      </div>

      <div className="space-y-4">
        <Task
          title="Пройти 500 метров (мок)"
          done={tasks.steps >= 20}
          onDone={() => updateTask("steps", Math.min(20, tasks.steps + 10))}
          value={tasks.steps}
          max={20}
        />

        <div className="bg-[#1e1e1e] p-4 rounded-xl border border-yellow-500">
          <p className="font-bold">📸 Выложи сторис с кодом:</p>
          <p className="text-yellow-200 mb-2">Код: <b>{storyCode}</b></p>
          <input
            type="text"
            placeholder="Введи код другого пользователя"
            className="w-full p-2 rounded bg-black text-yellow-300 border border-yellow-500"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
          {!tasks.story && (
            <button
              onClick={verifyStory}
              className="mt-2 w-full py-2 rounded bg-yellow-400 text-black font-bold hover:bg-yellow-500"
            >
              Подтвердить код
            </button>
          )}
          {tasks.story && <p className="text-green-400 mt-2">✅ Выполнено</p>}
        </div>

        <Task
          title="Сыграть в мини-игру (мок)"
          done={tasks.game >= 20}
          onDone={() => updateTask("game", Math.min(20, tasks.game + 10))}
          value={tasks.game}
          max={20}
        />
      </div>

      <button
        onClick={handleClaim}
        disabled={tasks.claimed || energy < 100}
        className={`w-full py-3 rounded-xl font-bold text-black ${
          tasks.claimed
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500"
        }`}
      >
        {tasks.claimed ? "🎁 Награда получена" : "💰 Получить 0.01 DUCK"}
      </button>

      {status && <p className="text-sm mt-2 text-yellow-400">{status}</p>}

      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4">🎯 Бустеры</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BOOSTERS.map((booster) => (
            <div
              key={booster.id}
              className="bg-[#1e1e1e] border border-yellow-600 rounded-xl p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <p className="font-bold text-yellow-300">{booster.name}</p>
                <p className="text-sm text-yellow-400">{booster.price}</p>
              </div>
              <p className="text-yellow-200 text-sm">{booster.desc}</p>
              <p className="text-yellow-400 text-xs">Доход: {booster.profit}/день × 100 дней</p>
              <button
                className="mt-2 w-full py-2 rounded bg-yellow-500 text-black font-bold opacity-50 cursor-not-allowed"
                disabled
              >
                {booster.available ? "✅ Активен" : "🔒 Недоступно"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Task({ title, done, onDone, value = 0, max = 1 }) {
  return (
    <div className="flex flex-col bg-[#1e1e1e] p-4 rounded-xl border border-yellow-500">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm text-yellow-200">
            {done ? "✅ Выполнено" : `⏳ Прогресс: ${value}/${max}`}
          </p>
        </div>
        {!done ? (
          <button
            onClick={onDone}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500"
          >
            Выполнить
          </button>
        ) : (
          <span className="text-green-400 text-xl">✔</span>
        )}
      </div>
    </div>
  );
}



