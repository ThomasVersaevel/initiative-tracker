import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import StatBlockBuilder from "./StatBlockBuilder/StatBlockBuilder";
import InitiativeTracker from "./InitiativeTracker";
import TokenStamp from "./TokenStamp/TokenStamp";
import { ensureAnonymousSession } from "./Supabase";

function App() {
  const [page, setPage] = useState(
    () => localStorage.getItem("currentPage") || "initiative-tracker",
  );

  useEffect(() => {
    ensureAnonymousSession();
  }, []);

  const changePage = (newPage) => {
    localStorage.setItem("currentPage", newPage);
    setPage(newPage);
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
      </AnimatePresence>
    </div>
  );
}
export default App;
