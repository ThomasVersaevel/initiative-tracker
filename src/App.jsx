import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import StatBlockBuilder from "./StatBlockBuilder/StatBlockBuilder";
import InitiativeTracker from "./InitiativeTracker/InitiativeTracker";
import CharacterSheet from "./CharacterSheet/CharacterSheet";
import TokenStamp from "./TokenStamp/TokenStamp";
import DiceStudio from "./DiceStudio/DiceStudio";
import { ensureAnonymousSession } from "./Supabase";

const PAGE_IDS = [
  "initiative-tracker",
  "stat-block-builder",
  "token-stamp",
  "character-sheet",
  "dice-studio",
];

function App() {
  const [page, setPage] = useState(
    () => {
      const savedPage = localStorage.getItem("currentPage");
      return PAGE_IDS.includes(savedPage) ? savedPage : "initiative-tracker";
    },
  );

  useEffect(() => {
    ensureAnonymousSession();
  }, []);

  const changePage = (newPage) => {
    const nextPage = PAGE_IDS.includes(newPage)
      ? newPage
      : "initiative-tracker";
    localStorage.setItem("currentPage", nextPage);
    setPage(nextPage);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden page-container">
      <AnimatePresence initial={false} mode="sync">
        {page === "initiative-tracker" && (
          <motion.div
            key="initiative-tracker"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full page"
          >
            <InitiativeTracker setPage={changePage} />
          </motion.div>
        )}

        {page === "stat-block-builder" && (
          <motion.div
            key="stat-block-builder"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <StatBlockBuilder setPage={changePage} />
          </motion.div>
        )}
        {page === "token-stamp" && (
          <motion.div
            key="token-stamp"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <TokenStamp setPage={changePage} />
          </motion.div>
        )}

        {page === "character-sheet" && (
          <motion.div
            key="character-sheet"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <CharacterSheet setPage={changePage} />
          </motion.div>
        )}

        {page === "dice-studio" && (
          <motion.div
            key="dice-studio"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <DiceStudio setPage={changePage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;
