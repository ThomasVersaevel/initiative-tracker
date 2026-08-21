import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import StatBlockBuilder from "./StatBlockBuilder/StatBlockBuilder";
import InitiativeTracker from "./InitiativeTracker";


function App() {
  const [page, setPage] = useState("initiative-tracker");

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
            <InitiativeTracker setPage={setPage} />
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
            <StatBlockBuilder setPage={setPage} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default App;
