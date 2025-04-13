import { useState } from "react";
import MainScreen from "./tabs/MainScreen";
import WalletScreen from "./tabs/WalletScreen";
import CrashGame from "./tabs/CrashGame"; // если интегрировал здесь

const TABS = {
  main: <MainScreen />,
  wallet: <WalletScreen />,
  crash: <CrashGame />,
};

export default function Dashboard() {
  const [tab, setTab] = useState("main");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col">
      <div className="flex-1 p-6">{TABS[tab]}</div>

      <nav className="flex justify-around bg-[#1e1e1e] border-t border-yellow-600 text-yellow-400 py-3">
        <button onClick={() => setTab("main")} className="flex flex-col items-center">
          🏠 <span className="text-xs">Главная</span>
        </button>
        <button onClick={() => setTab("crash")} className="flex flex-col items-center">
          🦆 <span className="text-xs">Crash-игра</span>
        </button>
        <button onClick={() => setTab("wallet")} className="flex flex-col items-center">
          💰 <span className="text-xs">Кошелёк</span>
        </button>
      </nav>
    </div>
  );
}
