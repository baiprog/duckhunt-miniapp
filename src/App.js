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
    const tryInitTelegram = () => {
      const tg = window.Telegram?.WebApp;

      addLog("🔍 Проверка наличия Telegram.WebApp", tg);

      if (tg && tg.initDataUnsafe) {
        tg.ready();
        addLog("✅ Telegram WebApp готов", tg);

        let initDataUnsafe = tg.initDataUnsafe;
        let source = "initDataUnsafe";

        if (!initDataUnsafe.user) {
          const tgWebAppDataRaw = new URLSearchParams(window.location.search).get("tgWebAppData");
          if (tgWebAppDataRaw) {
            const parsed = Object.fromEntries(new URLSearchParams(tgWebAppDataRaw));
            initDataUnsafe = parsed;
            source = "tgWebAppData";
            setStatus("✅ Получены данные через tgWebAppData из URL");
          }
        } else {
          setStatus("✅ Получены данные от Telegram через WebApp API");
        }

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
        addLog("📦 Источник данных", source);
        addLog("🧠 initDataUnsafe", initDataUnsafe);

        if (initDataUnsafe.hash === "MOCK") {
          addLog("🚫 Пропущена авторизация", "Dev-режим активен");
          return;
        }

        // Авторизация через сервер
        fetch("http://185.244.173.50:3001/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initDataUnsafe),
        })
          .then((res) => res.json())
          .then(async ({ token }) => {
            if (!token) {
              setStatus("❌ Сервер не вернул токен");
              addLog("❌ Ошибка: сервер не вернул токен", null);
              return;
            }

            await signInWithCustomToken(auth, token);
            setStatus("✅ Успешно авторизован в Firebase");
            setUid(auth.currentUser.uid);
            addLog("🔥 Firebase user", auth.currentUser);
          })
          .catch((err) => {
            setStatus("❌ Ошибка при авторизации");
            addLog("💥 Ошибка авторизации", err);
          });
      } else {
        addLog("⏳ Telegram.WebApp пока не загружен, повтор через 300мс", {});
        setTimeout(tryInitTelegram, 300); // повторяем попытку
      }
    };

    tryInitTelegram();
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
