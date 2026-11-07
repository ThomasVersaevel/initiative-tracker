import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supabase, ensureAnonymousSession } from "../../Supabase";

export function useSavedItems(storeType) {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const loadItems = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError("");

    try {
      const { configured, userId, error: sessionError } =
        await ensureAnonymousSession();
      if (!configured || sessionError || !userId) {
        throw new Error(
          sessionError?.friendlyMessage ||
            "Configure Supabase to use your saved item library.",
        );
      }

      const { data, error: queryError } = await supabase
        .from("stat_block_store_items")
        .select("id, name, data")
        .eq("user_id", userId)
        .eq("store_type", storeType)
        .order("name", { ascending: true });

      if (queryError) throw queryError;
      if (currentRequestId === requestId.current) setItems(data || []);
    } catch (loadError) {
      console.error("Failed to load saved stat block items:", loadError);
      if (currentRequestId === requestId.current) {
        setError(loadError.message || "Unable to load saved items.");
      }
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  }, [storeType]);

  useEffect(() => {
    loadItems();
    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      setItems([]);
      window.setTimeout(() => {
        if (active) loadItems();
      }, 0);
    });

    return () => {
      active = false;
      requestId.current += 1;
      authListener.subscription.unsubscribe();
    };
  }, [loadItems]);

  const saveItem = async (item, name) => {
    setError("");

    try {
      const { configured, userId, error: sessionError } =
        await ensureAnonymousSession();
      if (!configured || sessionError || !userId) {
        throw new Error(
          sessionError?.friendlyMessage ||
            "Configure Supabase to save items to your library.",
        );
      }

      const itemData = Object.fromEntries(
        Object.entries(item).filter(([key]) => key !== "id" && key !== "portrait"),
      );
      const trimmedName =
        String(name || "").trim() ||
        String(item.name || "").trim() ||
        "Unnamed item";

      const { data, error: insertError } = await supabase
        .from("stat_block_store_items")
        .insert({
          user_id: userId,
          store_type: storeType,
          name: trimmedName,
          data: itemData,
        })
        .select("id, name, data")
        .single();

      if (insertError) throw insertError;
      setItems((current) =>
        [...current, data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return true;
    } catch (saveError) {
      console.error("Failed to save stat block item:", saveError);
      setError(saveError.message || "Unable to save this item.");
      return false;
    }
  };

  const deleteItem = async (itemId) => {
    setError("");

    try {
      const { configured, userId, error: sessionError } =
        await ensureAnonymousSession();
      if (!configured || sessionError || !userId) {
        throw new Error(
          sessionError?.friendlyMessage ||
            "Unable to connect to your saved item library.",
        );
      }

      const { error: deleteError } = await supabase
        .from("stat_block_store_items")
        .delete()
        .eq("id", itemId)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch (deleteError) {
      console.error("Failed to delete saved stat block item:", deleteError);
      setError(deleteError.message || "Unable to delete this saved item.");
    }
  };

  return { items, isLoading, error, saveItem, deleteItem };
}

export function ImportExistingButton({ sources }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [themeVariables, setThemeVariables] = useState({});
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const entries = sources.flatMap((source) =>
    source.items.map((item) => ({ ...item, source })),
  );
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredEntries = entries.filter((item) =>
    `${item.name} ${item.source.title} ${JSON.stringify(item.data)}`
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );
  const loading = sources.some((source) => source.isLoading);
  const errors = sources.filter((source) => source.error);

  useEffect(() => {
    if (isOpen) {
      searchRef.current?.focus();
      const computedStyle = window.getComputedStyle(triggerRef.current);
      setThemeVariables(
        Object.fromEntries(
          [
            "--text-color",
            "--subtext-color",
            "--background-color",
            "--background-light",
            "--background-dark",
            "--background-darker",
            "--accent-color",
            "--button-brown",
            "--button-dark",
          ].map((name) => [name, computedStyle.getPropertyValue(name)]),
        ),
      );
    }
    else {
      setSearch("");
      setPendingDelete(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="button import-existing-button"
        onClick={() => setIsOpen(true)}
      >
        Import existing
      </button>
      {isOpen &&
        createPortal(
          <div
            className="saved-items-modal-backdrop"
            style={themeVariables}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsOpen(false);
            }}
          >
            <section
              className="saved-items-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="saved-items-modal-title"
            >
              <header className="saved-items-modal-header">
                <h2 id="saved-items-modal-title">Import existing</h2>
                <button
                  type="button"
                  className="btn saved-items-modal-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close saved items"
                >
                  ×
                </button>
              </header>
              <label className="saved-items-search">
                <span>Search saved items</span>
                <input
                  ref={searchRef}
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name or details"
                />
              </label>
              {errors.map((source) => (
                <p className="saved-items-error" role="alert" key={source.title}>
                  {source.title}: {source.error}
                </p>
              ))}
              {loading && <p role="status">Loading saved items…</p>}
              {!loading && entries.length === 0 && errors.length === 0 && (
                <p className="saved-items-empty">
                  No saved items yet. Use “Save to library” on an item to add it.
                </p>
              )}
              {!loading && entries.length > 0 && filteredEntries.length === 0 && (
                <p className="saved-items-empty">No items match your search.</p>
              )}
              <ul className="saved-items-modal-list">
                {filteredEntries.map((item) => {
                  const deleteKey = `${item.source.title}:${item.id}`;
                  const isConfirmingDelete = pendingDelete === deleteKey;
                  const detail =
                    item.data.description ||
                    item.data.damageType ||
                    item.data.language ||
                    item.data.label ||
                    "";
                  return (
                    <li key={deleteKey}>
                      <div className="saved-items-modal-item-info">
                        <strong>{item.name}</strong>
                        <span>{item.source.title}</span>
                        {detail && <p>{detail}</p>}
                      </div>
                      <div className="saved-items-modal-actions">
                        {isConfirmingDelete ? (
                          <>
                            <span>Delete?</span>
                            <button
                              type="button"
                              className="button remove-button"
                              onClick={() => {
                                item.source.onDelete(item.id);
                                setPendingDelete(null);
                              }}
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              className="button"
                              onClick={() => setPendingDelete(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="button add-button"
                              onClick={() => {
                                item.source.onAdd(item.data);
                                setIsOpen(false);
                              }}
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              className="button remove-button"
                              onClick={() => setPendingDelete(deleteKey)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}

export function SaveItemButton({ onClick, disabled = false }) {
  const [status, setStatus] = useState("");

  const handleSave = async () => {
    setStatus("");
    const saved = await onClick();
    setStatus(saved ? "Saved" : "Unable to save");
  };

  return (
    <span className="saved-item-save-control">
      <button
        type="button"
        className="button saved-item-save-button"
        onClick={handleSave}
        disabled={disabled}
      >
        {status === "Saved" ? "Saved" : "Save to library"}
      </button>
      {status === "Unable to save" && (
        <span className="saved-items-error" role="alert">
          Could not save
        </span>
      )}
    </span>
  );
}
