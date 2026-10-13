import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StatBlockBuilder from "./StatBlockBuilder/StatBlockBuilder";
import InitiativeTracker from "./InitiativeTracker/InitiativeTracker";
import CharacterSheet from "./CharacterSheet/CharacterSheet";
import CharacterSheetEditor from "./CharacterSheet/CharacterSheetEditor";
import TokenStamp from "./TokenStamp/TokenStamp";
import DiceStudio from "./DiceStudio/DiceStudio";
import { ensureAnonymousSession } from "./Supabase";

const PAGE_IDS = [
  "initiative-tracker",
  "stat-block-builder",
  "token-stamp",
  "character-sheet",
  "character-sheet-editor",
  "dice-studio",
];

const PAGE_BY_PATH = {
  "/": "initiative-tracker",
  ...Object.fromEntries(PAGE_IDS.map((pageId) => [`/${pageId}`, pageId])),
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const isKnownPath = Object.prototype.hasOwnProperty.call(
    PAGE_BY_PATH,
    pathname,
  );
  const page = isKnownPath ? PAGE_BY_PATH[pathname] : "initiative-tracker";

  useEffect(() => {
    ensureAnonymousSession();
  }, []);

  useEffect(() => {
    if (!isKnownPath) {
      navigate("/initiative-tracker", { replace: true });
    }
  }, [isKnownPath, navigate]);

  const changePage = (newPage) => {
    if (PAGE_IDS.includes(newPage)) {
      navigate(`/${newPage}`);
    } else {
      navigate("/initiative-tracker");
    }
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

        {page === "character-sheet-editor" && (
          <motion.div
            key="character-sheet-editor"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <CharacterSheetEditor onBack={() => changePage("character-sheet")} />
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
