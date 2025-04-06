import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { signInWithCustomToken } from "firebase/auth";

function App() {
  const [status, setStatus] = useState("⏳ Ожидаем Telegram...");
  const [uid, setUid] = useState(null);
  const [initData, setInitData] = useState(null);
  const [log, setLog] = useState([]);

  const addLog = (msg, data) => {
    setLog((prev) => [...prev, `[📝] ${msg}: ${JSON.stringify(data, null, 2)}`]);
    console.log(msg, data);
  };

  useEffect(() => {
    let initDataUnsafe = null;
    let source = "undefined";

    const tg = window.Telegram?.WebApp;
    addLog("window.Telegram.WebApp", tg);

    // 1. Пытаемся взять initDataUnsafe напрямую
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      initDataUnsafe = tg.initDataUnsafe;
      source = "initDataUnsafe";
      setStatus("✅ Получены данные от Telegram через WebApp API");
    }

    // 2. Если нет, пробуем tgWebAppData из URL
    if (!initDataUnsafe) {
      const tgWebAppDataRaw = new URLSearchParams(window.location.search).get("tgWebAppData");
      if (tgWebAppDataRaw) {
        const parsed = Object.fromEntries(new URLSearchParams(tgWebAppDataRaw));
        initDataUnsafe = parsed;
        source = "tgWebAppData";
        setStatus("✅ Получены данные через tgWebAppData из URL");
      }
    }

    // 3. Если вообще ничего нет — включаем dev mode
    if (!initDataUnsafe || !initDataUnsafe.id || !initDataUnsafe.hash) {
      setStatus("⚠️ Dev-режим: Telegram initData заменён моком");
      initDataUnsafe = {
        id: 123456789,
        username: "demo_user",
        first_name: "Dev",
        auth_date: Math.floor(Date.now() / 1000),
        hash: "MOCK",
      };
      source = "mock";
    }

    setInitData({ ...initDataUnsafe, _source: source });
    addLog("Источник данных", source);
    addLog("initDataUnsafe", initDataUnsafe);

    // 4. Не делаем запрос на сервер, если hash = MOCK
    if (initDataUnsafe.hash === "MOCK") {
      addLog("Пропущена авторизация", "Dev-режим активен");
      return;
    }

    // 5. Авторизация через сервер
    fetch("http://185.244.173.50:3001/auth/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(initDataUnsafe),
    })
      .then((res) => res.json())
      .then(async ({ token }) => {
        if (!token) {
          setStatus("❌ Сервер не вернул токен");
          addLog("Ошибка: сервер не вернул токен", null);
          return;
        }

        await signInWithCustomToken(auth, token);
        setStatus("✅ Успешно авторизован в Firebase");
        setUid(auth.currentUser.uid);
        addLog("🔥 Firebase user", auth.currentUser);
      })
      .catch((err) => {
        setStatus("❌ Ошибка при авторизации");
        addLog("Ошибка авторизации", err);
      });
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", fontSize: 14 }}>
      <h1>🎯 Duck Hunt</h1>
      <p><b>Статус:</b> {status}</p>
      {uid && <p><b>UID:</b> {uid}</p>}
      {initData && (
        <div style={{ fontSize: "12px", marginTop: 20 }}>
          <b>Данные Telegram ({initData._source}):</b>
          <pre>{JSON.stringify(initData, null, 2)}</pre>
        </div>
      )}
      {log.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h3>🧠 Логи:</h3>
          <pre style={{ fontSize: "11px", background: "#f4f4f4", padding: 10, borderRadius: 6 }}>
            {log.join("\n\n")}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
