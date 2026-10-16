import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StatBlockBuilder from "./StatBlockBuilder/StatBlockBuilder";
import InitiativeTracker from "./InitiativeTracker/InitiativeTracker";
import CharacterSheet from "./CharacterSheet/CharacterSheet";
import CharacterSheetEditor from "./CharacterSheet/CharacterSheetEditor";
import TokenStamp from "./TokenStamp/TokenStamp";
import DiceStudio from "./DiceStudio/DiceStudio";
import Characters from "./CharacterSheet/Characters";
import { ensureAnonymousSession, supabase } from "./Supabase";

const PAGE_IDS = [
  "characters",
  "initiative-tracker",
  "stat-block-builder",
  "token-stamp",
  "character-sheet-editor",
  "dice-studio",
];

const PAGE_BY_PATH = {
  "/": "characters",
  ...Object.fromEntries(PAGE_IDS.map((pageId) => [`/${pageId}`, pageId])),
};

const PAGE_VARIANTS = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "-100%" },
};
const PAGE_TRANSITION = { duration: 0.1, ease: "easeInOut" };

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isCharacterLoading, setIsCharacterLoading] = useState(false);
  const [characterLoadError, setCharacterLoadError] = useState("");
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  const characterSheetMatch = pathname.match(/^\/character-sheet\/([^/]+)$/);
  const characterId = characterSheetMatch?.[1] ?? null;
  const isKnownPath = Object.prototype.hasOwnProperty.call(
    PAGE_BY_PATH,
    pathname,
  ) || Boolean(characterId);
  const page = characterId
    ? "character-sheet"
    : isKnownPath
      ? PAGE_BY_PATH[pathname]
      : "characters";

  useEffect(() => {
    ensureAnonymousSession();
  }, []);

  useEffect(() => {
    if (!characterId) {
      setIsCharacterLoading(false);
      setCharacterLoadError("");
      return undefined;
    }

    let isActive = true;
    setIsCharacterLoading(true);
    setCharacterLoadError("");

    const loadCharacter = async () => {
      const { configured, userId, error: sessionError } =
        await ensureAnonymousSession();
      if (!isActive) return;
      if (!configured || sessionError || !userId) {
        setCharacterLoadError(
          sessionError?.friendlyMessage ||
            sessionError?.message ||
            "Character storage is not configured.",
        );
        setIsCharacterLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("character_sheets")
        .select("id, name, data, created_at, updated_at")
        .eq("id", characterId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!isActive) return;
      if (error) {
        console.error("Failed to load character sheet:", error);
        setCharacterLoadError("Unable to load this character sheet.");
      } else if (!data) {
        setCharacterLoadError("This character could not be found.");
      } else {
        setSelectedCharacter(data);
      }
      setIsCharacterLoading(false);
    };

    loadCharacter();
    return () => {
      isActive = false;
    };
  }, [characterId]);

  useEffect(() => {
    if (!isKnownPath) {
      navigate("/characters", { replace: true });
    }
  }, [isKnownPath, navigate]);

  const changePage = (newPage) => {
    if (PAGE_IDS.includes(newPage)) {
      navigate(`/${newPage}`);
    } else {
      navigate("/characters");
    }
  };

  const openCharacter = (character) => {
    setSelectedCharacter(character);
    navigate(`/character-sheet/${character.id}`);
  };

  const createCharacter = () => {
    setSelectedCharacter(null);
    changePage("character-sheet-editor");
  };

  const saveCharacter = async (characterData, id = null) => {
    const { configured, userId, error: sessionError } =
      await ensureAnonymousSession();
    if (!configured || sessionError || !userId) {
      throw new Error(
        sessionError?.friendlyMessage ||
          sessionError?.message ||
          "Character storage is not configured.",
      );
    }

    const savedCharacter = {
      ...characterData,
      name: characterData.name.trim(),
    };
    const payload = {
      name: savedCharacter.name,
      data: savedCharacter,
      user_id: userId,
    };
    const query = id
      ? supabase
          .from("character_sheets")
          .update(payload)
          .eq("id", id)
          .eq("user_id", userId)
          .select("id, name, data, created_at, updated_at")
          .single()
      : supabase
          .from("character_sheets")
          .insert(payload)
          .select("id, name, data, created_at, updated_at")
          .single();
    const { data, error } = await query;
    if (error) throw error;
    setSelectedCharacter(data);
    navigate(`/character-sheet/${data.id}`);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden page-container">
      <AnimatePresence initial={false} mode="sync">
        {page === "initiative-tracker" && (
          <motion.div
            key="initiative-tracker"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
            className="absolute inset-0 h-full w-full page"
          >
            <InitiativeTracker setPage={changePage} />
          </motion.div>
        )}

        {page === "characters" && (
          <motion.div
            key="characters"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
            className="absolute inset-0 h-full w-full page"
          >
            <Characters
              setPage={changePage}
              onCreateCharacter={createCharacter}
              onOpenCharacter={openCharacter}
            />
          </motion.div>
        )}

        {page === "stat-block-builder" && (
          <motion.div
            key="stat-block-builder"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
            className="absolute inset-0 h-full w-full"
          >
            <StatBlockBuilder setPage={changePage} />
          </motion.div>
        )}
        {page === "token-stamp" && (
          <motion.div
            key="token-stamp"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
            className="absolute inset-0 h-full w-full"
          >
            <TokenStamp setPage={changePage} />
          </motion.div>
        )}

        {page === "character-sheet" && (
          <motion.div
            key="character-sheet"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
            className="absolute inset-0 h-full w-full"
          >
            <CharacterSheet
              key={characterId || "empty"}
              setPage={changePage}
              character={selectedCharacter}
              isLoading={
                isCharacterLoading ||
                Boolean(characterId && selectedCharacter?.id !== characterId)
              }
              loadError={characterLoadError}
            />
          </motion.div>
        )}

        {page === "character-sheet-editor" && (
          <motion.div
            key="character-sheet-editor"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
            className="absolute inset-0 h-full w-full"
          >
            <CharacterSheetEditor
              key={selectedCharacter?.id || "new"}
              initialCharacter={selectedCharacter?.data}
              setPage={changePage}
              onSave={(data) => saveCharacter(data, selectedCharacter?.id)}
            />
          </motion.div>
        )}

        {page === "dice-studio" && (
          <motion.div
            key="dice-studio"
            variants={PAGE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={PAGE_TRANSITION}
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
