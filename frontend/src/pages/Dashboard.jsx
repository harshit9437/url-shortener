import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";

import {
  createShortUrl,
  getMyUrls,
  disableUrl,
} from "../services/api";

import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");

  const [urls, setUrls] = useState([]);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadUrls();
  }, [navigate]);

  const loadUrls = async () => {
    try {
      setLoadingUrls(true);

      const response = await getMyUrls();

      let data = response.data;

      if (!Array.isArray(data)) {
        data =
          data?.data ||
          data?.content ||
          data?.urls ||
          [];
      }

      setUrls(data);
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setMessage(
        error.response?.data?.message ||
        "Failed to load your links"
      );
    } finally {
      setLoadingUrls(false);
    }
  };

  const handleCreateUrl = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      await createShortUrl({
        originalUrl: url,
        customAlias: customAlias.trim() || null,
      });

      setUrl("");
      setCustomAlias("");

      setMessage("Short URL created successfully");

      await loadUrls();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      setMessage(
        error.response?.data?.message ||
        "Failed to create short URL"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setMessage("Short URL copied!");
    } catch {
      setMessage("Could not copy URL");
    }
  };

  const handleDisable = async (item) => {
    try {
      await disableUrl(item.id);

      setMessage("Short URL disabled");

      await loadUrls();
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
        "Failed to disable URL"
      );
    }
  };

  const filteredUrls = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return urls;

    return urls.filter((item) =>
      item.originalUrl
        ?.toLowerCase()
        .includes(query) ||
      item.shortCode
        ?.toLowerCase()
        .includes(query)
    );
  }, [urls, search]);

  const totalLinks = urls.length;

  const activeLinks = urls.filter(
    (item) =>
      item.status === "ACTIVE" ||
      item.active === true
  ).length;

  const disabledLinks = urls.filter(
    (item) =>
      item.status === "DISABLED" ||
      item.active === false
  ).length;

  const totalClicks = urls.reduce(
    (sum, item) =>
      sum + Number(item.clickCount || 0),
    0
  );

  return (
    <>
      <Navbar />

      <main className="dashboard">

        {/* HEADER */}

        <section className="dashboard-hero">

          <div>
            <span className="eyebrow">
              LINK WORKSPACE
            </span>

            <h1>
              Your links,
              <span> simplified.</span>
            </h1>

            <p>
              Create, manage and understand
              everything behind your short links.
            </p>
          </div>

        </section>


        {/* STATS */}

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon purple">
              ↗
            </div>

            <div>
              <span>Total links</span>
              <strong>{totalLinks}</strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon green">
              ●
            </div>

            <div>
              <span>Active links</span>
              <strong>{activeLinks}</strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon blue">
              ◉
            </div>

            <div>
              <span>Total clicks</span>
              <strong>{totalClicks}</strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon red">
              ×
            </div>

            <div>
              <span>Disabled</span>
              <strong>{disabledLinks}</strong>
            </div>
          </div>

        </section>


        {/* CREATE */}

        <section className="create-card">

          <div className="create-heading">

            <div>
              <span className="eyebrow">
                CREATE
              </span>

              <h2>
                Shorten a new link
              </h2>
            </div>

            <div className="create-symbol">
              +
            </div>

          </div>


          <form
            className="create-form"
            onSubmit={handleCreateUrl}
          >

            <input
              type="url"
              placeholder="Paste your long URL"
              value={url}
              onChange={(e) =>
                setUrl(e.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Custom alias (optional)"
              value={customAlias}
              onChange={(e) =>
                setCustomAlias(e.target.value)
              }
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Shorten URL →"}
            </button>

          </form>

        </section>


        {message && (
          <div className="message">
            {message}
          </div>
        )}


        {/* LINKS */}

        <section className="links-card">

          <div className="links-heading">

            <div>
              <span className="eyebrow">
                WORKSPACE
              </span>

              <h2>Your links</h2>

              <p>
                {urls.length} links in your workspace
              </p>
            </div>

            <span className="shown-count">
              {filteredUrls.length} shown
            </span>

          </div>


          <div className="search-wrapper">
            <span>⌕</span>

            <input
              placeholder="Search your links..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>


          {loadingUrls && (
            <div className="empty-state">
              Loading your links...
            </div>
          )}


          {!loadingUrls &&
            filteredUrls.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  ↗
                </div>

                <h3>
                  No links found
                </h3>

                <p>
                  Create your first short
                  URL above.
                </p>
              </div>
            )}


          {!loadingUrls &&
            filteredUrls.length > 0 && (

              <div className="links-list">

                {filteredUrls.map((item) => {

                  const shortUrl =
                    item.shortUrl ||
                    `http://localhost:8080/${item.shortCode}`;

                  const isDisabled =
                    item.status === "DISABLED" ||
                    item.active === false;

                  return (

                    <div
                      className="link-row"
                      key={item.id}
                    >

                      <div className="link-avatar">
                        {(
                          item.originalUrl ||
                          "U"
                        )
                          .replace(
                            /^https?:\/\//,
                            ""
                          )
                          .charAt(0)
                          .toUpperCase()}
                      </div>


                      <div className="link-content">

                        <div className="link-main">

                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="short-link"
                          >
                            {shortUrl}
                          </a>

                          <span
                            className={
                              `status ${
                                isDisabled
                                  ? "status-disabled"
                                  : "status-active"
                              }`
                            }
                          >
                            {isDisabled
                              ? "DISABLED"
                              : "ACTIVE"}
                          </span>

                        </div>


                        <div className="original-link">
                          ↳ {item.originalUrl}
                        </div>


                        <div className="link-meta">
                          {Number(
                            item.clickCount || 0
                          )} clicks
                          <span>•</span>
                          Created recently
                        </div>

                      </div>


                      <div className="link-actions">

                        <button
                          onClick={() =>
                            handleCopy(shortUrl)
                          }
                        >
                          Copy
                        </button>


                        <button
                          className="analytics-button"
                          onClick={() =>
                            navigate(
                              `/analytics/${item.id}`
                            )
                          }
                        >
                          Analytics
                        </button>


                        <button
                          className="disable-button"
                          disabled={isDisabled}
                          onClick={() =>
                            handleDisable(item)
                          }
                        >
                          Disable
                        </button>

                      </div>

                    </div>

                  );
                })}

              </div>
            )}

        </section>

      </main>
    </>
  );
}

export default Dashboard;