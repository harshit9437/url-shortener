import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getUrl,
  getAnalytics,
  getClickTimeline,
} from "../services/api";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./Analytics.css";


function formatLocalDateTime(date) {

  const pad = (n) =>
    String(n).padStart(2, "0");

  return (
    `${date.getFullYear()}-` +
    `${pad(date.getMonth() + 1)}-` +
    `${pad(date.getDate())}T` +
    `${pad(date.getHours())}:` +
    `${pad(date.getMinutes())}:` +
    `${pad(date.getSeconds())}`
  );
}


function Analytics() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [url, setUrl] = useState(null);

  const [analytics, setAnalytics] =
    useState(null);

  const [timeline, setTimeline] =
    useState([]);

  const [range, setRange] =
    useState(7);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadAnalytics();

  }, [id]);


  const loadAnalytics = async () => {

    try {

      setLoading(true);

      const now = new Date();

      const from = new Date(
        now.getTime() -
        range * 24 * 60 * 60 * 1000
      );

      const fromString =
        formatLocalDateTime(from);

      const toString =
        formatLocalDateTime(now);


      const [
        urlResponse,
        analyticsResponse,
        timelineResponse,
      ] = await Promise.all([

        getUrl(id),

        getAnalytics(id),

        getClickTimeline(
          id,
          fromString,
          toString
        ),

      ]);


      setUrl(urlResponse.data);

      setAnalytics(
        analyticsResponse.data
      );


      const responseData =
        timelineResponse.data;


      let rawData = [];

      if (Array.isArray(responseData)) {

        rawData = responseData;

      } else {

        rawData =
          responseData?.data ||
          responseData?.timeline ||
          responseData?.content ||
          [];

      }


      setTimeline(
        rawData.map((item) => ({
          date:
            item.date ||
            item.day ||
            item.timestamp ||
            item.createdAt,

          clicks:
            Number(
              item.clicks ??
              item.clickCount ??
              item.count ??
              0
            ),
        }))
      );


    } catch (error) {

      console.error(error);

      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem("token");

        navigate("/login");

        return;
      }

    } finally {

      setLoading(false);

    }
  };


  const changeRange = async (days) => {

    setRange(days);

    try {

      const now = new Date();

      const from = new Date(
        now.getTime() -
        days * 24 * 60 * 60 * 1000
      );


      const response =
        await getClickTimeline(
          id,
          formatLocalDateTime(from),
          formatLocalDateTime(now)
        );


      const responseData =
        response.data;


      const rawData =
        Array.isArray(responseData)
          ? responseData
          : responseData?.data ||
            responseData?.timeline ||
            responseData?.content ||
            [];


      setTimeline(
        rawData.map((item) => ({
          date:
            item.date ||
            item.day ||
            item.timestamp ||
            item.createdAt,

          clicks:
            Number(
              item.clicks ??
              item.clickCount ??
              item.count ??
              0
            ),
        }))
      );

    } catch (error) {

      console.error(error);

    }
  };


  if (loading) {

    return (

      <div className="analytics-loading">

        Loading analytics...

      </div>

    );

  }


  return (

    <div className="analytics-page">

      {/* HEADER */}

      <div className="analytics-topbar">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to dashboard
        </button>

      </div>


      {/* MAIN */}

      <main className="analytics-container">


        <section className="analytics-intro">

          <div>

            <span className="eyebrow">
              LINK ANALYTICS
            </span>

            <h1>
              Performance overview
            </h1>

            <p>
              Understand how your short
              link is performing.
            </p>

          </div>


          <div className="link-preview">

            <span>
              SHORT URL
            </span>

            <a
              href={
                url?.shortUrl ||
                `http://localhost:8080/${url?.shortCode}`
              }
              target="_blank"
              rel="noreferrer"
            >
              {url?.shortUrl ||
                `http://localhost:8080/${url?.shortCode}`}
            </a>

          </div>

        </section>


        {/* STAT CARDS */}

        <section className="analytics-stats">


          <div className="big-stat">

            <span>
              TOTAL CLICKS
            </span>

            <strong>
              {analytics?.totalClicks ?? 0}
            </strong>

            <small>
              All time
            </small>

          </div>


          <div className="big-stat">

            <span>
              LAST CLICKED
            </span>

            <strong className="date-stat">

              {analytics?.lastClickedAt
                ? new Date(
                    analytics.lastClickedAt
                  ).toLocaleString()
                : "No clicks yet"}

            </strong>

            <small>
              Most recent activity
            </small>

          </div>


          <div className="big-stat">

            <span>
              CREATED
            </span>

            <strong className="date-stat">

              {analytics?.createdAt
                ? new Date(
                    analytics.createdAt
                  ).toLocaleDateString()
                : "-"}

            </strong>

            <small>
              Link creation date
            </small>

          </div>

        </section>


        {/* GRAPH */}

        <section className="graph-section">


          <div className="graph-header">

            <div>

              <span className="eyebrow">
                ACTIVITY
              </span>

              <h2>
                Click activity
              </h2>

              <p>
                Click performance over time.
              </p>

            </div>


            <div className="range-switch">

              <button
                className={
                  range === 7
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  changeRange(7)
                }
              >
                7D
              </button>

              <button
                className={
                  range === 30
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  changeRange(30)
                }
              >
                30D
              </button>

            </div>

          </div>


          {timeline.length > 0 ? (

            <div className="chart">

              <ResponsiveContainer
                width="100%"
                height={430}
              >

                <AreaChart
                  data={timeline}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="analyticsGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#8b7cff"
                        stopOpacity={0.45}
                      />

                      <stop
                        offset="100%"
                        stopColor="#8b7cff"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    stroke="#242735"
                    strokeDasharray="4 4"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="date"
                    stroke="#73778a"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {

                      const date =
                        new Date(value);

                      if (
                        Number.isNaN(
                          date.getTime()
                        )
                      ) {
                        return value;
                      }

                      return date.toLocaleDateString(
                        undefined,
                        {
                          day: "2-digit",
                          month: "short",
                        }
                      );

                    }}
                  />


                  <YAxis
                    stroke="#73778a"
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />


                  <Tooltip
                    contentStyle={{
                      background:
                        "#151722",
                      border:
                        "1px solid #343746",
                      borderRadius:
                        "12px",
                    }}
                    formatter={(value) => [
                      `${value} clicks`,
                      "Clicks",
                    ]}
                  />


                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#8b7cff"
                    strokeWidth={3}
                    fill="url(#analyticsGradient)"
                    dot={{
                      fill: "#8b7cff",
                      strokeWidth: 0,
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="no-data">

              <div className="no-data-icon">
                ↗
              </div>

              <h3>
                No click activity yet
              </h3>

              <p>
                Your graph will appear here
                once this link receives clicks.
              </p>

            </div>

          )}

        </section>


        {/* ORIGINAL URL */}

        <section className="destination-card">

          <span className="eyebrow">
            DESTINATION
          </span>

          <h2>
            Original URL
          </h2>

          <a
            href={url?.originalUrl}
            target="_blank"
            rel="noreferrer"
          >
            {url?.originalUrl}
          </a>

        </section>

      </main>

    </div>

  );
}


export default Analytics;