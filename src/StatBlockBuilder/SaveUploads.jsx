import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRotateLeft,
  faArrowRotateRight,
  faXmark,
  faSpinner,
  faArrowLeft,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { supabase, ensureAnonymousSession } from "../Supabase";
import {
  defaultStatBlock,
  normalizeStats,
  normalizeTraitSkills,
} from "./TypesUtils/Types.js";

const SaveUploads = ({
  setStatBlock,
  statBlock,
  imageGeneratorRef,
  canUndo,
  canRedo,
  undo,
  redo,
}) => {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Library state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created"); // "created" or "cr"
  const [pageNumber, setPageNumber] = useState(1);
  const [statBlocks, setStatBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [pendingImportBlock, setPendingImportBlock] = useState(null);
  const [pendingDeleteBlock, setPendingDeleteBlock] = useState(null);
  const debounceTimerRef = useRef(null);

  const isLoadingLibrary = isLoading;

  const formatSavedDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = String(date.getFullYear()).slice(-2);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const ITEMS_PER_PAGE = 12;

  const closeImagePreview = () => setImagePreview("");

  const openImagePreview = async () => {
    setIsGeneratingPreview(true);

    try {
      const imageDataUrl = await imageGeneratorRef.current?.getImageDataUrl();
      if (imageDataUrl) setImagePreview(imageDataUrl);
    } catch (error) {
      console.error("Failed to generate stat block image:", error);
      alert("Unable to generate the stat block image.");
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const downloadImage = () => {
    imageGeneratorRef.current?.download(imagePreview);
    closeImagePreview();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);

        setStatBlock({
          ...defaultStatBlock,
          ...imported,
          stats: normalizeStats(imported.stats),
          speeds: imported.speeds || defaultStatBlock.speeds,
          abilities: {
            ...defaultStatBlock.abilities,
            ...(imported.abilities || {}),
          },
          traits: {
            ...defaultStatBlock.traits,
            ...(imported.traits || {}),
            skills: normalizeTraitSkills(imported.traits?.skills),
          },
          attacks: {
            ...defaultStatBlock.attacks,
            ...(imported.attacks || {}),
            multiattack: {
              ...defaultStatBlock.attacks.multiattack,
              ...(imported.attacks?.multiattack || {}),
            },
          },
          bonusActions: Array.isArray(imported.bonusActions)
            ? imported.bonusActions
            : Array.isArray(imported.bonusActions?.bonusActions)
              ? imported.bonusActions.bonusActions
              : defaultStatBlock.bonusActions,
          reactions: Array.isArray(imported.reactions)
            ? imported.reactions
            : Array.isArray(imported.reactions?.reactions)
              ? imported.reactions.reactions
              : defaultStatBlock.reactions,
          size: imported.size || defaultStatBlock.size,
          theme: imported.theme || "default",
        });
      } catch (error) {
        console.error("Failed to load stat block:", error);
        alert("Invalid stat block JSON file.");
      }
    };

    reader.readAsText(file);
    e.target.value = "";
  };

  const saveStatBlockToSupabase = async () => {
    const { configured, userId, error } = await ensureAnonymousSession();

    if (!configured) {
      alert(
        "Add your Supabase environment variables before saving to the database.",
      );
      return false;
    }

    if (error || !userId) {
      console.error("Failed to initialize anonymous session:", error);
      alert(
        error?.friendlyMessage ||
          "Unable to create an anonymous Supabase session.",
      );
      return false;
    }

    const trimmedName = statBlock.name?.trim() || "Unnamed creature";

    const { data: existingRows, error: lookupError } = await supabase
      .from("stat_blocks")
      .select("id")
      .eq("user_id", userId)
      .ilike("name", trimmedName)
      .limit(1);

    if (lookupError) {
      console.error("Failed to check for existing stat block:", lookupError);
      alert("Unable to save stat block.");
      return false;
    }

    if (existingRows && existingRows.length > 0) {
      const { error: updateError } = await supabase
        .from("stat_blocks")
        .update({
          name: trimmedName,
          data: statBlock,
          created_at: new Date().toISOString(),
        })
        .eq("id", existingRows[0].id);

      if (updateError) {
        console.error("Failed to update stat block:", updateError);
        alert("Unable to update stat block.");
        return false;
      }

      alert("Stat block updated in the database.");
      return true;
    }

    const { error: insertError } = await supabase.from("stat_blocks").insert({
      user_id: userId,
      name: trimmedName,
      data: statBlock,
    });

    if (insertError) {
      console.error("Failed to save stat block:", insertError);
      alert("Unable to save stat block.");
      return false;
    }

    alert("Stat block saved to the database.");
    return true;
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();

    const submitAction =
      action || e.currentTarget?.value || e.nativeEvent?.submitter?.value;

    if (submitAction === "download-json") {
      const json = JSON.stringify(statBlock, null, 2);

      const blob = new Blob([json], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${statBlock.name || "stat-block"}.json`;
      link.click();

      URL.revokeObjectURL(url);
    }

    if (submitAction === "download-image") {
      openImagePreview();
    }

    if (submitAction === "save") {
      const saveSucceeded = await saveStatBlockToSupabase();

      if (saveSucceeded) {
        await fetchStatBlocks();
      }
    }
  };

  const fetchStatBlocks = async () => {
    setIsLoading(true);
    setLibraryError("");

    try {
      const { configured, userId, error } = await ensureAnonymousSession();

      if (!configured || error || !userId) {
        setLibraryError(
          "Unable to load saved stat blocks. Configure Supabase.",
        );
        setStatBlocks([]);
        setTotalPages(0);
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from("stat_blocks")
        .select("id, name, data, created_at", { count: "exact" })
        .eq("user_id", userId);

      const normalizedSearch = debouncedSearchQuery.trim();
      if (normalizedSearch) {
        query = query.ilike("name", `%${normalizedSearch}%`);
      }

      if (sortBy === "cr") {
        query = query
          .order("data->traits->challengeRating", { ascending: true })
          .order("name", { ascending: true });
      } else {
        query = query
          .order("created_at", { ascending: false })
          .order("name", { ascending: true });
      }

      const start = (pageNumber - 1) * ITEMS_PER_PAGE;
      query = query.range(start, start + ITEMS_PER_PAGE - 1);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        console.error("Failed to fetch stat blocks:", fetchError);
        setStatBlocks([]);
        setTotalPages(0);
        setLibraryError("Failed to load saved stat blocks. Please try again.");
        return;
      }

      setStatBlocks(data || []);
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching stat blocks:", error);
      setStatBlocks([]);
      setTotalPages(0);
      setLibraryError("An error occurred while loading stat blocks.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPageNumber(1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(value);
    }, 400);
  };

  useEffect(() => {
    fetchStatBlocks();
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [debouncedSearchQuery, sortBy, pageNumber]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle importing stat block from library
  const handleImportFromLibrary = (savedStatBlock) => {
    setPendingImportBlock(savedStatBlock);
  };

  const confirmImportFromLibrary = () => {
    if (!pendingImportBlock) {
      return;
    }

    const imported = pendingImportBlock.data;

    setStatBlock({
      ...defaultStatBlock,
      ...imported,
      stats: normalizeStats(imported.stats),
      speeds: imported.speeds || defaultStatBlock.speeds,
      abilities: {
        ...defaultStatBlock.abilities,
        ...(imported.abilities || {}),
      },
      traits: {
        ...defaultStatBlock.traits,
        ...(imported.traits || {}),
        skills: normalizeTraitSkills(imported.traits?.skills),
      },
      attacks: {
        ...defaultStatBlock.attacks,
        ...(imported.attacks || {}),
        multiattack: {
          ...defaultStatBlock.attacks.multiattack,
          ...(imported.attacks?.multiattack || {}),
        },
      },
      bonusActions: Array.isArray(imported.bonusActions)
        ? imported.bonusActions
        : Array.isArray(imported.bonusActions?.bonusActions)
          ? imported.bonusActions.bonusActions
          : defaultStatBlock.bonusActions,
      reactions: Array.isArray(imported.reactions)
        ? imported.reactions
        : Array.isArray(imported.reactions?.reactions)
          ? imported.reactions.reactions
          : defaultStatBlock.reactions,
      size: imported.size || defaultStatBlock.size,
      theme: imported.theme || "default",
    });

    setPendingImportBlock(null);
  };

  const handleDeleteFromLibrary = (savedStatBlock) => {
    setPendingDeleteBlock(savedStatBlock);
  };

  const confirmDeleteFromLibrary = async () => {
    if (!pendingDeleteBlock) {
      return;
    }

    try {
      const { configured, userId, error } = await ensureAnonymousSession();

      if (!configured || error || !userId) {
        setLibraryError("Unable to delete saved stat block.");
        setPendingDeleteBlock(null);
        return;
      }

      const { error: deleteError } = await supabase
        .from("stat_blocks")
        .delete()
        .eq("id", pendingDeleteBlock.id)
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Failed to delete stat block:", deleteError);
        setLibraryError("Failed to delete saved stat block.");
        setPendingDeleteBlock(null);
        return;
      }

      setStatBlocks((currentBlocks) =>
        currentBlocks.filter((block) => block.id !== pendingDeleteBlock.id),
      );
      setPendingDeleteBlock(null);
      setLibraryError("");
    } catch (error) {
      console.error("Error deleting stat block:", error);
      setLibraryError("An error occurred while deleting the stat block.");
      setPendingDeleteBlock(null);
    }
  };

  return (
    <div className="save-buttons">
      <section className="side-panel-section">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <button
          type="button"
          className="btn btn-secondary import"
          onClick={() => fileInputRef.current.click()}
        >
          Import Statblock JSON
        </button>

        <button
          className="btn btn-secondary bot"
          type="submit"
          name="action"
          value="save"
          onClick={(e) => handleSubmit(e)}
        >
          Save Statblock
        </button>

        <button
          className="btn btn-secondary bot"
          type="submit"
          name="action"
          value="download-image"
          onClick={(e) => handleSubmit(e)}
        >
          Download Statblock image
        </button>

        <button
          className="btn btn-secondary bot"
          type="submit"
          name="action"
          value="download-json"
          onClick={(e) => handleSubmit(e)}
        >
          Download Stat JSON data
        </button>
      </section>

      <section className="side-panel-section">
        <div className="undo-redo-controls">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={undo}
            disabled={!canUndo}
          >
            <FontAwesomeIcon icon={faArrowRotateLeft} aria-hidden="true" /> Undo
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={redo}
            disabled={!canRedo}
          >
            <FontAwesomeIcon icon={faArrowRotateRight} aria-hidden="true" />{" "}
            Redo
          </button>
        </div>
      </section>

      <section className="side-panel-section library-panel">
        <h3 className="library-heading">Saved Stat Blocks</h3>

        {pendingImportBlock && (
          <div className="library-import-modal" role="dialog" aria-modal="true">
            <div className="library-import-modal-content">
              <p>
                Import <strong>{pendingImportBlock.name || "Unnamed"}</strong>? <br />
                This will replace your current stat block.
              </p>
              <div className="library-import-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary bot"
                  onClick={() => setPendingImportBlock(null)}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-primary bot"
                  onClick={confirmImportFromLibrary}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {pendingDeleteBlock && (
          <div className="library-import-modal" role="dialog" aria-modal="true">
            <div className="library-import-modal-content">
              <p>
                Delete <strong>{pendingDeleteBlock.name || "Unnamed"}</strong>? <br />
                This removes it from your saved stat blocks.
              </p>
              <div className="library-import-modal-actions">
                <button
                  type="button"
                  className="btn btn-primary bot"
                  onClick={() => setPendingDeleteBlock(null)}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-primary bot"
                  onClick={confirmDeleteFromLibrary}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="library-search">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={handleSearch}
            className="library-search-input"
            aria-label="Search saved stat blocks by name"
          />
        </div>

        <div className="library-sort-controls">
          <button
            type="button"
            className={`btn btn-sort ${sortBy === "created" ? "active" : ""}`}
            onClick={() => {
              setSortBy("created");
              setPageNumber(1);
            }}
            aria-pressed={sortBy === "created"}
          >
            Newest
          </button>
          <button
            type="button"
            className={`btn btn-sort ${sortBy === "cr" ? "active" : ""}`}
            onClick={() => {
              setSortBy("cr");
              setPageNumber(1);
            }}
            aria-pressed={sortBy === "cr"}
          >
            CR
          </button>
        </div>

        {libraryError && (
          <div className="library-error" role="alert">
            <span className="library-error-icon" aria-hidden="true">
              !
            </span>
            {libraryError}
          </div>
        )}

        {isLoadingLibrary ? (
          <div className="library-loading" aria-live="polite">
            <FontAwesomeIcon icon={faSpinner} spin aria-hidden="true" />
            <span>Loading...</span>
          </div>
        ) : statBlocks.length > 0 ? (
          <>
            <div className="library-cards-grid">
              {statBlocks.map((block) => (
                <div key={block.id} className="library-card">
                  <button
                    type="button"
                    className="library-card-main"
                    onClick={() => handleImportFromLibrary(block)}
                    title={`Import ${block.name}`}
                  >
                    <span className="library-card-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </span>
                    <span className="library-card-body">
                      <span className="library-card-name">
                        {block.name || "Unnamed"}
                      </span>
                      <span className="library-card-meta">
                        <span className="library-card-cr">
                          CR {block.data?.traits?.challengeRating ?? "—"}
                        </span>
                        {block.created_at && (
                          <span className="library-card-date">
                            {formatSavedDate(block.created_at)}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    className="library-card-delete"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteFromLibrary(block);
                    }}
                    title={`Delete ${block.name}`}
                    aria-label={`Delete ${block.name}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="library-pagination">
                <button
                  type="button"
                  className="btn btn-secondary pagination-btn"
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber === 1}
                  aria-label="Previous page"
                >
                  Prev
                </button>
                <span className="pagination-info">
                  Page {pageNumber} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary pagination-btn"
                  onClick={() =>
                    setPageNumber(Math.min(totalPages, pageNumber + 1))
                  }
                  disabled={pageNumber === totalPages}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : !isLoadingLibrary ? (
          <div className="library-empty">No results</div>
        ) : null}
      </section>

      {(isGeneratingPreview || imagePreview) && (
        <div
          className="stat-block-image-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stat-block-image-modal-title"
        >
          <div className="stat-block-image-modal-content">
            <div className="stat-block-image-modal-header">
              <h2 id="stat-block-image-modal-title">Preview Statblock Image</h2>
              <button
                type="button"
                className="stat-block-image-modal-close"
                onClick={closeImagePreview}
                disabled={isGeneratingPreview}
                aria-label="Close image preview"
                title="Close image preview"
              >
                <FontAwesomeIcon icon={faXmark} aria-hidden="true" />
              </button>
            </div>
            {isGeneratingPreview ? (
              <p>Preparing image...</p>
            ) : (
              <img
                className="stat-block-image-modal-preview"
                src={imagePreview}
                alt={`Preview of ${statBlock.name || "stat block"}`}
              />
            )}
            <div className="stat-block-image-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeImagePreview}
                disabled={isGeneratingPreview}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={downloadImage}
                disabled={isGeneratingPreview || !imagePreview}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SaveUploads;
