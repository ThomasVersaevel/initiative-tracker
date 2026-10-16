import React, { useEffect, useState } from "react";
import { Header } from "../Header";
import { ensureAnonymousSession, isSupabaseConfigured, supabase } from "../Supabase";
import "./Characters.css";

export default function Characters({
  setPage,
  onCreateCharacter,
  onOpenCharacter,
}) {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCharacters = async () => {
      if (!isSupabaseConfigured) {
        setError("Connect Supabase to save and load your character sheets.");
        setIsLoading(false);
        return;
      }

      const { configured, userId, error: sessionError } =
        await ensureAnonymousSession();
      if (!isActive) return;
      if (!configured || sessionError || !userId) {
        setError(
          sessionError?.friendlyMessage ||
            sessionError?.message ||
            "Unable to connect to character storage.",
        );
        setIsLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("character_sheets")
        .select("id, name, data, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (!isActive) return;
      if (queryError) {
        console.error("Failed to load character sheets:", queryError);
        setError("Unable to load your characters. Please try again.");
      } else {
        setCharacters(data ?? []);
      }
      setIsLoading(false);
    };

    loadCharacters();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="characters-page">
      <Header
        title="Characters"
        setPage={setPage}
        nextPage={{ page: "initiative-tracker", label: "Initiative Tracker" }}
        className="statblock-page-header"
        rightContent={
          <button
            type="button"
            className="characters-create-button"
            onClick={onCreateCharacter}
          >
            New Character
          </button>
        }
      />
      <section className="characters-content" aria-label="Saved characters">
        <div className="characters-heading">
          <div>
            <p className="characters-eyebrow">Your collection</p>
            <h2>Character Sheets</h2>
          </div>
          {!isLoading && !error && (
            <span className="characters-count">
              {characters.length} {characters.length === 1 ? "character" : "characters"}
            </span>
          )}
        </div>

        {isLoading && <p className="characters-message">Loading characters…</p>}
        {error && <p className="characters-message" role="alert">{error}</p>}
        {!isLoading && !error && characters.length === 0 && (
          <div className="characters-empty">
            <div className="characters-empty-icon" aria-hidden="true">✦</div>
            <h3>No characters yet</h3>
            <p>Create a character sheet to start your collection.</p>
            <button
              type="button"
              className="characters-create-button"
              onClick={onCreateCharacter}
            >
              Create your first character
            </button>
          </div>
        )}
        {!isLoading && !error && characters.length > 0 && (
          <div className="characters-grid">
            {characters.map((character) => {
              const data = character.data ?? {};
              const details = [
                data.species,
                data.className && `${data.className} · Level ${data.classLevel || 1}`,
              ].filter(Boolean);
              return (
                <button
                  type="button"
                  className="character-card"
                  key={character.id}
                  onClick={() => onOpenCharacter(character)}
                >
                  <span className="character-card-portrait">
                    {data.portrait ? (
                      <img src={data.portrait} alt="" />
                    ) : (
                      <span aria-hidden="true">
                        {(character.name || "?").trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <span className="character-card-details">
                    <strong>{character.name || "Unnamed Character"}</strong>
                    <span>{details.join(" · ") || "Character sheet"}</span>
                    <span className="character-card-open">Open sheet <span aria-hidden="true">→</span></span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
