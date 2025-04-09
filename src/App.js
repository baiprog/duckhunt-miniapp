import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState("⏳ Ожидаем Telegram...");
  const [log, setLog] = useState([]);
  const [tgUser, setTgUser] = useState(null);

  const addLog = (msg, data) => {
    setLog(prev => [...prev, `[🧠] ${msg}:\n${JSON.stringify(data, null, 2)}`]);
    console.log(`[🧠] ${msg}:`, data);
  };

  useEffect(() => {
    const waitForTelegram = () => {
      const tg = window.Telegram?.WebApp;

      if (tg && tg.initDataUnsafe) {
        tg.ready?.();

        const user = tg.initDataUnsafe.user;
        if (user) {
          setTgUser(user);
          setStatus("✅ Данные Telegram получены");
          addLog("Telegram initDataUnsafe", tg.initDataUnsafe);
          return;
        } else {
          setStatus("⚠️ initData есть, но нет user");
          addLog("initData", tg.initDataUnsafe);
          return;
        }
      }

      setTimeout(waitForTelegram, 200); // 🔁 повторяем каждые 200мс
    };

    waitForTelegram(); // старт
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", fontSize: 14 }}>
      <h1>🎯 Duck Hunt</h1>
      <p><b>Статус:</b> {status}</p>

      {tgUser && (
        <div>
          <b>👤 Пользователь:</b>
          <pre>{JSON.stringify(tgUser, null, 2)}</pre>
        </div>
      )}

      {log.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>Логи:</h3>
          <pre style={{ fontSize: "11px", background: "#f4f4f4", padding: 10, borderRadius: 6 }}>
            {log.join("\n\n")}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;

