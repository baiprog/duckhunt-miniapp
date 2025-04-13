import { auth } from "../firebase";
import { useEffect, useState } from "react";

export default function CrashGame() {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Добавим uid в query
      setUrl(`https://duck-crash.onrender.com/`);
    }
  }, []);

  if (!url) return <div className="text-white p-6">Загрузка...</div>;

  return (
    <div className="w-full h-[90vh]">
      <iframe
        src={url}
        title="Crash Game"
        className="w-full h-full rounded-xl border-2 border-yellow-400"
        allowFullScreen
      />
    </div>
  );
}
