import React, { useState } from "react";

function Equation({ children }) {
  return (
    <div
      style={{
        background: "#07111f",
        border: "1px solid #1d405d",
        borderRadius: "10px",
        padding: "16px 20px",
        margin: "14px 0",
        color: "#67e8f9",
        fontFamily: "Consolas, monospace",
        fontSize: "15px",
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

function DataTable({ headers, rows }) {
  return (
    <div
      style={{
        overflowX: "auto",
        margin: "18px 0",
        border: "1px solid #1e3a52",
        borderRadius: "10px",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: "600px",
          background: "#081523",
        }}
      >
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #28506c",
                  background: "#0d2235",
                  color: "#67e8f9",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  style={{
                    padding: "11px",
                    borderBottom: "1px solid #173047",
                    color: "#d7e5ef",
                    textAlign: "center",
                    fontSize: "13px",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        marginBottom: "18px",
        padding: "16px",
        background: "#091827",
        border: "1px solid #193a52",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          minWidth: "34px",
          height: "34px",
          borderRadius: "50%",
          background: "#0ea5e9",
          color: "#04101c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: "14px",
        }}
      >
        {number}
      </div>

      <div>
        <div
          style={{
            color: "#f1f5f9",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#b8c9d6",
            lineHeight: 1.7,
            fontSize: "14px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Learn() {
  const [stage, setStage] = useState("fundamentals");
  const [activeModule, setActiveModule] = useState("lpp");
  const [activeTopic, setActiveTopic] = useState("intro");
  const [activeTransportTopic, setActiveTransportTopic] =
    useState("intro");

  const goSolver = (path) => {
    window.location.href = path;
  };

  const lppTopics = [
    { id: "intro", label: "Introduction" },
    { id: "terminology", label: "Basic Terminology" },
    { id: "formulation", label: "Formulation" },
    { id: "graphical", label: "Graphical Method" },
    { id: "simplex", label: "Simplex Method" },
    { id: "solved", label: "Solved Examples" },
    { id: "practice", label: "Practice Zone" },
  ];

  const transportTopics = [
    { id: "intro", label: "Introduction" },
    { id: "terminology", label: "Basic Terminology" },
    { id: "model", label: "Mathematical Model" },
    { id: "northwest", label: "North-West Corner" },
    { id: "leastcost", label: "Least Cost Method" },
    { id: "vam", label: "Vogel's Approximation" },
    { id: "modi", label: "MODI Method" },
    { id: "solved", label: "Complete Solved Example" },
    { id: "practice", label: "Practice Zone" },
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #030b14 0%, #071522 48%, #06111d 100%)",
      color: "#e5edf4",
      fontFamily:
        "Inter, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif",
    },

    container: {
      width: "92%",
      maxWidth: "1400px",
      margin: "0 auto",
    },

    card: {
      background: "#091827",
      border: "1px solid #193a52",
      borderRadius: "14px",
      boxShadow: "0 12px 35px rgba(0,0,0,0.22)",
    },

    heading: {
      color: "#f4f8fb",
      fontWeight: 800,
      letterSpacing: "-0.3px",
    },

    muted: {
      color: "#91a8b8",
      lineHeight: 1.7,
    },

    cyan: {
      color: "#67e8f9",
    },

    sectionTitle: {
      fontSize: "22px",
      color: "#f1f5f9",
      fontWeight: 800,
      marginBottom: "12px",
    },

    smallLabel: {
      fontSize: "11px",
      color: "#5f8299",
      letterSpacing: "1.5px",
      fontWeight: 800,
      textTransform: "uppercase",
    },
  };

  const renderLPPContent = () => {
    if (activeTopic === "intro") {
      return (
        <>
          <h2 style={styles.sectionTitle}>Linear Programming Problem</h2>

          <p style={styles.muted}>
            Linear Programming Problem (LPP) is a mathematical technique used
            to obtain the best possible result from a given set of limited
            resources. The result may be maximum profit, minimum cost,
            maximum production or minimum time.
          </p>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Main Components of LPP
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
              marginTop: "15px",
            }}
          >
            {[
              [
                "Decision Variables",
                "Unknown quantities whose values have to be determined.",
              ],
              [
                "Objective Function",
                "Mathematical expression that is maximized or minimized.",
              ],
              [
                "Constraints",
                "Restrictions imposed on available resources.",
              ],
              [
                "Non-Negativity",
                "Decision variables cannot normally be negative.",
              ],
            ].map(([title, text]) => (
              <div
                key={title}
                style={{
                  ...styles.card,
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    color: "#67e8f9",
                    fontWeight: 700,
                    marginBottom: "7px",
                  }}
                >
                  {title}
                </div>
                <div style={{ ...styles.muted, fontSize: "13px" }}>
                  {text}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ ...styles.heading, marginTop: "28px" }}>
            General Form
          </h3>

          <Equation>
            Maximize / Minimize Z = câ‚xâ‚ + câ‚‚xâ‚‚ + ... + câ‚™xâ‚™
            <br />
            Subject to:
            <br />
            aâ‚â‚xâ‚ + aâ‚â‚‚xâ‚‚ + ... + aâ‚â‚™xâ‚™ â‰¤ / = / â‰¥ bâ‚
            <br />
            aâ‚‚â‚xâ‚ + aâ‚‚â‚‚xâ‚‚ + ... + aâ‚‚â‚™xâ‚™ â‰¤ / = / â‰¥ bâ‚‚
            <br />
            xâ‚, xâ‚‚, ... , xâ‚™ â‰¥ 0
          </Equation>

          <h3 style={{ ...styles.heading, marginTop: "28px" }}>
            Characteristics
          </h3>

          <ol style={{ ...styles.muted, lineHeight: 1.9 }}>
            <li>Objective function is linear.</li>
            <li>Constraints are linear.</li>
            <li>Resources are limited.</li>
            <li>Decision variables are measurable.</li>
            <li>Variables generally satisfy non-negativity conditions.</li>
          </ol>

          <h3 style={{ ...styles.heading, marginTop: "28px" }}>
            Applications
          </h3>

          <p style={styles.muted}>
            LPP is commonly used in production planning, resource allocation,
            transportation, inventory planning, workforce planning, product
            mix decisions and cost minimization.
          </p>
        </>
      );
    }

    if (activeTopic === "terminology") {
      const terms = [
        ["Decision Variable", "Unknown variable whose value is determined."],
        ["Objective Function", "Expression to maximize or minimize."],
        ["Constraint", "Restriction on decision variables."],
        ["Feasible Solution", "Any solution satisfying all constraints."],
        ["Feasible Region", "Region containing all feasible solutions."],
        ["Optimal Solution", "Best feasible solution."],
        ["Slack", "Unused amount of a â‰¤ resource constraint."],
        ["Surplus", "Excess amount in a â‰¥ constraint."],
        ["RHS", "Right-hand side value of a constraint."],
        ["Coefficient", "Numerical multiplier of a variable."],
        ["Binding Constraint", "Constraint satisfied exactly at optimum."],
        ["Non-negativity", "Condition xâ‚, xâ‚‚ â‰¥ 0."],
      ];

      return (
        <>
          <h2 style={styles.sectionTitle}>Basic Terminology</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "14px",
            }}
          >
            {terms.map(([term, meaning]) => (
              <div
                key={term}
                style={{
                  ...styles.card,
                  padding: "17px",
                }}
              >
                <div
                  style={{
                    color: "#67e8f9",
                    fontWeight: 800,
                    marginBottom: "7px",
                  }}
                >
                  {term}
                </div>

                <div style={{ ...styles.muted, fontSize: "13px" }}>
                  {meaning}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (activeTopic === "formulation") {
      return (
        <>
          <h2 style={styles.sectionTitle}>LPP Formulation</h2>

          <p style={styles.muted}>
            Formulation means converting a real-life problem into a
            mathematical model. The first step is to identify the decision
            variables, followed by the objective function and constraints.
          </p>

          <div style={{ marginTop: "25px" }}>
            <Step number="1" title="Define Decision Variables">
              Let xâ‚ = units of Product A and xâ‚‚ = units of Product B.
            </Step>

            <Step number="2" title="Write the Objective Function">
              Suppose profit per unit of A is â‚¹40 and B is â‚¹30.
              <Equation>Maximize Z = 40xâ‚ + 30xâ‚‚</Equation>
            </Step>

            <Step number="3" title="Write the Resource Constraints">
              If machine time is limited:
              <Equation>2xâ‚ + xâ‚‚ â‰¤ 40</Equation>
              If labour is limited:
              <Equation>xâ‚ + 2xâ‚‚ â‰¤ 50</Equation>
            </Step>

            <Step number="4" title="Add Non-Negativity Conditions">
              <Equation>xâ‚ â‰¥ 0, xâ‚‚ â‰¥ 0</Equation>
            </Step>
          </div>
        </>
      );
    }

    if (activeTopic === "graphical") {
      return (
        <>
          <h2 style={styles.sectionTitle}>Graphical Method</h2>

          <p style={styles.muted}>
            The graphical method is generally used for an LPP containing two
            decision variables. Constraints are plotted on a graph and the
            feasible region is identified.
          </p>

          <Equation>
            Maximize Z = 3xâ‚ + 5xâ‚‚
            <br />
            Subject to:
            <br />
            xâ‚ + xâ‚‚ â‰¤ 4
            <br />
            xâ‚ + 3xâ‚‚ â‰¤ 6
            <br />
            xâ‚, xâ‚‚ â‰¥ 0
          </Equation>

          <Step number="1" title="Find Intercepts of First Constraint">
            For xâ‚ + xâ‚‚ = 4:
            <br />
            If xâ‚ = 0, xâ‚‚ = 4.
            <br />
            If xâ‚‚ = 0, xâ‚ = 4.
          </Step>

          <Step number="2" title="Find Intercepts of Second Constraint">
            For xâ‚ + 3xâ‚‚ = 6:
            <br />
            If xâ‚ = 0, xâ‚‚ = 2.
            <br />
            If xâ‚‚ = 0, xâ‚ = 6.
          </Step>

          <Step number="3" title="Identify Feasible Corner Points">
            The feasible corner points are:
            <Equation>
              (0,0), (4,0), (3,1), (0,2)
            </Equation>
          </Step>

          <Step number="4" title="Evaluate Objective Function">
            <DataTable
              headers={["Corner Point", "Z = 3xâ‚ + 5xâ‚‚"]}
              rows={[
                ["(0,0)", "0"],
                ["(4,0)", "12"],
                ["(3,1)", "14"],
                ["(0,2)", "10"],
              ]}
            />
          </Step>

          <Step number="5" title="Final Answer">
            Maximum value is 14 at:
            <Equation>
              xâ‚ = 3, xâ‚‚ = 1
              <br />
              Maximum Z = 14
            </Equation>
          </Step>
        </>
      );
    }

    if (activeTopic === "simplex") {
      return (
        <>
          <h2 style={styles.sectionTitle}>Simplex Method</h2>

          <p style={styles.muted}>
            The Simplex Method is an iterative mathematical procedure used to
            obtain the optimal solution of a linear programming problem. It is
            especially useful when there are more than two decision variables.
          </p>

          <Equation>
            Maximize Z = 3xâ‚ + 5xâ‚‚
            <br />
            Subject to:
            <br />
            xâ‚ + 2xâ‚‚ â‰¤ 8
            <br />
            3xâ‚ + 2xâ‚‚ â‰¤ 12
            <br />
            xâ‚, xâ‚‚ â‰¥ 0
          </Equation>

          <Step number="1" title="Convert Constraints into Equations">
            Add slack variables sâ‚ and sâ‚‚.
            <Equation>
              xâ‚ + 2xâ‚‚ + sâ‚ = 8
              <br />
              3xâ‚ + 2xâ‚‚ + sâ‚‚ = 12
            </Equation>
          </Step>

          <Step number="2" title="Construct Initial Tableau">
            <DataTable
              headers={["BV", "xâ‚", "xâ‚‚", "sâ‚", "sâ‚‚", "RHS"]}
              rows={[
                ["sâ‚", "1", "2", "1", "0", "8"],
                ["sâ‚‚", "3", "2", "0", "1", "12"],
                ["Z", "-3", "-5", "0", "0", "0"],
              ]}
            />
          </Step>

          <Step number="3" title="Select Entering Variable">
            The most negative coefficient in the Z-row is -5. Therefore xâ‚‚
            enters the basis.
          </Step>

          <Step number="4" title="Perform Ratio Test">
            Positive ratios are calculated using RHS / positive pivot-column
            coefficient.
          </Step>

          <Step number="5" title="Pivot and Repeat">
            Perform row operations and continue until there are no negative
            coefficients in the objective row.
          </Step>

          <Step number="6" title="Optimal Solution">
            The final tableau gives the optimal values of xâ‚, xâ‚‚ and Z.
          </Step>
        </>
      );
    }

    if (activeTopic === "solved") {
      return (
        <>
          <h2 style={styles.sectionTitle}>Solved LPP Examples</h2>

          <div style={{ marginBottom: "25px" }}>
            <h3 style={styles.heading}>Example 1 â€” Graphical Method</h3>

            <Equation>
              Maximize Z = 40xâ‚ + 30xâ‚‚
              <br />
              Subject to:
              <br />
              2xâ‚ + xâ‚‚ â‰¤ 40
              <br />
              xâ‚ + 2xâ‚‚ â‰¤ 50
              <br />
              xâ‚, xâ‚‚ â‰¥ 0
            </Equation>

            <p style={styles.muted}>
              Plot both constraints, identify the feasible region, determine
              the corner points and evaluate the objective function at each
              corner point. The point producing the highest Z is the optimal
              solution.
            </p>
          </div>

          <div>
            <h3 style={styles.heading}>Example 2 â€” Minimization</h3>

            <Equation>
              Minimize Z = 2xâ‚ + 3xâ‚‚
              <br />
              Subject to:
              <br />
              xâ‚ + xâ‚‚ â‰¥ 4
              <br />
              xâ‚ + 2xâ‚‚ â‰¥ 6
              <br />
              xâ‚, xâ‚‚ â‰¥ 0
            </Equation>

            <p style={styles.muted}>
              For a minimization problem, the feasible region is identified
              first and the objective value is calculated at the relevant
              corner points.
            </p>
          </div>
        </>
      );
    }

    if (activeTopic === "practice") {
      return (
        <>
          <h2 style={styles.sectionTitle}>LPP Practice Zone</h2>

          {[
            "Define Linear Programming Problem and explain its components.",
            "Explain decision variables, objective function and constraints.",
            "Solve an LPP using graphical method.",
            "Explain the concept of feasible region.",
            "Explain the Simplex Method.",
            "Differentiate between feasible solution and optimal solution.",
            "Formulate an LPP from a production problem.",
            "Solve a maximization problem using corner point method.",
          ].map((question, index) => (
            <div
              key={index}
              style={{
                ...styles.card,
                padding: "15px 18px",
                marginBottom: "10px",
                display: "flex",
                gap: "12px",
              }}
            >
              <span style={{ color: "#67e8f9", fontWeight: 800 }}>
                Q{index + 1}
              </span>
              <span style={{ color: "#c6d5df", lineHeight: 1.6 }}>
                {question}
              </span>
            </div>
          ))}

          <button
            onClick={() => goSolver("/linear-programming")}
            style={{
              marginTop: "15px",
              border: "1px solid #0ea5e9",
              background: "#0ea5e9",
              color: "#03101b",
              borderRadius: "8px",
              padding: "12px 18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            OPEN LPP SOLVER
          </button>
        </>
      );
    }

    return null;
  };

  const renderTransportationContent = () => {
    if (activeTransportTopic === "intro") {
      return (
        <>
          <h2 style={styles.sectionTitle}>
            Transportation Problem â€” Introduction
          </h2>

          <p style={styles.muted}>
            A Transportation Problem is a special type of Linear Programming
            Problem in which goods or products are transported from a number
            of sources to a number of destinations at minimum transportation
            cost.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            {[
              [
                "Sources",
                "Places from where goods are supplied.",
              ],
              [
                "Destinations",
                "Places where goods are required.",
              ],
              [
                "Supply",
                "Quantity available at each source.",
              ],
              [
                "Demand",
                "Quantity required at each destination.",
              ],
              [
                "Unit Cost",
                "Cost of transporting one unit.",
              ],
              [
                "Objective",
                "Usually to minimize total transportation cost.",
              ],
            ].map(([title, text]) => (
              <div
                key={title}
                style={{
                  ...styles.card,
                  padding: "17px",
                }}
              >
                <div
                  style={{
                    color: "#67e8f9",
                    fontWeight: 800,
                    marginBottom: "7px",
                  }}
                >
                  {title}
                </div>
                <div style={{ ...styles.muted, fontSize: "13px" }}>
                  {text}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ ...styles.heading, marginTop: "28px" }}>
            Main Objective
          </h3>

          <Equation>
            Minimize Total Transportation Cost
          </Equation>

          <p style={styles.muted}>
            The problem determines how much quantity should be transported
            from every source to every destination so that all supply and
            demand requirements are satisfied at minimum cost.
          </p>

          <h3 style={{ ...styles.heading, marginTop: "28px" }}>
            Balanced and Unbalanced Transportation Problem
          </h3>

          <p style={styles.muted}>
            If total supply is equal to total demand, the problem is called a
            <b> balanced transportation problem</b>. If they are not equal,
            the problem is called an <b>unbalanced transportation problem</b>.
          </p>
        </>
      );
    }

    if (activeTransportTopic === "terminology") {
      const terms = [
        [
          "Source",
          "Origin from which units are transported.",
        ],
        [
          "Destination",
          "Location where units are required.",
        ],
        [
          "Supply",
          "Availability of units at each source.",
        ],
        [
          "Demand",
          "Requirement at each destination.",
        ],
        [
          "Transportation Cost",
          "Cost of moving one unit from a source to a destination.",
        ],
        [
          "Allocation",
          "Quantity assigned to a particular source-destination cell.",
        ],
        [
          "Balanced Problem",
          "Total supply equals total demand.",
        ],
        [
          "Unbalanced Problem",
          "Total supply differs from total demand.",
        ],
        [
          "Initial Basic Feasible Solution",
          "A feasible starting transportation solution.",
        ],
        [
          "Basic Cell",
          "Cell containing a positive allocation in the basis.",
        ],
        [
          "MODI",
          "Modified Distribution Method used for optimality testing.",
        ],
        [
          "Opportunity Cost",
          "Net change in cost for an unused cell.",
        ],
      ];

      return (
        <>
          <h2 style={styles.sectionTitle}>
            Transportation â€” Basic Terminology
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "13px",
            }}
          >
            {terms.map(([term, meaning]) => (
              <div
                key={term}
                style={{
                  ...styles.card,
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    color: "#67e8f9",
                    fontWeight: 800,
                    marginBottom: "7px",
                  }}
                >
                  {term}
                </div>

                <div style={{ ...styles.muted, fontSize: "13px" }}>
                  {meaning}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (activeTransportTopic === "model") {
      return (
        <>
          <h2 style={styles.sectionTitle}>
            Mathematical Model of Transportation Problem
          </h2>

          <p style={styles.muted}>
            Let there be m sources and n destinations. Let xáµ¢â±¼ represent the
            quantity transported from source i to destination j.
          </p>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Decision Variable
          </h3>

          <Equation>
            xáµ¢â±¼ = Quantity transported from source i to destination j
          </Equation>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Objective Function
          </h3>

          <Equation>
            Minimize Z = Î£áµ¢ Î£â±¼ cáµ¢â±¼xáµ¢â±¼
          </Equation>

          <p style={styles.muted}>
            Here cáµ¢â±¼ represents the transportation cost per unit from source i
            to destination j.
          </p>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Supply Constraints
          </h3>

          <Equation>
            Î£â±¼ xáµ¢â±¼ = aáµ¢ &nbsp;&nbsp; for each source i
          </Equation>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Demand Constraints
          </h3>

          <Equation>
            Î£áµ¢ xáµ¢â±¼ = bâ±¼ &nbsp;&nbsp; for each destination j
          </Equation>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Non-Negativity
          </h3>

          <Equation>xáµ¢â±¼ â‰¥ 0</Equation>

          <h3 style={{ ...styles.heading, marginTop: "28px" }}>
            Complete Model
          </h3>

          <Equation>
            Minimize Z = Î£áµ¢Î£â±¼ cáµ¢â±¼xáµ¢â±¼
            <br />
            Subject to:
            <br />
            Î£â±¼xáµ¢â±¼ = aáµ¢
            <br />
            Î£áµ¢xáµ¢â±¼ = bâ±¼
            <br />
            xáµ¢â±¼ â‰¥ 0
          </Equation>
        </>
      );
    }

    if (activeTransportTopic === "northwest") {
      return (
        <>
          <h2 style={styles.sectionTitle}>
            North-West Corner Method
          </h2>

          <p style={styles.muted}>
            The North-West Corner Method gives an initial basic feasible
            solution by starting from the top-left or north-west cell of the
            transportation table.
          </p>

          <DataTable
            headers={["", "D1", "D2", "D3", "Supply"]}
            rows={[
              ["S1", "3", "4", "5", "30"],
              ["S2", "1", "2", "6", "35"],
              ["S3", "9", "8", "11", "35"],
              ["Demand", "45", "45", "10", "100"],
            ]}
          />

          <Step number="1" title="Start from North-West Cell">
            Start at S1-D1.
            <Equation>S1-D1 = min(30, 45) = 30</Equation>
          </Step>

          <Step number="2" title="Move to S2-D1">
            S1 supply becomes zero. D1 still requires 15 units.
            <Equation>S2-D1 = min(35, 15) = 15</Equation>
          </Step>

          <Step number="3" title="Move to S2-D2">
            S2 has 20 units remaining and D2 requires 45 units.
            <Equation>S2-D2 = min(20, 45) = 20</Equation>
          </Step>

          <Step number="4" title="Move to S3-D2">
            D2 now requires 25 units.
            <Equation>S3-D2 = min(35, 25) = 25</Equation>
          </Step>

          <Step number="5" title="Move to S3-D3">
            S3 has 10 units remaining and D3 requires 10.
            <Equation>S3-D3 = 10</Equation>
          </Step>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Initial Allocation
          </h3>

          <DataTable
            headers={["", "D1", "D2", "D3", "Supply"]}
            rows={[
              ["S1", "30", "0", "0", "30"],
              ["S2", "15", "20", "0", "35"],
              ["S3", "0", "25", "10", "35"],
              ["Demand", "45", "45", "10", ""],
            ]}
          />

          <Equation>
            Total Cost
            <br />
            = 30(3) + 15(1) + 20(2) + 25(8) + 10(11)
            <br />
            = 90 + 15 + 40 + 200 + 110
            <br />
            = â‚¹455
          </Equation>
        </>
      );
    }

    if (activeTransportTopic === "leastcost") {
      return (
        <>
          <h2 style={styles.sectionTitle}>
            Least Cost Method
          </h2>

          <p style={styles.muted}>
            In the Least Cost Method, allocation begins with the cell having
            the smallest transportation cost. This generally gives a better
            initial solution than the North-West Corner Method.
          </p>

          <DataTable
            headers={["", "D1", "D2", "D3", "Supply"]}
            rows={[
              ["S1", "3", "4", "5", "30"],
              ["S2", "1", "2", "6", "35"],
              ["S3", "9", "8", "11", "35"],
              ["Demand", "45", "45", "10", "100"],
            ]}
          />

          <Step number="1" title="Select Lowest Cost">
            The smallest cost is 1 at S2-D1.
            <Equation>
              Allocation = min(35,45) = 35
            </Equation>
          </Step>

          <Step number="2" title="Next Lowest Available Cost">
            After S2 is exhausted, allocate at S1-D1.
            <Equation>
              Allocation = min(30,10) = 10
            </Equation>
          </Step>

          <Step number="3" title="Allocate at S1-D2">
            S1 has 20 units remaining and D2 requires 45 units.
            <Equation>
              Allocation = min(20,45) = 20
            </Equation>
          </Step>

          <Step number="4" title="Allocate Remaining Demand">
            S3-D2 receives 25 units.
            <br />
            S3-D3 receives 10 units.
          </Step>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Allocation Table
          </h3>

          <DataTable
            headers={["", "D1", "D2", "D3", "Supply"]}
            rows={[
              ["S1", "10", "20", "0", "30"],
              ["S2", "35", "0", "0", "35"],
              ["S3", "0", "25", "10", "35"],
              ["Demand", "45", "45", "10", ""],
            ]}
          />

          <Equation>
            Total Cost
            <br />
            = 10(3) + 20(4) + 35(1) + 25(8) + 10(11)
            <br />
            = 30 + 80 + 35 + 200 + 110
            <br />
            = â‚¹455
          </Equation>
        </>
      );
    }

    if (activeTransportTopic === "vam") {
      return (
        <>
          <h2 style={styles.sectionTitle}>
            Vogel's Approximation Method (VAM)
          </h2>

          <p style={styles.muted}>
            Vogel's Approximation Method calculates a penalty for every row
            and column. The penalty is the difference between the smallest and
            second-smallest transportation costs.
          </p>

          <h3 style={{ ...styles.heading, marginTop: "22px" }}>
            Step 1 â€” Calculate Penalties
          </h3>

          <DataTable
            headers={["Row / Column", "Smallest", "2nd Smallest", "Penalty"]}
            rows={[
              ["S1", "3", "4", "1"],
              ["S2", "1", "2", "1"],
              ["S3", "8", "11", "3"],
              ["D1", "1", "3", "2"],
              ["D2", "2", "4", "2"],
              ["D3", "5", "6", "1"],
            ]}
          />

          <Step number="2" title="Select Highest Penalty">
            Highest penalty is 3 for S3. The lowest cost in S3 is 8 at D2.
            <Equation>
              S3-D2 = min(35,45) = 35
            </Equation>
          </Step>

          <Step number="3" title="Recalculate Penalties">
            After S3 is exhausted, recalculate row and column penalties. The
            highest remaining penalty is 2. The least cost among the selected
            cells is S2-D1.
            <Equation>
              S2-D1 = min(35,45) = 35
            </Equation>
          </Step>

          <Step number="4" title="Allocate Remaining Supply">
            Only S1 remains with 30 units. Remaining demand is 10 units each
            at D1, D2 and D3.
            <Equation>
              S1-D1 = 10
              <br />
              S1-D2 = 10
              <br />
              S1-D3 = 10
            </Equation>
          </Step>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            VAM Allocation
          </h3>

          <DataTable
            headers={["", "D1", "D2", "D3", "Supply"]}
            rows={[
              ["S1", "10", "10", "10", "30"],
              ["S2", "35", "0", "0", "35"],
              ["S3", "0", "35", "0", "35"],
              ["Demand", "45", "45", "10", ""],
            ]}
          />

          <Equation>
            Total Cost
            <br />
            = 10(3) + 10(4) + 10(5) + 35(1) + 35(8)
            <br />
            = 30 + 40 + 50 + 35 + 280
            <br />
            = â‚¹435
          </Equation>

          <div
            style={{
              padding: "15px",
              border: "1px solid #166534",
              background: "#071b14",
              borderRadius: "10px",
              color: "#86efac",
              fontWeight: 700,
            }}
          >
            VAM gives an initial transportation cost of â‚¹435.
          </div>
        </>
      );
    }

    if (activeTransportTopic === "modi") {
      return (
        <>
          <h2 style={styles.sectionTitle}>
            MODI Method â€” Optimality Test
          </h2>

          <p style={styles.muted}>
            MODI stands for Modified Distribution Method. It is used to test
            whether an initial basic feasible solution is optimal and, if it
            is not optimal, to improve the allocation.
          </p>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Step 1 â€” Check Number of Basic Cells
          </h3>

          <Equation>
            m + n - 1
            <br />
            = 3 + 3 - 1
            <br />
            = 5 basic cells
          </Equation>

          <p style={styles.muted}>
            The VAM solution contains five occupied cells:
            S1-D1, S1-D2, S1-D3, S2-D1 and S3-D2.
          </p>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Step 2 â€” Calculate Potentials
          </h3>

          <p style={styles.muted}>
            For every occupied cell:
          </p>

          <Equation>
            uáµ¢ + vâ±¼ = cáµ¢â±¼
          </Equation>

          <p style={styles.muted}>
            Take uâ‚ = 0.
          </p>

          <Equation>
            uâ‚ = 0
            <br />
            vâ‚ = 3
            <br />
            vâ‚‚ = 4
            <br />
            vâ‚ƒ = 5
            <br />
            uâ‚‚ = -2
            <br />
            uâ‚ƒ = 4
          </Equation>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Step 3 â€” Calculate Opportunity Costs
          </h3>

          <p style={styles.muted}>
            For every unoccupied cell:
          </p>

          <Equation>
            Î”áµ¢â±¼ = cáµ¢â±¼ âˆ’ (uáµ¢ + vâ±¼)
          </Equation>

          <DataTable
            headers={["", "D1", "D2", "D3"]}
            rows={[
              ["S1", "Basic", "Basic", "Basic"],
              ["S2", "Basic", "3", "3"],
              ["S3", "2", "Basic", "2"],
            ]}
          />

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Step 4 â€” Optimality Condition
          </h3>

          <p style={styles.muted}>
            For a minimization transportation problem, if all opportunity
            costs of unoccupied cells are greater than or equal to zero, the
            solution is optimal.
          </p>

          <div
            style={{
              padding: "18px",
              marginTop: "15px",
              borderRadius: "10px",
              border: "1px solid #166534",
              background: "#071b14",
              color: "#86efac",
            }}
          >
            <strong>OPTIMAL SOLUTION CONFIRMED</strong>
            <br />
            All non-basic opportunity costs are â‰¥ 0.
          </div>

          <Equation>
            Minimum Transportation Cost = â‚¹435
          </Equation>
        </>
      );
    }

    if (activeTransportTopic === "solved") {
      return (
        <>
          <h2 style={styles.sectionTitle}>
            Complete Transportation Solved Example
          </h2>

          <p style={styles.muted}>
            The following example demonstrates the complete Transportation
            Problem workflow using VAM followed by MODI optimality testing.
          </p>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Given Problem
          </h3>

          <DataTable
            headers={["", "D1", "D2", "D3", "Supply"]}
            rows={[
              ["S1", "3", "4", "5", "30"],
              ["S2", "1", "2", "6", "35"],
              ["S3", "9", "8", "11", "35"],
              ["Demand", "45", "45", "10", "100"],
            ]}
          />

          <Step number="1" title="Check Balance">
            Total Supply:
            <Equation>
              30 + 35 + 35 = 100
            </Equation>
            Total Demand:
            <Equation>
              45 + 45 + 10 = 100
            </Equation>
            Therefore, the transportation problem is balanced.
          </Step>

          <Step number="2" title="Apply VAM">
            Highest initial penalty is 3 for S3. The lowest cost in S3 is 8
            at D2.
            <Equation>
              xâ‚ƒâ‚‚ = 35
            </Equation>
          </Step>

          <Step number="3" title="Second Allocation">
            The next selected cell is S2-D1.
            <Equation>
              xâ‚‚â‚ = 35
            </Equation>
          </Step>

          <Step number="4" title="Complete Remaining Allocation">
            The remaining 30 units of S1 are distributed equally among the
            remaining demands.
            <Equation>
              xâ‚â‚ = 10
              <br />
              xâ‚â‚‚ = 10
              <br />
              xâ‚â‚ƒ = 10
            </Equation>
          </Step>

          <h3 style={{ ...styles.heading, marginTop: "25px" }}>
            Final Allocation
          </h3>

          <DataTable
            headers={["", "D1", "D2", "D3", "Supply"]}
            rows={[
              ["S1", "10", "10", "10", "30"],
              ["S2", "35", "0", "0", "35"],
              ["S3", "0", "35", "0", "35"],
              ["Demand", "45", "45", "10", "100"],
            ]}
          />

          <Step number="5" title="Calculate Total Transportation Cost">
            <Equation>
              Z = 10(3) + 10(4) + 10(5) + 35(1) + 35(8)
              <br />
              Z = 30 + 40 + 50 + 35 + 280
              <br />
              Z = â‚¹435
            </Equation>
          </Step>

          <Step number="6" title="Apply MODI">
            Calculate the potentials:
            <Equation>
              uâ‚ = 0, uâ‚‚ = -2, uâ‚ƒ = 4
              <br />
              vâ‚ = 3, vâ‚‚ = 4, vâ‚ƒ = 5
            </Equation>
          </Step>

          <Step number="7" title="Check Opportunity Costs">
            <Equation>
              Î”â‚‚â‚ƒ = 6 âˆ’ (-2 + 5) = 3
              <br />
              Î”â‚ƒâ‚ = 9 âˆ’ (4 + 3) = 2
              <br />
              Î”â‚ƒâ‚ƒ = 11 âˆ’ (4 + 5) = 2
            </Equation>

            All are positive. Therefore, the current solution is optimal.
          </Step>

          <div
            style={{
              marginTop: "25px",
              padding: "20px",
              background: "#071b14",
              border: "1px solid #166534",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                color: "#86efac",
                fontWeight: 900,
                fontSize: "18px",
                marginBottom: "8px",
              }}
            >
              FINAL ANSWER
            </div>

            <div style={{ color: "#c9f7d8", lineHeight: 1.8 }}>
              Optimal Allocation:
              <br />
              S1 â†’ D1 = 10
              <br />
              S1 â†’ D2 = 10
              <br />
              S1 â†’ D3 = 10
              <br />
              S2 â†’ D1 = 35
              <br />
              S3 â†’ D2 = 35
              <br />
              <br />
              Minimum Transportation Cost = <strong>â‚¹435</strong>
            </div>
          </div>

          <button
            onClick={() => goSolver("/transportation")}
            style={{
              marginTop: "20px",
              border: "1px solid #0ea5e9",
              background: "#0ea5e9",
              color: "#03101b",
              borderRadius: "8px",
              padding: "12px 20px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            OPEN TRANSPORTATION SOLVER
          </button>
        </>
      );
    }

    if (activeTransportTopic === "practice") {
      const questions = [
        "Define Transportation Problem and explain its objective.",
        "Explain source, destination, supply and demand.",
        "Differentiate between balanced and unbalanced transportation problem.",
        "Explain the North-West Corner Method.",
        "Explain the Least Cost Method with steps.",
        "Explain Vogel's Approximation Method.",
        "What is MODI Method?",
        "Explain the optimality condition in MODI.",
        "Solve a transportation problem using North-West Corner Method.",
        "Solve a transportation problem using VAM and test optimality using MODI.",
      ];

      return (
        <>
          <h2 style={styles.sectionTitle}>
            Transportation Practice Zone
          </h2>

          <p style={styles.muted}>
            Use these questions for theory revision, practical preparation and
            examination practice.
          </p>

          {questions.map((question, index) => (
            <div
              key={index}
              style={{
                ...styles.card,
                padding: "15px 18px",
                marginBottom: "10px",
                display: "flex",
                gap: "12px",
              }}
            >
              <span
                style={{
                  color: "#67e8f9",
                  fontWeight: 900,
                  minWidth: "30px",
                }}
              >
                Q{index + 1}
              </span>

              <span
                style={{
                  color: "#c6d5df",
                  lineHeight: 1.6,
                }}
              >
                {question}
              </span>
            </div>
          ))}

          <button
            onClick={() => goSolver("/transportation")}
            style={{
              marginTop: "15px",
              border: "1px solid #0ea5e9",
              background: "#0ea5e9",
              color: "#03101b",
              borderRadius: "8px",
              padding: "12px 18px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            OPEN TRANSPORTATION SOLVER
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <div style={styles.page}>
      {/* HERO */}
      <section
        style={{
          borderBottom: "1px solid #173047",
          background:
            "radial-gradient(circle at 75% 20%, rgba(14,165,233,0.12), transparent 35%), #040d17",
          padding: "65px 0 50px",
        }}
      >
        <div style={styles.container}>
          <div style={styles.smallLabel}>
            OPERATION RESEARCH / LEARNING SYSTEM
          </div>

          <h1
            style={{
              ...styles.heading,
              fontSize: "clamp(32px, 5vw, 58px)",
              margin: "12px 0",
            }}
          >
            Learn <span style={styles.cyan}>Operations Research</span>
          </h1>

          <p
            style={{
              ...styles.muted,
              maxWidth: "760px",
              fontSize: "16px",
            }}
          >
            Study concepts, understand solving methods, follow step-by-step
            numerical solutions and practice important examination questions.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "25px",
            }}
          >
            {[
              ["01", "LPP"],
              ["02", "Transportation"],
              ["03", "Assignment"],
            ].map(([num, label]) => (
              <div
                key={label}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #21445d",
                  background: "#081623",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                <span style={{ color: "#67e8f9" }}>{num}</span>{" "}
                <span style={{ color: "#b9cad6" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEARNING CONTROL */}
      <section style={{ padding: "25px 0 0" }}>
        <div style={styles.container}>
          <div
            style={{
              ...styles.card,
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={styles.smallLabel}>Learning Control</div>
              <div
                style={{
                  marginTop: "5px",
                  color: "#dce8ef",
                  fontWeight: 700,
                }}
              >
                Select a learning stage
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "7px",
                flexWrap: "wrap",
              }}
            >
              {[
                ["fundamentals", "Fundamentals"],
                ["syllabus", "Syllabus"],
                ["concepts", "Concepts"],
                ["formulas", "Formulas"],
                ["methods", "Methods"],
                ["examples", "Examples"],
                ["practice", "Practice"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setStage(id)}
                  style={{
                    border:
                      stage === id
                        ? "1px solid #0ea5e9"
                        : "1px solid #1d3c53",
                    background:
                      stage === id ? "#0ea5e9" : "#07131f",
                    color:
                      stage === id ? "#03101b" : "#9db2c1",
                    padding: "8px 11px",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: 800,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FUNDAMENTALS */}
      {stage === "fundamentals" && (
        <section style={{ padding: "28px 0" }}>
          <div style={styles.container}>
            <div
              style={{
                ...styles.card,
                padding: "30px",
              }}
            >
              <div style={styles.smallLabel}>01 / Fundamentals</div>

              <h2
                style={{
                  ...styles.heading,
                  fontSize: "30px",
                  marginTop: "10px",
                }}
              >
                What is Operations Research?
              </h2>

              <p style={styles.muted}>
                Operations Research is a scientific approach to decision
                making. It uses mathematical models, analytical techniques
                and optimization methods to help determine the best possible
                solution to a problem involving limited resources.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "14px",
                  marginTop: "22px",
                }}
              >
                {[
                  ["Model", "Represent the real-world problem mathematically."],
                  ["Analyze", "Study possible decisions and constraints."],
                  ["Optimize", "Find the best feasible solution."],
                  ["Decide", "Use the result for better decision-making."],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    style={{
                      padding: "18px",
                      background: "#071421",
                      border: "1px solid #17374e",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        color: "#67e8f9",
                        fontWeight: 800,
                        marginBottom: "7px",
                      }}
                    >
                      {title}
                    </div>
                    <div style={{ ...styles.muted, fontSize: "13px" }}>
                      {text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SYLLABUS */}
      {stage === "syllabus" && (
        <section style={{ padding: "28px 0" }}>
          <div style={styles.container}>
            <div style={styles.smallLabel}>02 / Syllabus</div>

            <h2
              style={{
                ...styles.heading,
                fontSize: "30px",
                margin: "8px 0 20px",
              }}
            >
              OR Learning Modules
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
              }}
            >
              {[
                {
                  no: "MODULE 01",
                  title: "Linear Programming",
                  methods: "02 Methods",
                  items: [
                    "Graphical Method",
                    "Simplex Method",
                  ],
                },
                {
                  no: "MODULE 02",
                  title: "Transportation",
                  methods: "04 Methods",
                  items: [
                    "North-West Corner",
                    "Least Cost Method",
                    "Vogel's Approximation Method",
                    "MODI Method",
                  ],
                },
                {
                  no: "MODULE 03",
                  title: "Assignment",
                  methods: "Coming in next learning section",
                  items: [
                    "Assignment Problem",
                  ],
                },
              ].map((module) => (
                <div
                  key={module.no}
                  style={{
                    ...styles.card,
                    padding: "23px",
                  }}
                >
                  <div style={styles.smallLabel}>{module.no}</div>

                  <h3
                    style={{
                      ...styles.heading,
                      margin: "8px 0",
                      fontSize: "22px",
                    }}
                  >
                    {module.title}
                  </h3>

                  <div
                    style={{
                      color: "#67e8f9",
                      fontSize: "12px",
                      fontWeight: 800,
                      marginBottom: "14px",
                    }}
                  >
                    {module.methods}
                  </div>

                  {module.items.map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: "9px 0",
                        borderBottom: "1px solid #173047",
                        color: "#b9cad6",
                        fontSize: "13px",
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONCEPTS */}
      {stage === "concepts" && (
        <section style={{ padding: "28px 0 50px" }}>
          <div style={styles.container}>
            <div style={styles.smallLabel}>03 / Concepts</div>

            <h2
              style={{
                ...styles.heading,
                fontSize: "30px",
                margin: "8px 0 20px",
              }}
            >
              Select Learning Module
            </h2>

            {/* MODULE SWITCHER */}
            <div
              style={{
                ...styles.card,
                padding: "8px",
                display: "flex",
                gap: "8px",
                marginBottom: "18px",
              }}
            >
              <button
                onClick={() => {
                  setActiveModule("lpp");
                  setActiveTopic("intro");
                }}
                style={{
                  flex: 1,
                  border:
                    activeModule === "lpp"
                      ? "1px solid #0ea5e9"
                      : "1px solid transparent",
                  background:
                    activeModule === "lpp"
                      ? "#0ea5e9"
                      : "#07131f",
                  color:
                    activeModule === "lpp"
                      ? "#03101b"
                      : "#9db2c1",
                  padding: "13px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                MODULE 01 â€” LPP
              </button>

              <button
                onClick={() => {
                  setActiveModule("transportation");
                  setActiveTransportTopic("intro");
                }}
                style={{
                  flex: 1,
                  border:
                    activeModule === "transportation"
                      ? "1px solid #0ea5e9"
                      : "1px solid transparent",
                  background:
                    activeModule === "transportation"
                      ? "#0ea5e9"
                      : "#07131f",
                  color:
                    activeModule === "transportation"
                      ? "#03101b"
                      : "#9db2c1",
                  padding: "13px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                MODULE 02 â€” TRANSPORTATION
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "260px 1fr",
                gap: "18px",
                alignItems: "start",
              }}
            >
              {/* TOPIC NAVIGATION */}
              <div
                style={{
                  ...styles.card,
                  padding: "12px",
                  position: "sticky",
                  top: "85px",
                }}
              >
                <div
                  style={{
                    padding: "10px",
                    color: "#5f8299",
                    fontSize: "10px",
                    fontWeight: 900,
                    letterSpacing: "1.5px",
                  }}
                >
                  {activeModule === "lpp"
                    ? "MODULE 01 / LPP"
                    : "MODULE 02 / TRANSPORTATION"}
                </div>

                {(activeModule === "lpp"
                  ? lppTopics
                  : transportTopics
                ).map((topic) => {
                  const isActive =
                    activeModule === "lpp"
                      ? activeTopic === topic.id
                      : activeTransportTopic === topic.id;

                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        if (activeModule === "lpp") {
                          setActiveTopic(topic.id);
                        } else {
                          setActiveTransportTopic(topic.id);
                        }
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        border: "none",
                        borderLeft: isActive
                          ? "3px solid #0ea5e9"
                          : "3px solid transparent",
                        background: isActive
                          ? "#0c2437"
                          : "transparent",
                        color: isActive
                          ? "#67e8f9"
                          : "#93a9b8",
                        padding: "11px 12px",
                        marginBottom: "3px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: isActive ? 800 : 500,
                      }}
                    >
                      {topic.label}
                    </button>
                  );
                })}
              </div>

              {/* CONTENT */}
              <div
                style={{
                  ...styles.card,
                  padding: "30px",
                  minHeight: "650px",
                }}
              >
                {activeModule === "lpp"
                  ? renderLPPContent()
                  : renderTransportationContent()}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FORMULAS */}
      {stage === "formulas" && (
        <section style={{ padding: "28px 0 50px" }}>
          <div style={styles.container}>
            <div style={styles.smallLabel}>04 / Formula Reference</div>

            <h2
              style={{
                ...styles.heading,
                fontSize: "30px",
                margin: "8px 0 20px",
              }}
            >
              Important OR Formulas
            </h2>

            <div
              style={{
                ...styles.card,
                padding: "25px",
              }}
            >
              <h3 style={styles.heading}>LPP</h3>

              <Equation>
                Z = câ‚xâ‚ + câ‚‚xâ‚‚ + ... + câ‚™xâ‚™
              </Equation>

              <h3 style={{ ...styles.heading, marginTop: "25px" }}>
                Transportation
              </h3>

              <Equation>
                Z = Î£áµ¢Î£â±¼ cáµ¢â±¼xáµ¢â±¼
              </Equation>

              <Equation>
                uáµ¢ + vâ±¼ = cáµ¢â±¼
              </Equation>

              <Equation>
                Î”áµ¢â±¼ = cáµ¢â±¼ âˆ’ (uáµ¢ + vâ±¼)
              </Equation>

              <p style={styles.muted}>
                For a minimization transportation problem, the solution is
                optimal when all opportunity costs of unoccupied cells are
                non-negative.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* METHODS */}
      {stage === "methods" && (
        <section style={{ padding: "28px 0 50px" }}>
          <div style={styles.container}>
            <div style={styles.smallLabel}>05 / Methods</div>

            <h2
              style={{
                ...styles.heading,
                fontSize: "30px",
                margin: "8px 0 20px",
              }}
            >
              OR Solving Methods
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
              }}
            >
              {[
                [
                  "LPP",
                  "Graphical Method",
                  "/linear-programming",
                ],
                [
                  "LPP",
                  "Simplex Method",
                  "/linear-programming",
                ],
                [
                  "Transportation",
                  "North-West Corner",
                  "/transportation",
                ],
                [
                  "Transportation",
                  "Least Cost Method",
                  "/transportation",
                ],
                [
                  "Transportation",
                  "Vogel's Approximation",
                  "/transportation",
                ],
                [
                  "Transportation",
                  "MODI Method",
                  "/transportation",
                ],
              ].map(([module, method, path]) => (
                <div
                  key={method}
                  style={{
                    ...styles.card,
                    padding: "20px",
                  }}
                >
                  <div style={styles.smallLabel}>{module}</div>

                  <h3
                    style={{
                      ...styles.heading,
                      fontSize: "18px",
                      margin: "8px 0 15px",
                    }}
                  >
                    {method}
                  </h3>

                  <button
                    onClick={() => goSolver(path)}
                    style={{
                      border: "1px solid #28536e",
                      background: "#081522",
                      color: "#67e8f9",
                      padding: "9px 13px",
                      borderRadius: "7px",
                      cursor: "pointer",
                      fontWeight: 800,
                      fontSize: "11px",
                    }}
                  >
                    OPEN SOLVER â†’
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EXAMPLES */}
      {stage === "examples" && (
        <section style={{ padding: "28px 0 50px" }}>
          <div style={styles.container}>
            <div style={styles.smallLabel}>06 / Worked Examples</div>

            <h2
              style={{
                ...styles.heading,
                fontSize: "30px",
                margin: "8px 0 20px",
              }}
            >
              Step-by-Step Learning
            </h2>

            <div
              style={{
                ...styles.card,
                padding: "25px",
              }}
            >
              <h3 style={styles.heading}>
                Transportation Example
              </h3>

              <p style={styles.muted}>
                Open Concepts â†’ Module 02 â†’ Complete Solved Example to study
                the complete VAM + MODI calculation using the transportation
                table provided in this learning system.
              </p>

              <button
                onClick={() => {
                  setStage("concepts");
                  setActiveModule("transportation");
                  setActiveTransportTopic("solved");
                }}
                style={{
                  marginTop: "12px",
                  border: "1px solid #0ea5e9",
                  background: "#0ea5e9",
                  color: "#03101b",
                  padding: "11px 16px",
                  borderRadius: "7px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                STUDY SOLVED EXAMPLE
              </button>
            </div>
          </div>
        </section>
      )}

      {/* PRACTICE */}
      {stage === "practice" && (
        <section style={{ padding: "28px 0 50px" }}>
          <div style={styles.container}>
            <div style={styles.smallLabel}>07 / Practice</div>

            <h2
              style={{
                ...styles.heading,
                fontSize: "30px",
                margin: "8px 0 20px",
              }}
            >
              Practice & Revision
            </h2>

            <div
              style={{
                ...styles.card,
                padding: "25px",
              }}
            >
              <h3 style={styles.heading}>Recommended Study Flow</h3>

              <Step number="1" title="Understand the Concept">
                Read the introduction and terminology before attempting a
                numerical problem.
              </Step>

              <Step number="2" title="Learn the Method">
                Understand the exact sequence of calculations used by the
                method.
              </Step>

              <Step number="3" title="Follow a Solved Example">
                Work through every calculation instead of only reading the
                final answer.
              </Step>

              <Step number="4" title="Practice Independently">
                Solve the practice questions without looking at the solution.
              </Step>

              <Step number="5" title="Verify with the Solver">
                Use the corresponding OR Smart Solver after completing your
                manual calculation.
              </Step>
            </div>
          </div>
        </section>
      )}

      {/* CORE TOPICS */}
      <section
        style={{
          padding: "35px 0 55px",
          borderTop: "1px solid #122a3d",
        }}
      >
        <div style={styles.container}>
          <div style={styles.smallLabel}>CORE TOPICS</div>

          <h2
            style={{
              ...styles.heading,
              fontSize: "28px",
              margin: "8px 0 20px",
            }}
          >
            Learn â†’ Practice â†’ Solve
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "15px",
            }}
          >
            <div
              style={{
                ...styles.card,
                padding: "23px",
              }}
            >
              <div style={styles.smallLabel}>MODULE 01</div>

              <h3
                style={{
                  ...styles.heading,
                  fontSize: "21px",
                  margin: "8px 0",
                }}
              >
                Linear Programming
              </h3>

              <p style={{ ...styles.muted, fontSize: "13px" }}>
                Graphical Method and Simplex Method.
              </p>

              <button
                onClick={() => goSolver("/linear-programming")}
                style={{
                  border: "1px solid #0ea5e9",
                  background: "#0ea5e9",
                  color: "#03101b",
                  padding: "10px 15px",
                  borderRadius: "7px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                OPEN LPP SOLVER
              </button>
            </div>

            <div
              style={{
                ...styles.card,
                padding: "23px",
              }}
            >
              <div style={styles.smallLabel}>MODULE 02</div>

              <h3
                style={{
                  ...styles.heading,
                  fontSize: "21px",
                  margin: "8px 0",
                }}
              >
                Transportation
              </h3>

              <p style={{ ...styles.muted, fontSize: "13px" }}>
                North-West Corner, Least Cost, VAM and MODI.
              </p>

              <button
                onClick={() => goSolver("/transportation")}
                style={{
                  border: "1px solid #0ea5e9",
                  background: "#0ea5e9",
                  color: "#03101b",
                  padding: "10px 15px",
                  borderRadius: "7px",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                OPEN TRANSPORTATION SOLVER
              </button>
            </div>

            <div
              style={{
                ...styles.card,
                padding: "23px",
              }}
            >
              <div style={styles.smallLabel}>MODULE 03</div>

              <h3
                style={{
                  ...styles.heading,
                  fontSize: "21px",
                  margin: "8px 0",
                }}
              >
                Assignment
              </h3>

              <p style={{ ...styles.muted, fontSize: "13px" }}>
                Assignment learning section will be added next.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section style={{ padding: "0 0 55px" }}>
        <div style={styles.container}>
          <div
            style={{
              ...styles.card,
              padding: "25px",
            }}
          >
            <div style={styles.smallLabel}>LEARNING WORKFLOW</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              {[
                ["01", "Study"],
                ["02", "Understand"],
                ["03", "Calculate"],
                ["04", "Practice"],
                ["05", "Verify"],
              ].map(([number, title]) => (
                <div
                  key={number}
                  style={{
                    padding: "15px",
                    background: "#071421",
                    border: "1px solid #17374e",
                    borderRadius: "9px",
                  }}
                >
                  <div
                    style={{
                      color: "#67e8f9",
                      fontWeight: 900,
                      fontSize: "12px",
                    }}
                  >
                    {number}
                  </div>

                  <div
                    style={{
                      marginTop: "5px",
                      color: "#d5e1e8",
                      fontWeight: 700,
                    }}
                  >
                    {title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXAM PREPARATION */}
      <section style={{ padding: "0 0 55px" }}>
        <div style={styles.container}>
          <div
            style={{
              ...styles.card,
              padding: "28px",
              background:
                "linear-gradient(135deg, #091a29, #07131f)",
            }}
          >
            <div style={styles.smallLabel}>EXAM PREPARATION</div>

            <h2
              style={{
                ...styles.heading,
                fontSize: "27px",
                margin: "8px 0 12px",
              }}
            >
              Prepare With Understanding
            </h2>

            <p
              style={{
                ...styles.muted,
                maxWidth: "850px",
              }}
            >
              Learn the concept first, understand the method, write every
              calculation step, check the result and then practice the same
              type of problem independently.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM STATUS */}
      <section
        style={{
          borderTop: "1px solid #173047",
          background: "#030a12",
          padding: "18px 0",
        }}
      >
        <div
          style={{
            ...styles.container,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "#7690a1",
              fontSize: "11px",
            }}
          >
            OR SMART SOLVER â€¢ LEARNING SYSTEM
          </div>

          <div
            style={{
              color: "#4f7185",
              fontSize: "11px",
            }}
          >
            LPP â€¢ TRANSPORTATION â€¢ ASSIGNMENT
          </div>
        </div>
      </section>
    </div>
  );
}

export default Learn;
