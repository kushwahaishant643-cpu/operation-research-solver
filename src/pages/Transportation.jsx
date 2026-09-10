import { useState } from "react";
import axios from "axios";

function Transportation() {
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [method, setMethod] = useState("north_west");

  const [costs, setCosts] = useState(
    Array.from({ length: 3 }, () => Array(3).fill(0))
  );

  const [supply, setSupply] = useState([0, 0, 0]);
  const [demand, setDemand] = useState([0, 0, 0]);

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const totalSupply = supply.reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  const totalDemand = demand.reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  const isBalanced =
    totalSupply === totalDemand && totalSupply > 0;

  const handleRowsChange = (value) => {
    const newRows = Math.max(1, Number(value));

    setRows(newRows);

    setCosts((old) =>
      Array.from({ length: newRows }, (_, i) =>
        Array.from(
          { length: columns },
          (_, j) => old[i]?.[j] ?? 0
        )
      )
    );

    setSupply((old) =>
      Array.from(
        { length: newRows },
        (_, i) => old[i] ?? 0
      )
    );

    setResult(null);
    setError("");
  };

  const handleColumnsChange = (value) => {
    const newColumns = Math.max(1, Number(value));

    setColumns(newColumns);

    setCosts((old) =>
      Array.from({ length: rows }, (_, i) =>
        Array.from(
          { length: newColumns },
          (_, j) => old[i]?.[j] ?? 0
        )
      )
    );

    setDemand((old) =>
      Array.from(
        { length: newColumns },
        (_, j) => old[j] ?? 0
      )
    );

    setResult(null);
    setError("");
  };

  const handleCostChange = (i, j, value) => {
    const newCosts = costs.map((row) => [...row]);
    newCosts[i][j] = Number(value);
    setCosts(newCosts);
    setResult(null);
  };

  const handleSupplyChange = (i, value) => {
    const newSupply = [...supply];
    newSupply[i] = Number(value);
    setSupply(newSupply);
    setResult(null);
  };

  const handleDemandChange = (j, value) => {
    const newDemand = [...demand];
    newDemand[j] = Number(value);
    setDemand(newDemand);
    setResult(null);
  };

  const handleSolve = async () => {
    setError("");
    setResult(null);

    if (!isBalanced) {
      setError(
        "Total supply and total demand must be equal and greater than zero."
      );
      return;
    }

    try {
      let endpoint = "";

      if (method === "north_west") {
        endpoint =
          "https://backend-6wiicnc4i-ishant-coders.vercel.app/api/transportation/north-west";
      }

      if (method === "least_cost") {
        endpoint =
          "https://backend-6wiicnc4i-ishant-coders.vercel.app/api/transportation/least-cost";
      }

      if (method === "vogel") {
        endpoint =
          "https://backend-6wiicnc4i-ishant-coders.vercel.app/api/transportation/vogel";
      }

      if (method === "modi") {
        endpoint =
          "https://backend-6wiicnc4i-ishant-coders.vercel.app/api/transportation/modi";
      }

      const response = await axios.post(endpoint, {
        costs,
        supply,
        demand,
      });

      setResult(response.data.result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect with the backend."
      );
    }
  };

  const getMethodName = () => {
    if (method === "north_west") return "North-West Corner";
    if (method === "least_cost") return "Least Cost Method";
    if (method === "vogel") return "Vogel's Approximation Method";
    return "MODI Method";
  };

  const getMethodShort = () => {
    if (method === "north_west") return "NW";
    if (method === "least_cost") return "LC";
    if (method === "vogel") return "VA";
    return "M";
  };


  /* ============================================================
     STEP-BY-STEP TRANSPORTATION SOLUTION
     This section is explanatory only. Existing solver/result logic
     and backend API are intentionally left unchanged.
  ============================================================ */

  const formatNumber = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "0";
    return Number.isInteger(n)
      ? String(n)
      : Number(n.toFixed(2)).toString();
  };

  const getAllocationCostTerms = () => {
    if (!result?.allocation) return [];

    const terms = [];

    result.allocation.forEach((row, i) => {
      row.forEach((allocation, j) => {
        const quantity = Number(allocation || 0);
        const cost = Number(costs[i]?.[j] || 0);

        if (quantity > 0) {
          terms.push({
            source: `S${i + 1}`,
            destination: `D${j + 1}`,
            quantity,
            cost,
            value: quantity * cost,
          });
        }
      });
    });

    return terms;
  };

  const getStepByStepData = () => {
    if (!result) return null;

    const terms = getAllocationCostTerms();
    const calculation =
      terms.length > 0
        ? terms
            .map(
              (term) =>
                `${formatNumber(term.quantity)} Ã— ${formatNumber(term.cost)}`
            )
            .join(" + ")
        : "No positive allocation";

    const calculationTotal = terms.reduce(
      (sum, term) => sum + term.value,
      0
    );

    return {
      terms,
      calculation,
      calculationTotal,
      methodName: getMethodName(),
    };
  };

  const stepData = getStepByStepData();

  const colors = {
    bg: "#020b16",
    navy: "#061525",
    navy2: "#081b2d",
    panel: "#071a2d",
    panel2: "#092139",
    border: "#16456b",
    borderBright: "#1d659b",
    blue: "#0788ff",
    blue2: "#18a6ff",
    cyan: "#27d7ff",
    white: "#f4f8fc",
    text: "#dce9f5",
    muted: "#8ba7c0",
    green: "#31e4b0",
    purple: "#7b5cff",
    orange: "#f59d27",
  };

  const styles = {
    panel: {
      background:
        "linear-gradient(145deg, rgba(8,31,52,.98), rgba(4,17,30,.98))",
      border: `1px solid ${colors.border}`,
      borderRadius: "8px",
      boxShadow:
        "0 12px 35px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.025)",
    },

    input: {
      background: "#031323",
      border: `1px solid #185078`,
      color: colors.white,
      borderRadius: "6px",
      minHeight: "43px",
      boxShadow: "inset 0 1px 7px rgba(0,0,0,.22)",
    },

    th: {
      background: "#0a3151",
      color: "#cce8fa",
      borderColor: "#15517d",
      fontSize: "10px",
      fontWeight: "700",
      letterSpacing: ".8px",
      textTransform: "uppercase",
      padding: "13px 10px",
    },

    td: {
      background: "#06192b",
      color: colors.text,
      borderColor: "#124064",
      padding: "9px",
    },
  };

  /* ============================================================
     PROFESSIONAL INDUSTRIAL TRUCK
  ============================================================ */

  const TruckGraphic = () => {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: "300px",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 70% 30%, rgba(22,105,160,.28), transparent 35%), linear-gradient(135deg,#061827,#082b44 55%,#03111e)",
        }}
      >
        {/* Port / city atmosphere */}

        <div
          style={{
            position: "absolute",
            left: "3%",
            bottom: "72px",
            width: "34%",
            height: "95px",
            opacity: ".42",
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "5%",
              width: "25px",
              height: "75px",
              background: "#17374f",
              border: "1px solid #286180",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "17%",
              width: "43px",
              height: "54px",
              background: "#15344c",
              border: "1px solid #286180",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "38%",
              width: "30px",
              height: "90px",
              background: "#173b55",
              border: "1px solid #286180",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "58%",
              width: "52px",
              height: "62px",
              background: "#15354d",
              border: "1px solid #286180",
            }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "83%",
              width: "25px",
              height: "105px",
              background: "#193e59",
              border: "1px solid #286180",
            }}
          />
        </div>

        {/* Crane */}

        <div
          style={{
            position: "absolute",
            left: "7%",
            bottom: "125px",
            width: "95px",
            height: "130px",
            opacity: ".5",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "15px",
              bottom: 0,
              width: "3px",
              height: "120px",
              background: "#38728f",
              transform: "rotate(7deg)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "15px",
              top: "5px",
              width: "90px",
              height: "3px",
              background: "#38728f",
              transform: "rotate(-5deg)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "74px",
              top: "3px",
              width: "3px",
              height: "95px",
              background: "#38728f",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "69px",
              top: "92px",
              width: "40px",
              height: "2px",
              background: "#38728f",
            }}
          />
        </div>

        {/* World map dots */}

        <div
          style={{
            position: "absolute",
            right: "4%",
            top: "12%",
            width: "38%",
            height: "45%",
            opacity: ".32",
          }}
        >
          {Array.from({ length: 70 }).map((_, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                width: i % 7 === 0 ? "3px" : "2px",
                height: i % 7 === 0 ? "3px" : "2px",
                borderRadius: "50%",
                background: colors.blue2,
                left: `${(i * 37) % 96}%`,
                top: `${(i * 61) % 86}%`,
              }}
            />
          ))}
        </div>

        {/* Route */}

        <svg
          viewBox="0 0 700 350"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            right: "0",
            top: "0",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <path
            d="M500 100 C555 70 570 125 610 135 C650 145 660 105 685 82"
            fill="none"
            stroke="#21cfff"
            strokeWidth="2"
            strokeDasharray="7 7"
            opacity=".9"
          />

          <circle
            cx="500"
            cy="100"
            r="7"
            fill="#22d8ff"
          />

          <circle
            cx="685"
            cy="82"
            r="7"
            fill="#35e7b0"
          />
        </svg>

        {/* Source */}

        <div
          style={{
            position: "absolute",
            right: "30%",
            top: "22%",
            color: colors.white,
            fontSize: "9px",
            fontWeight: "700",
            background: "rgba(3,19,32,.88)",
            border: "1px solid #2177a8",
            borderRadius: "5px",
            padding: "7px 10px",
          }}
        >
          <span style={{ color: colors.cyan }}>
            â—
          </span>{" "}
          SOURCE
        </div>

        {/* Destination */}

        <div
          style={{
            position: "absolute",
            right: "3%",
            top: "34%",
            color: colors.white,
            fontSize: "9px",
            fontWeight: "700",
            background: "rgba(3,19,32,.88)",
            border: "1px solid #21866e",
            borderRadius: "5px",
            padding: "7px 10px",
          }}
        >
          <span style={{ color: colors.green }}>
            â—
          </span>{" "}
          DESTINATION
        </div>

        {/* Road */}

        <div
          style={{
            position: "absolute",
            left: "-5%",
            right: "-5%",
            bottom: "32px",
            height: "74px",
            background:
              "linear-gradient(180deg,#0a1d2c,#030b13)",
            transform: "perspective(250px) rotateX(16deg)",
            borderTop: "1px solid #31536a",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "5%",
            right: "5%",
            bottom: "58px",
            height: "3px",
            background:
              "repeating-linear-gradient(90deg,#527286 0 45px,transparent 45px 78px)",
            opacity: ".65",
          }}
        />

        {/* TRUCK BODY */}

        <div
          style={{
            position: "absolute",
            left: "23%",
            bottom: "58px",
            width: "49%",
            height: "135px",
            filter:
              "drop-shadow(0 15px 16px rgba(0,0,0,.55))",
          }}
        >
          {/* Trailer */}

          <div
            style={{
              position: "absolute",
              left: 0,
              top: "8px",
              width: "68%",
              height: "100px",
              borderRadius: "5px 2px 2px 5px",
              background:
                "linear-gradient(90deg,#4e7186,#91a9b7 38%,#54788e)",
              border: "2px solid #9bb7c7",
              boxShadow:
                "inset 0 0 18px rgba(0,0,0,.28)",
            }}
          >
            {/* Trailer lines */}

            {[12, 27, 42, 57, 72, 87].map(
              (x) => (
                <div
                  key={x}
                  style={{
                    position: "absolute",
                    left: `${x}%`,
                    top: 0,
                    bottom: 0,
                    width: "1px",
                    background:
                      "rgba(15,45,63,.45)",
                  }}
                />
              )
            )}

            <div
              style={{
                position: "absolute",
                left: "7%",
                top: "15%",
                fontSize: "8px",
                letterSpacing: "2px",
                fontWeight: "800",
                color: "#dbe8ee",
              }}
            >
              LOGISTICS
            </div>

            <div
              style={{
                position: "absolute",
                left: "7%",
                top: "29%",
                fontSize: "19px",
                letterSpacing: "1px",
                fontWeight: "800",
                color: "#18384c",
              }}
            >
              OR
            </div>
          </div>

          {/* Cabin */}

          <div
            style={{
              position: "absolute",
              right: 0,
              top: "35px",
              width: "34%",
              height: "100px",
              background:
                "linear-gradient(145deg,#1575ae,#07507d 65%,#073754)",
              clipPath:
                "polygon(18% 0,75% 0,100% 43%,100% 100%,0 100%,0 22%)",
              borderRadius: "8px",
            }}
          >
            {/* Windshield */}

            <div
              style={{
                position: "absolute",
                left: "22%",
                top: "11%",
                width: "55%",
                height: "38%",
                background:
                  "linear-gradient(145deg,#9ccce1,#153e59)",
                clipPath:
                  "polygon(12% 0,84% 0,100% 100%,0 100%)",
                border:
                  "2px solid rgba(190,230,245,.55)",
              }}
            />

            {/* Headlight */}

            <div
              style={{
                position: "absolute",
                right: "2%",
                bottom: "20%",
                width: "13px",
                height: "8px",
                background: "#d9f3ff",
                boxShadow:
                  "0 0 10px rgba(180,235,255,.8)",
                borderRadius: "2px",
              }}
            />
          </div>

          {/* Chassis */}

          <div
            style={{
              position: "absolute",
              left: "2%",
              right: "-2%",
              bottom: "22px",
              height: "10px",
              background: "#172d3d",
              borderRadius: "4px",
            }}
          />

          {/* Wheels */}

          {[18, 51, 83].map((x, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x}%`,
                bottom: "-2px",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle,#617582 0 18%,#182632 20% 47%,#050b11 50%)",
                border: "3px solid #273e4d",
                boxShadow:
                  "0 4px 8px rgba(0,0,0,.55)",
              }}
            />
          ))}
        </div>

        {/* Bottom status */}

        <div
          style={{
            position: "absolute",
            left: "4%",
            bottom: "10px",
            color: "#7fa9c1",
            fontSize: "8px",
            letterSpacing: "1.3px",
            fontWeight: "700",
          }}
        >
          ROUTE NETWORK / ACTIVE
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.white,
        fontFamily:
          "Inter, Segoe UI, Arial, sans-serif",
        paddingBottom: "60px",
      }}
    >
      <div
        className="container-fluid"
        style={{
          maxWidth: "1500px",
          padding: "0 26px 50px",
        }}
      >
        {/* ======================================================
            TOP NAV
        ======================================================= */}

        <div
          style={{
            height: "64px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom:
              "1px solid rgba(35,90,125,.55)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "8px",
                background:
                  "linear-gradient(145deg,#0ca9ff,#0755a5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "900",
                fontSize: "13px",
                boxShadow:
                  "0 0 18px rgba(0,139,255,.22)",
              }}
            >
              OR
            </div>

            <div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "800",
                  letterSpacing: ".2px",
                }}
              >
                OR Solver
              </div>

              <div
                style={{
                  color: colors.muted,
                  fontSize: "9px",
                  marginTop: "2px",
                }}
              >
                OPERATIONS RESEARCH
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div
              className="d-none d-md-block"
              style={{
                color: colors.green,
                fontSize: "10px",
                fontWeight: "700",
              }}
            >
              â— System Online
            </div>

            <div
              style={{
                color: colors.muted,
                fontSize: "18px",
              }}
            >
              âš™
            </div>

            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "#17334c",
                border:
                  "1px solid #2d6387",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.white,
                fontSize: "10px",
                fontWeight: "700",
              }}
            >
              OR
            </div>
          </div>
        </div>

        {/* ======================================================
            HERO
        ======================================================= */}

        <div
          style={{
            ...styles.panel,
            marginTop: "16px",
            overflow: "hidden",
            borderColor: "#145987",
          }}
        >
          <div
            className="row g-0"
            style={{ minHeight: "315px" }}
          >
            <div
              className="col-lg-4"
              style={{
                padding: "34px 38px",
                background:
                  "linear-gradient(110deg,#061a2b,#07243a)",
                position: "relative",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  color: colors.cyan,
                  fontSize: "10px",
                  letterSpacing: "2px",
                  fontWeight: "800",
                  marginBottom: "13px",
                }}
              >
                TRANSPORTATION PROBLEM
              </div>

              <h1
                style={{
                  fontSize:
                    "clamp(2rem,3.2vw,3.15rem)",
                  lineHeight: "1.02",
                  fontWeight: "800",
                  margin: 0,
                  letterSpacing: "-1.8px",
                }}
              >
                Optimize Your
                <br />
                <span
                  style={{
                    color: colors.blue2,
                  }}
                >
                  Supply Chain
                </span>
              </h1>

              <p
                style={{
                  color: "#a9c2d7",
                  fontSize: "12px",
                  lineHeight: "1.7",
                  marginTop: "17px",
                  maxWidth: "350px",
                }}
              >
                Find an efficient transportation plan to
                minimize total cost using classical
                Operations Research methods.
              </p>

              <div
                className="d-flex gap-2 flex-wrap"
                style={{ marginTop: "22px" }}
              >
                {[
                  ["â–£", "4 Methods"],
                  ["âŒ", "Step-by-Step Analysis"],
                  ["â—Ž", "Optimal Solutions"],
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      border:
                        "1px solid #1b6796",
                      background:
                        "rgba(5,27,45,.72)",
                      borderRadius: "6px",
                      padding: "9px 11px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#cbe7f7",
                      fontSize: "9px",
                      fontWeight: "700",
                    }}
                  >
                    <span
                      style={{
                        color: colors.cyan,
                        fontSize: "15px",
                      }}
                    >
                      {item[0]}
                    </span>

                    {item[1]}
                  </div>
                ))}
              </div>
            </div>

            <div
              className="col-lg-8"
              style={{
                minHeight: "315px",
              }}
            >
              <TruckGraphic />
            </div>
          </div>
        </div>

        {/* ======================================================
            MAIN GRID
        ======================================================= */}

        <div
          className="row g-3"
          style={{ marginTop: "14px" }}
        >
          {/* LEFT COLUMN */}

          <div className="col-xl-8">
            {/* CONFIGURATION */}

            <div style={styles.panel}>
              <div
                style={{
                  padding: "17px 19px",
                  borderBottom:
                    "1px solid #16456b",
                  display: "flex",
                  alignItems: "center",
                  gap: "13px",
                }}
              >
                <div
                  style={{
                    width: "31px",
                    height: "31px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(145deg,#169cff,#0759ad)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "800",
                    fontSize: "13px",
                  }}
                >
                  1
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                    }}
                  >
                    Problem Configuration
                  </div>

                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "9px",
                      marginTop: "3px",
                    }}
                  >
                    Configure your transportation problem.
                  </div>
                </div>
              </div>

              <div style={{ padding: "18px" }}>
                <div
                  style={{
                    border:
                      "1px solid #16537c",
                    borderRadius: "7px",
                    padding: "17px",
                    background:
                      "rgba(2,18,31,.65)",
                  }}
                >
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label
                        style={{
                          display: "block",
                          color: "#b7d0e2",
                          fontSize: "10px",
                          marginBottom: "7px",
                        }}
                      >
                        Number of Sources
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={rows}
                        onChange={(e) =>
                          handleRowsChange(
                            e.target.value
                          )
                        }
                        className="form-control"
                        style={styles.input}
                      />
                    </div>

                    <div className="col-md-4">
                      <label
                        style={{
                          display: "block",
                          color: "#b7d0e2",
                          fontSize: "10px",
                          marginBottom: "7px",
                        }}
                      >
                        Number of Destinations
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={columns}
                        onChange={(e) =>
                          handleColumnsChange(
                            e.target.value
                          )
                        }
                        className="form-control"
                        style={styles.input}
                      />
                    </div>

                    <div className="col-md-4">
                      <label
                        style={{
                          display: "block",
                          color: "#b7d0e2",
                          fontSize: "10px",
                          marginBottom: "7px",
                        }}
                      >
                        Select Method
                      </label>

                      <select
                        value={method}
                        onChange={(e) => {
                          setMethod(e.target.value);
                          setResult(null);
                        }}
                        className="form-select"
                        style={styles.input}
                      >
                        <option value="north_west">
                          North-West Corner
                        </option>

                        <option value="least_cost">
                          Least Cost Method
                        </option>

                        <option value="vogel">
                          Vogel's Approximation Method
                        </option>

                        <option value="modi">
                          MODI Method
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COST TABLE */}

            <div
              style={{
                ...styles.panel,
                marginTop: "14px",
              }}
            >
              <div
                style={{
                  padding: "17px 19px",
                  borderBottom:
                    "1px solid #16456b",
                  display: "flex",
                  alignItems: "center",
                  gap: "13px",
                }}
              >
                <div
                  style={{
                    width: "31px",
                    height: "31px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(145deg,#169cff,#0759ad)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "800",
                    fontSize: "13px",
                  }}
                >
                  2
                </div>

                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "800",
                    }}
                  >
                    Transportation Cost Table
                  </div>

                  <div
                    style={{
                      color: colors.muted,
                      fontSize: "9px",
                      marginTop: "3px",
                    }}
                  >
                    Enter cost, supply and demand values.
                  </div>
                </div>
              </div>

              <div style={{ padding: "18px" }}>
                <div className="table-responsive">
                  <table
                    className="table align-middle text-center mb-0"
                    style={{
                      minWidth: "650px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={styles.th}>
                          Source / Destination
                        </th>

                        {Array.from(
                          { length: columns },
                          (_, j) => (
                            <th
                              key={j}
                              style={styles.th}
                            >
                              D{j + 1}
                            </th>
                          )
                        )}

                        <th
                          style={{
                            ...styles.th,
                            background: "#0b4b78",
                            color: "#54d8ff",
                          }}
                        >
                          Supply
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {costs.map((row, i) => (
                        <tr key={i}>
                          <th
                            style={{
                              ...styles.td,
                              background:
                                "#08243a",
                              color:
                                colors.white,
                              fontSize: "11px",
                            }}
                          >
                            S{i + 1}
                          </th>

                          {row.map(
                            (value, j) => (
                              <td
                                key={j}
                                style={styles.td}
                              >
                                <input
                                  type="number"
                                  value={value}
                                  onChange={(e) =>
                                    handleCostChange(
                                      i,
                                      j,
                                      e.target.value
                                    )
                                  }
                                  className="form-control text-center"
                                  style={{
                                    ...styles.input,
                                    minHeight:
                                      "39px",
                                  }}
                                />
                              </td>
                            )
                          )}

                          <td
                            style={{
                              ...styles.td,
                              background:
                                "#07233a",
                            }}
                          >
                            <input
                              type="number"
                              value={supply[i]}
                              onChange={(e) =>
                                handleSupplyChange(
                                  i,
                                  e.target.value
                                )
                              }
                              className="form-control text-center"
                              style={{
                                ...styles.input,
                                color:
                                  colors.cyan,
                                fontWeight: "700",
                                minHeight:
                                  "39px",
                              }}
                            />
                          </td>
                        </tr>
                      ))}

                      <tr>
                        <th
                          style={{
                            ...styles.td,
                            background:
                              "#0a3d68",
                            color: colors.white,
                            fontSize: "10px",
                          }}
                        >
                          Demand
                        </th>

                        {demand.map(
                          (value, j) => (
                            <td
                              key={j}
                              style={{
                                ...styles.td,
                                background:
                                  "#082b48",
                              }}
                            >
                              <input
                                type="number"
                                value={value}
                                onChange={(e) =>
                                  handleDemandChange(
                                    j,
                                    e.target.value
                                  )
                                }
                                className="form-control text-center"
                                style={{
                                  ...styles.input,
                                  color:
                                    colors.cyan,
                                  fontWeight:
                                    "700",
                                  minHeight:
                                    "39px",
                                }}
                              />
                            </td>
                          )
                        )}

                        <th
                          style={{
                            ...styles.td,
                            background:
                              "#0a3d68",
                            color: colors.cyan,
                          }}
                        >
                          {totalSupply}
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BALANCE */}

                <div
                  style={{
                    marginTop: "14px",
                    border:
                      `1px solid ${
                        isBalanced
                          ? "rgba(49,228,176,.55)"
                          : "rgba(245,157,39,.45)"
                      }`,
                    background:
                      isBalanced
                        ? "rgba(12,77,68,.18)"
                        : "rgba(90,58,14,.15)",
                    borderRadius: "7px",
                    padding: "13px 15px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background:
                            isBalanced
                              ? colors.green
                              : colors.orange,
                          color: "#00151a",
                          display: "flex",
                          justifyContent:
                            "center",
                          alignItems: "center",
                          fontSize: "18px",
                          fontWeight: "900",
                        }}
                      >
                        {isBalanced
                          ? "âœ“"
                          : "!"}
                      </div>

                      <div>
                        <div
                          style={{
                            color:
                              isBalanced
                                ? colors.green
                                : colors.orange,
                            fontSize: "11px",
                            fontWeight: "800",
                          }}
                        >
                          {isBalanced
                            ? "Transportation Problem is Balanced"
                            : "Transportation Problem is Not Balanced"}
                        </div>

                        <div
                          style={{
                            color:
                              colors.muted,
                            fontSize: "9px",
                            marginTop: "3px",
                          }}
                        >
                          Total Supply ({totalSupply})
                          {" = "}
                          Total Demand ({totalDemand})
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSolve}
                      disabled={!isBalanced}
                      style={{
                        border: "none",
                        borderRadius: "6px",
                        padding:
                          "11px 18px",
                        background:
                          isBalanced
                            ? "linear-gradient(135deg,#087eff,#075dcc)"
                            : "#243747",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: "800",
                        cursor: isBalanced
                          ? "pointer"
                          : "not-allowed",
                        boxShadow:
                          isBalanced
                            ? "0 5px 18px rgba(0,117,255,.24)"
                            : "none",
                      }}
                    >
                      â–¶ &nbsp; Solve Transportation Problem â†’
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "11px 13px",
                      border:
                        "1px solid rgba(255,80,100,.35)",
                      background:
                        "rgba(255,50,70,.07)",
                      borderRadius: "5px",
                      color: "#ff9ba7",
                      fontSize: "10px",
                    }}
                  >
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* RESULTS */}

            {result && (
              <div
                style={{
                  ...styles.panel,
                  marginTop: "14px",
                }}
              >
                <div
                  style={{
                    padding: "17px 19px",
                    borderBottom:
                      "1px solid #16456b",
                    display: "flex",
                    alignItems: "center",
                    gap: "13px",
                  }}
                >
                  <div
                    style={{
                      width: "31px",
                      height: "31px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(145deg,#169cff,#0759ad)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "800",
                    }}
                  >
                    3
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "800",
                      }}
                    >
                      Results
                    </div>

                    <div
                      style={{
                        color: colors.muted,
                        fontSize: "9px",
                        marginTop: "3px",
                      }}
                    >
                      {getMethodName()} solution output.
                    </div>
                  </div>
                </div>

                <div style={{ padding: "18px" }}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg,#083458,#062238)",
                          border:
                            "1px solid #176da1",
                          borderRadius: "7px",
                          padding: "20px",
                        }}
                      >
                        <div
                          style={{
                            color:
                              colors.muted,
                            fontSize: "9px",
                            letterSpacing:
                              "1.2px",
                          }}
                        >
                          TOTAL TRANSPORTATION COST
                        </div>

                        <div
                          style={{
                            color:
                              colors.cyan,
                            fontSize: "36px",
                            fontWeight: "800",
                            marginTop: "6px",
                          }}
                        >
                          {result.total_cost}
                        </div>

                        <div
                          style={{
                            color:
                              colors.muted,
                            fontSize: "9px",
                          }}
                        >
                          MINIMIZATION OBJECTIVE VALUE
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div
                        style={{
                          height: "100%",
                          background:
                            "#061727",
                          border:
                            "1px solid #16456b",
                          borderRadius: "7px",
                          padding: "20px",
                        }}
                      >
                        <div
                          style={{
                            color:
                              colors.muted,
                            fontSize: "9px",
                          }}
                        >
                          METHOD
                        </div>

                        <div
                          style={{
                            color:
                              colors.white,
                            fontSize: "14px",
                            fontWeight: "800",
                            marginTop: "8px",
                          }}
                        >
                          {getMethodName()}
                        </div>

                        {result.optimal !==
                          undefined && (
                          <div
                            style={{
                              marginTop:
                                "16px",
                              color:
                                result.optimal
                                  ? colors.green
                                  : colors.orange,
                              fontSize: "9px",
                              fontWeight: "800",
                            }}
                          >
                            {result.optimal
                              ? "â— OPTIMAL SOLUTION"
                              : "â— NOT YET OPTIMAL"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Allocation */}

                  <div
                    style={{
                      marginTop: "17px",
                      border:
                        "1px solid #16456b",
                      borderRadius: "7px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "13px 16px",
                        background:
                          "#09243b",
                        borderBottom:
                          "1px solid #16456b",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "800",
                        }}
                      >
                        Allocation Matrix
                      </div>

                      <div
                        style={{
                          color:
                            colors.muted,
                          fontSize: "8px",
                          marginTop: "3px",
                        }}
                      >
                        SOURCE â†’ DESTINATION QUANTITY
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table text-center mb-0">
                        <thead>
                          <tr>
                            <th style={styles.th}>
                              Source
                            </th>

                            {Array.from(
                              {
                                length:
                                  columns,
                              },
                              (_, j) => (
                                <th
                                  key={j}
                                  style={
                                    styles.th
                                  }
                                >
                                  D{j + 1}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {result.allocation.map(
                            (row, i) => (
                              <tr key={i}>
                                <th
                                  style={{
                                    ...styles.td,
                                    color:
                                      colors.cyan,
                                  }}
                                >
                                  S{i + 1}
                                </th>

                                {row.map(
                                  (
                                    value,
                                    j
                                  ) => (
                                    <td
                                      key={j}
                                      style={{
                                        ...styles.td,
                                        background:
                                          value >
                                          0
                                            ? "rgba(0,139,255,.13)"
                                            : "#041321",
                                        color:
                                          value >
                                          0
                                            ? colors.cyan
                                            : "#60798d",
                                        fontWeight:
                                          value >
                                          0
                                            ? "800"
                                            : "400",
                                      }}
                                    >
                                      {value}
                                    </td>
                                  )
                                )}
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* MODI */}

                  {method === "modi" &&
                    result.u &&
                    result.v && (
                      <div
                        style={{
                          marginTop:
                            "22px",
                          paddingTop:
                            "20px",
                          borderTop:
                            "1px solid #16456b",
                        }}
                      >
                        <div
                          style={{
                            color:
                              colors.cyan,
                            fontSize: "9px",
                            fontWeight:
                              "800",
                            letterSpacing:
                              "1.5px",
                          }}
                        >
                          OPTIMIZATION ANALYSIS
                        </div>

                        <div
                          style={{
                            fontSize: "19px",
                            fontWeight:
                              "800",
                            marginTop:
                              "4px",
                          }}
                        >
                          MODI Calculation
                        </div>

                        <div
                          style={{
                            color:
                              colors.muted,
                            fontSize: "9px",
                            marginTop:
                              "4px",
                            marginBottom:
                              "14px",
                          }}
                        >
                          Potential values and
                          opportunity costs.
                        </div>

                        <div className="row g-3">
                          <div className="col-md-6">
                            <div
                              style={{
                                ...styles.panel,
                                padding:
                                  "16px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "800",
                                  marginBottom:
                                    "10px",
                                }}
                              >
                                U Potentials
                              </div>

                              <div className="d-flex flex-wrap gap-2">
                                {result.u.map(
                                  (
                                    value,
                                    index
                                  ) => (
                                    <span
                                      key={
                                        index
                                      }
                                      style={{
                                        background:
                                          "#0b2b46",
                                        border:
                                          "1px solid #1d5d84",
                                        color:
                                          colors.cyan,
                                        padding:
                                          "7px 10px",
                                        borderRadius:
                                          "5px",
                                        fontSize:
                                          "9px",
                                        fontWeight:
                                          "800",
                                      }}
                                    >
                                      U
                                      {index +
                                        1}{" "}
                                      = {value}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div
                              style={{
                                ...styles.panel,
                                padding:
                                  "16px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "800",
                                  marginBottom:
                                    "10px",
                                }}
                              >
                                V Potentials
                              </div>

                              <div className="d-flex flex-wrap gap-2">
                                {result.v.map(
                                  (
                                    value,
                                    index
                                  ) => (
                                    <span
                                      key={
                                        index
                                      }
                                      style={{
                                        background:
                                          "#092f2b",
                                        border:
                                          "1px solid rgba(49,228,176,.35)",
                                        color:
                                          colors.green,
                                        padding:
                                          "7px 10px",
                                        borderRadius:
                                          "5px",
                                        fontSize:
                                          "9px",
                                        fontWeight:
                                          "800",
                                      }}
                                    >
                                      V
                                      {index +
                                        1}{" "}
                                      = {value}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Opportunity Costs */}

                        <div
                          style={{
                            marginTop:
                              "14px",
                            border:
                              "1px solid #16456b",
                            borderRadius:
                              "7px",
                            overflow:
                              "hidden",
                          }}
                        >
                          <div
                            style={{
                              padding:
                                "13px 16px",
                              background:
                                "#09243b",
                              borderBottom:
                                "1px solid #16456b",
                            }}
                          >
                            <div
                              style={{
                                fontSize:
                                  "13px",
                                fontWeight:
                                  "800",
                              }}
                            >
                              Opportunity Cost (Î”)
                            </div>

                            <div
                              style={{
                                color:
                                  colors.muted,
                                fontSize:
                                  "8px",
                                marginTop:
                                  "3px",
                              }}
                            >
                              OPTIMAL SOLUTION REQUIRES Î” â‰¥ 0
                            </div>
                          </div>

                          <div className="table-responsive">
                            <table className="table text-center mb-0">
                              <thead>
                                <tr>
                                  <th
                                    style={
                                      styles.th
                                    }
                                  >
                                    Source
                                  </th>

                                  {Array.from(
                                    {
                                      length:
                                        columns,
                                    },
                                    (_, j) => (
                                      <th
                                        key={
                                          j
                                        }
                                        style={
                                          styles.th
                                        }
                                      >
                                        D{j + 1}
                                      </th>
                                    )
                                  )}
                                </tr>
                              </thead>

                              <tbody>
                                {result.opportunity_costs.map(
                                  (
                                    row,
                                    i
                                  ) => (
                                    <tr
                                      key={
                                        i
                                      }
                                    >
                                      <th
                                        style={{
                                          ...styles.td,
                                          color:
                                            colors.cyan,
                                        }}
                                      >
                                        S{i +
                                          1}
                                      </th>

                                      {row.map(
                                        (
                                          value,
                                          j
                                        ) => (
                                          <td
                                            key={
                                              j
                                            }
                                            style={{
                                              ...styles.td,
                                              color:
                                                value <
                                                0
                                                  ? "#ff7180"
                                                  : colors.green,
                                              background:
                                                value <
                                                0
                                                  ? "rgba(255,60,80,.08)"
                                                  : "rgba(49,228,176,.06)",
                                              fontWeight:
                                                "800",
                                            }}
                                          >
                                            {
                                              value
                                            }
                                          </td>
                                        )
                                      )}
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* ====================================================
              STEP-BY-STEP SOLUTION
              EXTRA EXAM / HANDWRITTEN STYLE EXPLANATION
          ===================================================== */}

          {result && stepData && (
            <div
              style={{
                ...styles.panel,
                marginTop: "14px",
                overflow: "hidden",
                background:
                  "linear-gradient(145deg,#f8fbfd,#eef3f6)",
                border: "1px solid #8fa7b8",
                color: "#172b3a",
                boxShadow:
                  "0 12px 35px rgba(0,0,0,.20)",
              }}
            >
              {/* Paper heading */}
              <div
                style={{
                  padding: "18px 20px",
                  background:
                    "linear-gradient(90deg,#dce8ef,#f4f7f9)",
                  borderBottom: "1px solid #a8bbc8",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#173f59",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "900",
                      fontSize: "13px",
                    }}
                  >
                    4
                  </div>

                  <div>
                    <div
                      style={{
                        fontFamily:
                          "'Segoe Print','Comic Sans MS',cursive",
                        fontSize: "20px",
                        fontWeight: "800",
                        color: "#18384d",
                      }}
                    >
                      Step-by-Step Solution
                    </div>

                    <div
                      style={{
                        color: "#62798a",
                        fontSize: "9px",
                        marginTop: "3px",
                        letterSpacing: ".6px",
                      }}
                    >
                      EXAM-STYLE WORKING â€¢ {stepData.methodName.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#f8fbfd",
                  backgroundImage:
                    "linear-gradient(#d9e4ea 1px, transparent 1px)",
                  backgroundSize: "100% 31px",
                }}
              >
                {/* Step 1 */}
                <div
                  style={{
                    padding: "16px 17px",
                    marginBottom: "14px",
                    background: "rgba(255,255,255,.84)",
                    border: "1px solid #b7c7d1",
                    borderLeft: "4px solid #246a91",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "15px",
                      fontWeight: "800",
                      color: "#173f59",
                    }}
                  >
                    Step 1 â€” Given Transportation Data
                  </div>

                  <div
                    style={{
                      marginTop: "9px",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "12px",
                      lineHeight: "1.9",
                      color: "#294456",
                    }}
                  >
                    <div>
                      Number of sources ={" "}
                      <b>{rows}</b>
                    </div>
                    <div>
                      Number of destinations ={" "}
                      <b>{columns}</b>
                    </div>
                    <div>
                      Total Supply ={" "}
                      <b>{formatNumber(totalSupply)}</b>
                    </div>
                    <div>
                      Total Demand ={" "}
                      <b>{formatNumber(totalDemand)}</b>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      padding: "9px 11px",
                      background: "#edf5f8",
                      border: "1px dashed #89a6b8",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "11px",
                      color: "#24536d",
                    }}
                  >
                    Cost matrix C = [cost from each source to each
                    destination].
                  </div>
                </div>

                {/* Step 2 */}
                <div
                  style={{
                    padding: "16px 17px",
                    marginBottom: "14px",
                    background: "rgba(255,255,255,.84)",
                    border: "1px solid #b7c7d1",
                    borderLeft: "4px solid #287f6b",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "15px",
                      fontWeight: "800",
                      color: "#173f59",
                    }}
                  >
                    Step 2 â€” Check Whether the Problem is Balanced
                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "13px",
                      color: "#294456",
                    }}
                  >
                    Total Supply = {formatNumber(totalSupply)}
                    <br />
                    Total Demand = {formatNumber(totalDemand)}
                    <br />
                    Therefore,{" "}
                    <b>
                      {isBalanced
                        ? "Total Supply = Total Demand"
                        : "Total Supply â‰  Total Demand"}
                    </b>
                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      padding: "9px 11px",
                      background: isBalanced
                        ? "#e7f6ef"
                        : "#fff1e2",
                      border:
                        "1px solid " +
                        (isBalanced ? "#87bfa8" : "#d9ad72"),
                      color: isBalanced
                        ? "#236047"
                        : "#8a5a20",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "11px",
                      fontWeight: "800",
                    }}
                  >
                    {isBalanced
                      ? "âœ“ Balanced transportation problem â€” proceed with the selected method."
                      : "âš  The problem is not balanced, so a valid transportation solution cannot be calculated from the current data."}
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  style={{
                    padding: "16px 17px",
                    marginBottom: "14px",
                    background: "rgba(255,255,255,.84)",
                    border: "1px solid #b7c7d1",
                    borderLeft: "4px solid #735bb3",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "15px",
                      fontWeight: "800",
                      color: "#173f59",
                    }}
                  >
                    Step 3 â€” Obtain the Initial Allocation
                  </div>

                  <div
                    style={{
                      marginTop: "9px",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "12px",
                      lineHeight: "1.8",
                      color: "#294456",
                    }}
                  >
                    The selected method is{" "}
                    <b>{stepData.methodName}</b>.
                    <br />
                    The method determines how the available supply is
                    allocated to satisfy the destination demands.
                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      overflowX: "auto",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        minWidth: "520px",
                        borderCollapse: "collapse",
                        fontFamily:
                          "'Segoe Print','Comic Sans MS',cursive",
                        fontSize: "11px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              padding: "8px",
                              border: "1px solid #9eb1be",
                              background: "#dce9f0",
                              color: "#173f59",
                            }}
                          >
                            Source
                          </th>

                          {Array.from(
                            { length: columns },
                            (_, j) => (
                              <th
                                key={j}
                                style={{
                                  padding: "8px",
                                  border: "1px solid #9eb1be",
                                  background: "#dce9f0",
                                  color: "#173f59",
                                }}
                              >
                                D{j + 1}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {result.allocation.map((row, i) => (
                          <tr key={i}>
                            <td
                              style={{
                                padding: "8px",
                                border: "1px solid #9eb1be",
                                background: "#edf3f6",
                                fontWeight: "800",
                                color: "#24536d",
                                textAlign: "center",
                              }}
                            >
                              S{i + 1}
                            </td>

                            {row.map((value, j) => (
                              <td
                                key={j}
                                style={{
                                  padding: "8px",
                                  border: "1px solid #9eb1be",
                                  background:
                                    Number(value) > 0
                                      ? "#e5f3f8"
                                      : "#f8fbfd",
                                  color:
                                    Number(value) > 0
                                      ? "#145b7a"
                                      : "#7c8f9b",
                                  fontWeight:
                                    Number(value) > 0
                                      ? "800"
                                      : "400",
                                  textAlign: "center",
                                }}
                              >
                                {formatNumber(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Step 4 */}
                <div
                  style={{
                    padding: "16px 17px",
                    marginBottom: "14px",
                    background: "rgba(255,255,255,.84)",
                    border: "1px solid #b7c7d1",
                    borderLeft: "4px solid #b87832",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "15px",
                      fontWeight: "800",
                      color: "#173f59",
                    }}
                  >
                    Step 4 â€” Calculate Transportation Cost
                  </div>

                  <div
                    style={{
                      marginTop: "9px",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                        fontSize: "13px",
                        lineHeight: "2",
                        color: "#294456",
                    }}
                  >
                    <b>Total Cost</b> = Î£ (Allocation Ã— Unit
                    Transportation Cost)
                  </div>

                  <div
                    style={{
                      marginTop: "7px",
                      padding: "11px 13px",
                      background: "#fffaf1",
                      border: "1px dashed #c9a36b",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "12px",
                      lineHeight: "1.9",
                      color: "#68491f",
                      overflowX: "auto",
                    }}
                  >
                    {stepData.calculation}
                    <br />
                    ={" "}
                    <b>
                      {formatNumber(stepData.calculationTotal)}
                    </b>
                  </div>

                  <div
                    style={{
                      marginTop: "9px",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "11px",
                      color: "#5d7180",
                    }}
                  >
                    Only positive allocations are included in the
                    calculation.
                  </div>
                </div>

                {/* Step 5 â€” MODI */}
                <div
                  style={{
                    padding: "16px 17px",
                    marginBottom: "14px",
                    background: "rgba(255,255,255,.84)",
                    border: "1px solid #b7c7d1",
                    borderLeft: "4px solid #287f6b",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "15px",
                      fontWeight: "800",
                      color: "#173f59",
                    }}
                  >
                    Step 5 â€” MODI Optimality Analysis
                  </div>

                  {result.u && result.v ? (
                    <>
                      <div
                        style={{
                          marginTop: "9px",
                          fontFamily:
                            "'Segoe Print','Comic Sans MS',cursive",
                          fontSize: "12px",
                          lineHeight: "1.9",
                          color: "#294456",
                        }}
                      >
                        For every occupied cell, use:
                        <br />
                        <b>uáµ¢ + vâ±¼ = cáµ¢â±¼</b>
                        <br />
                        Take one potential as zero and calculate the
                        remaining U and V values.
                      </div>

                      <div
                        style={{
                          marginTop: "10px",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {result.u.map((value, index) => (
                          <span
                            key={`u-${index}`}
                            style={{
                              padding: "7px 10px",
                              background: "#e7f0f5",
                              border: "1px solid #9db5c4",
                              borderRadius: "4px",
                              color: "#1f5b78",
                              fontFamily:
                                "'Segoe Print','Comic Sans MS',cursive",
                              fontSize: "11px",
                              fontWeight: "800",
                            }}
                          >
                            U{index + 1} = {formatNumber(value)}
                          </span>
                        ))}

                        {result.v.map((value, index) => (
                          <span
                            key={`v-${index}`}
                            style={{
                              padding: "7px 10px",
                              background: "#e8f5ef",
                              border: "1px solid #9fc5b2",
                              borderRadius: "4px",
                              color: "#24664d",
                              fontFamily:
                                "'Segoe Print','Comic Sans MS',cursive",
                              fontSize: "11px",
                              fontWeight: "800",
                            }}
                          >
                            V{index + 1} = {formatNumber(value)}
                          </span>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: "12px",
                          fontFamily:
                            "'Segoe Print','Comic Sans MS',cursive",
                          fontSize: "12px",
                          lineHeight: "1.9",
                          color: "#294456",
                        }}
                      >
                        For an unoccupied cell:
                        <br />
                        <b>Î”áµ¢â±¼ = cáµ¢â±¼ âˆ’ (uáµ¢ + vâ±¼)</b>
                      </div>

                      {result.opportunity_costs && (
                        <div
                          style={{
                            marginTop: "10px",
                            overflowX: "auto",
                          }}
                        >
                          <table
                            style={{
                              width: "100%",
                              minWidth: "520px",
                              borderCollapse: "collapse",
                              fontFamily:
                                "'Segoe Print','Comic Sans MS',cursive",
                              fontSize: "11px",
                            }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    padding: "8px",
                                    border: "1px solid #9eb1be",
                                    background: "#dce9f0",
                                    color: "#173f59",
                                  }}
                                >
                                  Î”
                                </th>

                                {Array.from(
                                  { length: columns },
                                  (_, j) => (
                                    <th
                                      key={j}
                                      style={{
                                        padding: "8px",
                                        border:
                                          "1px solid #9eb1be",
                                        background: "#dce9f0",
                                        color: "#173f59",
                                      }}
                                    >
                                      D{j + 1}
                                    </th>
                                  )
                                )}
                              </tr>
                            </thead>

                            <tbody>
                              {result.opportunity_costs.map(
                                (row, i) => (
                                  <tr key={i}>
                                    <td
                                      style={{
                                        padding: "8px",
                                        border:
                                          "1px solid #9eb1be",
                                        background: "#edf3f6",
                                        color: "#24536d",
                                        fontWeight: "800",
                                        textAlign: "center",
                                      }}
                                    >
                                      S{i + 1}
                                    </td>

                                    {row.map((value, j) => (
                                      <td
                                        key={j}
                                        style={{
                                          padding: "8px",
                                          border:
                                            "1px solid #9eb1be",
                                          background:
                                            Number(value) < 0
                                              ? "#fff0f0"
                                              : "#eef8f2",
                                          color:
                                            Number(value) < 0
                                              ? "#b23a45"
                                              : "#28704f",
                                          fontWeight: "800",
                                          textAlign: "center",
                                        }}
                                      >
                                        {formatNumber(value)}
                                      </td>
                                    ))}
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: "11px",
                          padding: "10px 12px",
                          background:
                            result.optimal === true
                              ? "#e8f6ee"
                              : "#fff4e5",
                          border:
                            "1px solid " +
                            (result.optimal === true
                              ? "#8bbca3"
                              : "#d6ad72"),
                          color:
                            result.optimal === true
                              ? "#236047"
                              : "#855b24",
                          fontFamily:
                            "'Segoe Print','Comic Sans MS',cursive",
                          fontSize: "11px",
                          fontWeight: "800",
                        }}
                      >
                        {result.optimal === true
                          ? "âœ“ Since all opportunity costs are non-negative (Î” â‰¥ 0), the current solution is optimal."
                          : "â†’ At least one negative opportunity cost indicates that further improvement may be possible."}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        marginTop: "9px",
                        padding: "10px 12px",
                        background: "#edf3f6",
                        border: "1px dashed #9eb1be",
                        fontFamily:
                          "'Segoe Print','Comic Sans MS',cursive",
                        fontSize: "11px",
                        lineHeight: "1.7",
                        color: "#526b7a",
                      }}
                    >
                      The selected method provides an allocation
                      solution. U-V potentials and opportunity costs
                      are returned by the MODI analysis and are shown
                      in the existing MODI Analysis panel when MODI is
                      selected.
                    </div>
                  )}
                </div>

                {/* Step 6 */}
                <div
                  style={{
                    padding: "16px 17px",
                    background: "rgba(255,255,255,.9)",
                    border: "1px solid #9eb9c7",
                    borderLeft: "5px solid #1f7d68",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "16px",
                      fontWeight: "900",
                      color: "#173f59",
                    }}
                  >
                    Final Answer
                  </div>

                  <div
                    style={{
                      marginTop: "10px",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "13px",
                      lineHeight: "2",
                      color: "#294456",
                    }}
                  >
                    Using <b>{stepData.methodName}</b>, the calculated
                    transportation cost is:
                  </div>

                  <div
                    style={{
                      marginTop: "7px",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "24px",
                      fontWeight: "900",
                      color: "#17664f",
                    }}
                  >
                    Minimum / Calculated Cost ={" "}
                    {formatNumber(result.total_cost)}
                  </div>

                  <div
                    style={{
                      marginTop: "7px",
                      fontFamily:
                        "'Segoe Print','Comic Sans MS',cursive",
                      fontSize: "11px",
                      color: "#617785",
                    }}
                  >
                    The allocation matrix shown above gives the
                    quantity transported from every source to every
                    destination.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              RIGHT SIDEBAR
          ===================================================== */}

          <div className="col-xl-4">
            {/* METHODS */}

            <div style={styles.panel}>
              <div
                style={{
                  padding: "17px 19px",
                  borderBottom:
                    "1px solid #16456b",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                  }}
                >
                  <span
                    style={{
                      color: colors.cyan,
                      fontSize: "22px",
                      marginRight: "8px",
                    }}
                  >
                    ÏŸ
                  </span>
                  Methods Available
                </div>

                <div
                  style={{
                    color: colors.muted,
                    fontSize: "9px",
                    marginTop: "3px",
                  }}
                >
                  Choose the best method for your problem.
                </div>
              </div>

              <div style={{ padding: "11px" }}>
                {[
                  [
                    "NW",
                    "North-West Corner",
                    "Simple initial solution",
                    "#087eff",
                    "north_west",
                  ],
                  [
                    "LC",
                    "Least Cost Method",
                    "Minimum cost approach",
                    "#18b89a",
                    "least_cost",
                  ],
                  [
                    "VA",
                    "Vogel's Approximation Method",
                    "Better initial solution",
                    "#7055d9",
                    "vogel",
                  ],
                  [
                    "M",
                    "MODI Method",
                    "Finds optimal solution",
                    "#ef9625",
                    "modi",
                  ],
                ].map((item, index) => {
                  const selected =
                    method === item[4];

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setMethod(item[4]);
                        setResult(null);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px",
                        marginBottom:
                          index === 3
                            ? 0
                            : "7px",
                        border:
                          `1px solid ${
                            selected
                              ? colors.blue2
                              : "#155078"
                          }`,
                        background:
                          selected
                            ? "rgba(8,104,170,.16)"
                            : "#061a2b",
                        borderRadius: "7px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: "43px",
                          height: "43px",
                          borderRadius: "6px",
                          background:
                            item[3],
                          color: "#fff",
                          display: "flex",
                          justifyContent:
                            "center",
                          alignItems: "center",
                          fontWeight: "900",
                          fontSize: "13px",
                        }}
                      >
                        {item[0]}
                      </div>

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                          }}
                        >
                          {item[1]}
                        </div>

                        <div
                          style={{
                            color:
                              colors.muted,
                            fontSize: "9px",
                            marginTop: "3px",
                          }}
                        >
                          {item[2]}
                        </div>
                      </div>

                      <div
                        style={{
                          color:
                            colors.muted,
                          fontSize: "17px",
                        }}
                      >
                        â€º
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* QUICK TIPS */}

            <div
              style={{
                ...styles.panel,
                marginTop: "14px",
              }}
            >
              <div
                style={{
                  padding: "17px 19px",
                  borderBottom:
                    "1px solid #16456b",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "800",
                  }}
                >
                  <span
                    style={{
                      color: "#b7eaff",
                      fontSize: "22px",
                      marginRight: "8px",
                    }}
                  >
                    â™§
                  </span>
                  Quick Tips
                </div>
              </div>

              <div style={{ padding: "15px 18px" }}>
                {[
                  "Total supply must equal total demand",
                  "Transportation costs should be non-negative",
                  "MODI starts with an initial feasible solution",
                  "Optimal solution has all Î” â‰¥ 0",
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="d-flex gap-2"
                    style={{
                      marginBottom:
                        index === 3
                          ? 0
                          : "11px",
                    }}
                  >
                    <span
                      style={{
                        color: colors.green,
                        fontWeight: "900",
                        fontSize: "13px",
                      }}
                    >
                      âœ“
                    </span>

                    <span
                      style={{
                        color: "#a9c5d9",
                        fontSize: "10px",
                        lineHeight: "1.4",
                      }}
                    >
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* LOGISTICS MESSAGE */}

            <div
              style={{
                ...styles.panel,
                marginTop: "14px",
                overflow: "hidden",
                minHeight: "130px",
                position: "relative",
              }}
            >
              <div
                style={{
                  padding: "19px",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    color: colors.cyan,
                    fontSize: "22px",
                    fontWeight: "900",
                  }}
                >
                  â—ˆ
                </div>

                <div
                  style={{
                    marginTop: "7px",
                    fontSize: "12px",
                    fontWeight: "800",
                  }}
                >
                  Efficient Logistics.
                  <br />
                  Lower Costs. Greater Reach.
                </div>

                <div
                  style={{
                    color: colors.muted,
                    fontSize: "9px",
                    marginTop: "7px",
                    maxWidth: "230px",
                    lineHeight: "1.5",
                  }}
                >
                  Smart transportation planning builds
                  stronger supply chains.
                </div>
              </div>

              {/* Decorative city blocks */}

              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: "42%",
                  height: "75%",
                  opacity: ".42",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: "5%",
                    bottom: 0,
                    width: "28px",
                    height: "65px",
                    background: "#123b57",
                    border:
                      "1px solid #286486",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: "28%",
                    bottom: 0,
                    width: "42px",
                    height: "45px",
                    background: "#123650",
                    border:
                      "1px solid #286486",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: "58%",
                    bottom: 0,
                    width: "32px",
                    height: "88px",
                    background: "#143d59",
                    border:
                      "1px solid #286486",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    right: "82%",
                    bottom: 0,
                    width: "20px",
                    height: "54px",
                    background: "#123650",
                    border:
                      "1px solid #286486",
                  }}
                />
              </div>
            </div>

            {/* SYSTEM STATUS */}

            <div
              style={{
                marginTop: "14px",
                padding: "14px 16px",
                background: "#061727",
                border:
                  "1px solid #16456b",
                borderRadius: "7px",
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div
                  style={{
                    color: colors.muted,
                    fontSize: "9px",
                    letterSpacing: "1px",
                  }}
                >
                  ACTIVE METHOD
                </div>

                <div
                  style={{
                    color: colors.cyan,
                    fontSize: "10px",
                    fontWeight: "800",
                  }}
                >
                  {getMethodShort()}
                </div>
              </div>

              <div
                style={{
                  marginTop: "9px",
                  height: "3px",
                  background: "#102f46",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg,#087eff,#27d7ff)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transportation;
