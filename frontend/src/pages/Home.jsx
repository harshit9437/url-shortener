import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createShortUrl } from "../services/api";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await createShortUrl({
        originalUrl: url,
        customAlias: customAlias || null,
      });

      setUrl("");
      setCustomAlias("");

      navigate("/dashboard");

    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.message ||
        "Unable to create short URL"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">

      <Navbar />

      <main>

        {/* HERO */}

        <section className="hero">

          <div className="hero-badge">
            <span>✦</span>
            Simple. Fast. Trackable.
          </div>

          <h1>
            Make your links
            <br />
            <span>shorter.</span>
          </h1>

          <p className="hero-subtitle">
            Create powerful short links and track
            every click from one place.
          </p>


          {/* CREATE CARD */}

          <section className="home-create-card">

            <form onSubmit={handleCreate}>

              <div className="input-wrapper">

                <span className="input-icon">
                  ↗
                </span>

                <input
                  type="url"
                  placeholder="Paste your long URL"
                  value={url}
                  onChange={(e) =>
                    setUrl(e.target.value)
                  }
                  required
                />

              </div>


              <div className="input-wrapper">

                <span className="input-icon">
                  #
                </span>

                <input
                  type="text"
                  placeholder="Custom alias (optional)"
                  value={customAlias}
                  onChange={(e) =>
                    setCustomAlias(e.target.value)
                  }
                />

              </div>


              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Shorten URL →"}
              </button>

            </form>


            {message && (
              <div className="home-message">
                {message}
              </div>
            )}

          </section>


          {/* TRUST TEXT */}

          <div className="hero-features">

            <div>
              <span className="feature-icon">
                ⚡
              </span>

              <div>
                <strong>Fast redirects</strong>
                <small>
                  Built for speed
                </small>
              </div>
            </div>


            <div>
              <span className="feature-icon">
                ◉
              </span>

              <div>
                <strong>Click analytics</strong>
                <small>
                  Know what performs
                </small>
              </div>
            </div>


            <div>
              <span className="feature-icon">
                🔒
              </span>

              <div>
                <strong>Secure links</strong>
                <small>
                  Protected by authentication
                </small>
              </div>
            </div>

          </div>

        </section>


        {/* BOTTOM SECTION */}

        <section className="home-bottom">

          <div className="bottom-card">

            <div className="bottom-icon purple">
              ↗
            </div>

            <h3>
              Short links that work.
            </h3>

            <p>
              Turn long, messy URLs into clean
              links that are easy to share.
            </p>

          </div>


          <div className="bottom-card">

            <div className="bottom-icon blue">
              ◉
            </div>

            <h3>
              Understand every click.
            </h3>

            <p>
              Track clicks and understand how
              your links perform over time.
            </p>

          </div>


          <div className="bottom-card">

            <div className="bottom-icon green">
              ✦
            </div>

            <h3>
              Built for developers.
            </h3>

            <p>
              Java, Spring Boot and PostgreSQL
              powering the backend.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Home;