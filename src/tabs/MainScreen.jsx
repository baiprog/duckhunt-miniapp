import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export default function MainScreen() {
  const [tasks, setTasks] = useState({
    steps: false,
    story: false,
    game: false,
    claimed: false,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const uid = auth.currentUser.uid;

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const ref = doc(db, "tasks", `${uid}_${today}`);
  const userRef = doc(db, "users", uid);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setTasks(snap.data());
      } else {
        await setDoc(ref, {
          steps: false,
          story: false,
          game: false,
          claimed: false,
        });
        setTasks({
          steps: false,
          story: false,
          game: false,
          claimed: false,
        });
      }
      setLoading(false);
    })();
  }, []);

  const markDone = async (key) => {
    const updated = { ...tasks, [key]: true };
    setTasks(updated);
    await updateDoc(ref, { [key]: true });
  };

  const handleClaim = async () => {
    if (tasks.claimed) {
      setStatus("❗️Награда уже получена сегодня");
      return;
    }

    if (!tasks.steps || !tasks.story || !tasks.game) {
      setStatus("⚠️ Выполни все задания, чтобы получить DUCK");
      return;
    }

    await updateDoc(ref, { claimed: true });
    await updateDoc(userRef, {
      balance: +tasks.balance + 0.01,
    });

    setTasks((prev) => ({ ...prev, claimed: true }));
    setStatus("🎉 +0.01 DUCK начислено!");
  };

  if (loading) return <div>⏳ Загружаем задания...</div>;

  return (
    <div className="text-yellow-300 space-y-6">
      <h2 className="text-2xl font-bold">🦆 Задания дня</h2>

      <div className="space-y-4">
        <Task
          title="Пройти 500 метров"
          done={tasks.steps}
          onDone={() => markDone("steps")}
        />
        <Task
          title="Выложить сторис с кодом"
          done={tasks.story}
          onDone={() => markDone("story")}
        />
        <Task
          title="Сыграть в мини-игру"
          done={tasks.game}
          onDone={() => markDone("game")}
        />
      </div>

      <button
        onClick={handleClaim}
        disabled={tasks.claimed || !(tasks.steps && tasks.story && tasks.game)}
        className={`w-full py-3 rounded-xl font-bold text-black ${
          tasks.claimed
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-yellow-400 hover:bg-yellow-500"
        }`}
      >
        {tasks.claimed ? "🎁 Награда получена" : "💰 Получить 0.01 DUCK"}
      </button>

      {status && <p className="text-sm mt-2 text-yellow-400">{status}</p>}
    </div>
  );
}

function Task({ title, done, onDone }) {
  return (
    <div className="flex items-center justify-between bg-[#1e1e1e] p-4 rounded-xl border border-yellow-500">
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-yellow-200">
          {done ? "✅ Выполнено" : "⏳ Не выполнено"}
        </p>
      </div>
      {!done && (
        <button
          onClick={onDone}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500"
        >
          Выполнить
        </button>
      )}
      {done && <span className="text-green-400 text-xl">✔</span>}
    </div>
  );
}
