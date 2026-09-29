import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./Supabase";
import "./AccountControl.css";

export function AccountControl() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) {
          setUser(session?.user && !session.user.is_anonymous ? session.user : null);
        }
      },
    );

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        const currentUser = data.session?.user;
        setUser(currentUser && !currentUser.is_anonymous ? currentUser : null);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const closeDialog = () => {
    setIsOpen(false);
    setMessage("");
    setPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPasswordForm(false);
    setShowDeleteConfirmation(false);
    setDeleteConfirmation("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsBusy(true);
    setMessage("");

    try {
      if (!isSupabaseConfigured) {
        throw new Error("Account sign-in is not configured yet.");
      }

      if (mode === "sign-up") {
        const { data: sessionData } = await supabase.auth.getSession();
        const credentials = {
          email: email.trim(),
          password,
        };
        const { data, error } = sessionData.session?.user?.is_anonymous
          ? await supabase.auth.updateUser(credentials)
          : await supabase.auth.signUp(credentials);
        if (error) throw error;
        setPassword("");
        setMessage(data.session || data.user?.email_confirmed_at
          ? "Account created. You are signed in."
          : "Account created. Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        setPassword("");
        closeDialog();
      }
    } catch (error) {
      setMessage(error.message || "Unable to complete account sign-in.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignOut = async () => {
    setIsBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      closeDialog();
    } catch (error) {
      setMessage(error.message || "Unable to sign out.");
    } finally {
      setIsBusy(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setMessage("");
    if (newPassword !== confirmNewPassword) {
      setMessage("The new passwords do not match.");
      return;
    }

    setIsBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordForm(false);
      setMessage("Password changed.");
    } catch (error) {
      setMessage(error.message || "Unable to change password.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.rpc("delete_current_user");
      if (error) throw error;

      await supabase.auth.signOut({ scope: "local" });
      setUser(null);
      setPassword("");
      closeDialog();
    } catch (error) {
      setMessage(error.message || "Unable to delete account.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <button
        className="menu-btn account-trigger"
        type="button"
        disabled={isBusy}
        onClick={() => {
          if (user) {
            setMessage("");
            setIsOpen(true);
          } else {
            setMessage("");
            setIsOpen(true);
          }
        }}
      >
        {user
          ? `${user.email?.split("@")[0] || "Account"} · Account`
          : "Sign in"}
      </button>

      {isOpen && (
        <div
          className="account-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog();
          }}
        >
          <section
            className="account-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-dialog-title"
          >
            <div className="account-dialog-heading">
              <h2 id="account-dialog-title">
                {user ? "Your account" : mode === "sign-up" ? "Create account" : "Sign in"}
              </h2>
              <button
                className="account-close"
                type="button"
                aria-label="Close account dialog"
                onClick={closeDialog}
              >
                ×
              </button>
            </div>

            {user ? (
              <div className="account-signed-in">
                <p>Signed in as {user.email}</p>
                {showPasswordForm ? (
                  <form className="account-form" onSubmit={handlePasswordChange}>
                    <label>
                      New password
                      <input
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Confirm new password
                      <input
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        value={confirmNewPassword}
                        onChange={(event) => setConfirmNewPassword(event.target.value)}
                        required
                      />
                    </label>
                    <button className="menu-btn account-submit" type="submit" disabled={isBusy}>
                      {isBusy ? "Updating..." : "Update password"}
                    </button>
                    <button
                      className="account-mode-toggle"
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setNewPassword("");
                        setConfirmNewPassword("");
                        setMessage("");
                      }}
                    >
                      Cancel password change
                    </button>
                  </form>
                ) : (
                  <button
                    className="menu-btn account-action"
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(true);
                      setShowDeleteConfirmation(false);
                      setMessage("");
                    }}
                  >
                    Change password
                  </button>
                )}

                {showDeleteConfirmation ? (
                  <div className="account-delete-confirmation">
                    <p>This permanently deletes your account and saved characters and stat blocks.</p>
                    <label>
                      Type DELETE to confirm
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(event) => setDeleteConfirmation(event.target.value)}
                        autoComplete="off"
                      />
                    </label>
                    <button
                      className="menu-btn account-delete-button"
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isBusy || deleteConfirmation !== "DELETE"}
                    >
                      {isBusy ? "Deleting..." : "Permanently delete account"}
                    </button>
                    <button
                      className="account-mode-toggle"
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirmation(false);
                        setDeleteConfirmation("");
                        setMessage("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    className="menu-btn account-delete-button"
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirmation(true);
                      setShowPasswordForm(false);
                      setMessage("");
                    }}
                  >
                    Delete account
                  </button>
                )}

                <button
                  className="menu-btn account-action"
                  type="button"
                  onClick={handleSignOut}
                  disabled={isBusy}
                >
                  {isBusy ? "Please wait..." : "Log out"}
                </button>
              </div>
            ) : (
              <form className="account-form" onSubmit={handleSubmit}>
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <button
                  className="menu-btn account-submit"
                  type="submit"
                  disabled={isBusy || !isSupabaseConfigured}
                >
                  {isBusy
                    ? "Please wait..."
                    : mode === "sign-up"
                      ? "Create account"
                      : "Sign in"}
                </button>
                {!isSupabaseConfigured && (
                  <p className="account-message" role="status">
                    Add the Supabase URL and publishable key to enable accounts.
                  </p>
                )}
                <button
                  className="account-mode-toggle"
                  type="button"
                  onClick={() => {
                    setMode(mode === "sign-up" ? "sign-in" : "sign-up");
                    setMessage("");
                  }}
                >
                  {mode === "sign-up"
                    ? "Already have an account? Sign in"
                    : "Need an account? Create one"}
                </button>
              </form>
            )}

            {message && <p className="account-message" role="status">{message}</p>}

            <details className="account-privacy">
              <summary>Privacy notice</summary>
              <p>
                Your email address and password are used only to create and
                authenticate your account. Saved characters and stat blocks
                are linked to your account so they can be saved and loaded.
                Supabase processes this information to provide the app's
                account and storage features. It is not used for advertising,
                analytics, or unrelated purposes, and this app does not store
                your password.
              </p>
            </details>
          </section>
        </div>
      )}
    </>
  );
}