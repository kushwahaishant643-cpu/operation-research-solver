import { useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const cleanNumber = (value) => {
  const x = Number(value);
  if (!Number.isFinite(x)) return 0;
  if (Math.abs(x) < 1e-9) return 0;
  return Number(x.toFixed(6));
};

const formatHand = (value) => {
  const x = Number(value);
  if (!Number.isFinite(x)) return "0";
  if (Math.abs(x) < 1e-9) return "0";
  const rounded = Number(x.toFixed(4));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

const signedCoefficient = (value, variable = "X₂") => {
  const x = Number(value);
  if (!Number.isFinite(x)) return `+ 0${variable}`;
  return x < 0 ? `− ${formatHand(Math.abs(x))}${variable}` : `+ ${formatHand(x)}${variable}`;
};

const equationText = (c) => {
  const a = Number(c.x1);
  const b = Number(c.x2);
  const rhs = Number(c.rhs);
  const op = c.operator === "<=" ? "≤" : c.operator === ">=" ? "≥" : "=";
  return `${formatHand(a)}X₁ ${b < 0 ? `− ${formatHand(Math.abs(b))}` : `+ ${formatHand(b)}`}X₂ ${op} ${formatHand(rhs)}`;
};

function solveSimplexDetailed(objective, constraints, optimization) {
  const c1 = Number(objective.x1);
  const c2 = Number(objective.x2);
  if (!Number.isFinite(c1) || !Number.isFinite(c2)) {
    return { status: "error", message: "Please enter valid objective coefficients." };
  }
  if (!constraints.length) {
    return { status: "error", message: "Please add at least one constraint." };
  }

  const clean = constraints.map((r) => ({
    x1: Number(r.x1),
    x2: Number(r.x2),
    operator: r.operator,
    rhs: Number(r.rhs),
  }));

  for (const r of clean) {
    if (![r.x1, r.x2, r.rhs].every(Number.isFinite)) {
      return { status: "error", message: "Please enter valid numeric values in every constraint." };
    }
    if (r.operator !== "<=") {
      return {
        status: "error",
        message: "Detailed Simplex currently supports ≤ constraints only. Use Graphical Method for ≥ or = constraints.",
      };
    }
    if (r.rhs < 0) {
      return { status: "error", message: "Detailed Simplex requires non-negative RHS values." };
    }
  }

  const m = clean.length;
  const variableNames = ["X₁", "X₂", ...clean.map((_, i) => `S${i + 1}`)];
  const originalC = [c1, c2, ...Array(m).fill(0)];
  const transformedC = optimization === "min" ? [-c1, -c2, ...Array(m).fill(0)] : originalC.slice();
  const totalVars = variableNames.length;

  let rows = clean.map((r, i) => {
    const row = Array(totalVars).fill(0);
    row[0] = r.x1;
    row[1] = r.x2;
    row[2 + i] = 1;
    return row.concat(r.rhs);
  });

  let basis = clean.map((_, i) => 2 + i);
  const iterations = [];
  const maxIterations = 50;

  const calculate = (currentRows, currentBasis) => {
    const zj = Array(totalVars + 1).fill(0);
    currentBasis.forEach((bi, ri) => {
      const cb = transformedC[bi];
      for (let j = 0; j <= totalVars; j++) {
        zj[j] += cb * currentRows[ri][j];
      }
    });
    const cjMinusZj = transformedC.map((cj, j) => cj - zj[j]);
    return { zj, cjMinusZj };
  };

  const cloneRows = (value) => value.map((row) => row.map((v) => cleanNumber(v)));
  const basisNames = (b) => b.map((i) => variableNames[i]);

  const initialCalc = calculate(rows, basis);
  iterations.push({
    number: 0,
    rows: cloneRows(rows),
    basis: [...basis],
    basisNames: basisNames(basis),
    calc: initialCalc,
    entering: null,
    leaving: null,
    pivot: null,
    ratios: [],
    operations: [],
    optimal: false,
  });

  let finalStatus = "optimal";

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    const calc = calculate(rows, basis);
    let entering = -1;
    for (let j = 0; j < totalVars; j++) {
      if (calc.cjMinusZj[j] > 1e-9 && (entering === -1 || calc.cjMinusZj[j] > calc.cjMinusZj[entering])) {
        entering = j;
      }
    }

    if (entering === -1) {
      iterations[iterations.length - 1].optimal = true;
      break;
    }

    const ratios = rows.map((row, ri) => {
      const coefficient = row[entering];
      const rhs = row[totalVars];
      return {
        row: ri + 1,
        coefficient,
        rhs,
        ratio: coefficient > 1e-9 ? rhs / coefficient : null,
      };
    });

    let leavingRow = -1;
    let smallestRatio = Infinity;
    ratios.forEach((item, ri) => {
      if (item.ratio !== null && item.ratio >= -1e-9 && item.ratio < smallestRatio) {
        smallestRatio = item.ratio;
        leavingRow = ri;
      }
    });

    if (leavingRow === -1) {
      finalStatus = "unbounded";
      iterations[iterations.length - 1].unbounded = true;
      break;
    }

    const pivotElement = rows[leavingRow][entering];
    const oldRows = cloneRows(rows);
    const pivotOld = rows[leavingRow].slice();
    const newPivot = pivotOld.map((v) => v / pivotElement);

    const pivotCalculations = pivotOld.map((oldValue, j) => ({
      variable: j < totalVars ? variableNames[j] : "RHS",
      formula: `${formatHand(oldValue)} ÷ ${formatHand(pivotElement)} = ${formatHand(newPivot[j])}`,
      value: newPivot[j],
    }));

    const newRows = rows.map((row, ri) => {
      if (ri === leavingRow) return newPivot.slice();
      const factor = row[entering];
      return row.map((oldValue, j) => oldValue - factor * newPivot[j]);
    });

    const rowOperations = rows.map((row, ri) => {
      if (ri === leavingRow) return null;
      const factor = row[entering];
      return {
        row: ri + 1,
        factor,
        cells: row.map((oldValue, j) => ({
          variable: j < totalVars ? variableNames[j] : "RHS",
          formula: `${formatHand(oldValue)} − (${formatHand(factor)} × ${formatHand(newPivot[j])}) = ${formatHand(oldValue - factor * newPivot[j])}`,
          value: oldValue - factor * newPivot[j],
        })),
      };
    }).filter(Boolean);

    const leaving = variableNames[basis[leavingRow]];
    const enteringName = variableNames[entering];
    const currentCalc = calculate(rows, basis);

    iterations[iterations.length - 1].pivotDetails = {
      entering: enteringName,
      enteringIndex: entering,
      leaving,
      leavingRow,
      pivotElement,
      ratios,
      pivotCalculations,
      rowOperations,
      oldRows,
    };

    basis = [...basis];
    basis[leavingRow] = entering;
    rows = newRows;

    const nextCalc = calculate(rows, basis);
    iterations.push({
      number: iteration,
      rows: cloneRows(rows),
      basis: [...basis],
      basisNames: basisNames(basis),
      calc: nextCalc,
      entering: enteringName,
      leaving,
      pivot: pivotElement,
      ratios,
      operations: rowOperations,
      optimal: false,
    });

    if (iteration === maxIterations) finalStatus = "iteration_limit";
  }

  const finalCalc = calculate(rows, basis);
  const values = Array(totalVars).fill(0);
  basis.forEach((bi, ri) => {
    values[bi] = rows[ri][totalVars];
  });

  const x1 = cleanNumber(values[0]);
  const x2 = cleanNumber(values[1]);
  const originalZ = cleanNumber(c1 * x1 + c2 * x2);
  const checks = clean.map((r) => {
    const lhs = cleanNumber(r.x1 * x1 + r.x2 * x2);
    return {
      lhs,
      rhs: r.rhs,
      slack: cleanNumber(r.rhs - lhs),
      operator: r.operator,
    };
  });

  return {
    status: finalStatus,
    x1,
    x2,
    z: originalZ,
    objective: [c1, c2],
    optimization,
    transformedC,
    variableNames,
    basis,
    finalRows: cloneRows(rows),
    finalCalc,
    iterations,
    checks,
  };
}

function LinearProgramming() {
  const [method, setMethod] = useState("graphical");
  const [optimization, setOptimization] = useState("max");

  const [objective, setObjective] = useState({
    x1: "",
    x2: "",
  });

  const [constraints, setConstraints] = useState([
    {
      x1: "",
      x2: "",
      operator: "<=",
      rhs: "",
    },
    {
      x1: "",
      x2: "",
      operator: "<=",
      rhs: "",
    },
  ]);

  const [result, setResult] = useState(null);
  const [simplexResult, setSimplexResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleObjectiveChange = (field, value) => {
    setObjective({
      ...objective,
      [field]: value,
    });
  };

  const handleConstraintChange = (index, field, value) => {
    const updatedConstraints = [...constraints];

    updatedConstraints[index] = {
      ...updatedConstraints[index],
      [field]: value,
    };

    setConstraints(updatedConstraints);
  };

  const addConstraint = () => {
    setConstraints([
      ...constraints,
      {
        x1: "",
        x2: "",
        operator: "<=",
        rhs: "",
      },
    ]);
  };

  const removeConstraint = (index) => {
    if (constraints.length <= 1) {
      return;
    }

    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: "nearest",
    },

    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#cbd5e1",
          padding: 18,
          usePointStyle: true,
          font: {
            size: 12,
            weight: "600",
          },
        },
      },

      title: {
        display: true,
        text: "LPP Graphical Analysis",
        color: "#f8fafc",
        font: {
          size: 18,
          weight: "700",
        },
        padding: {
          bottom: 6,
        },
      },

      subtitle: {
        display: true,
        text: "Constraints • Feasible Region • Corner Points • Optimal Solution",
        color: "#94a3b8",
        font: {
          size: 11,
        },
        padding: {
          bottom: 18,
        },
      },

      tooltip: {
        backgroundColor: "#0b1b3a",
        borderColor: "#355d91",
        borderWidth: 1,
        titleColor: "#ffffff",
        bodyColor: "#cbd5e1",
        padding: 12,

        callbacks: {
          label: function (context) {
            return `(${context.parsed.x}, ${context.parsed.y})`;
          },
        },
      },
    },

    scales: {
      x: {
        type: "linear",
        grid: {
          color: "rgba(148, 163, 184, 0.13)",
        },
        border: {
          color: "#475569",
        },
        min: 0,
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
        },
        title: {
          display: true,
          text: "Decision Variable X₁",
          color: "#cbd5e1",
          font: {
            size: 12,
            weight: "600",
          },
        },
      },

      y: {
        min: 0,
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.13)",
        },
        border: {
          color: "#475569",
        },
        title: {
          display: true,
          text: "Decision Variable X₂",
          color: "#cbd5e1",
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
    },
  };

  const createGraphData = () => {
    if (!result || !result.graph_constraints) {
      return null;
    }

    const feasibleRegion = result.feasible_region || [];
    const points = result.corner_points || [];

    const maxX = Math.max(
      ...points.map((point) => point.x1),
      result.optimal_solution?.x1 || 0,
      10
    );

    const maxY = Math.max(
      ...points.map((point) => point.x2),
      result.optimal_solution?.x2 || 0,
      10
    );

    const xMax = Math.ceil(maxX + 2);
    const yMax = Math.ceil(maxY + 2);

    const datasets = [];

    if (feasibleRegion.length >= 3) {
      const regionData = feasibleRegion.map((point) => ({
        x: point.x1,
        y: point.x2,
      }));

      regionData.push(regionData[0]);

      datasets.push({
        label: "Feasible Region",
        data: regionData,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.14)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0,
      });
    }

    result.graph_constraints.forEach((constraint, index) => {
      const { a, b, rhs } = constraint;

      let linePoints = [];

      if (b !== 0) {
        linePoints = [
          {
            x: 0,
            y: rhs / b,
          },
          {
            x: xMax,
            y: (rhs - a * xMax) / b,
          },
        ];
      } else if (a !== 0) {
        const x = rhs / a;

        linePoints = [
          {
            x,
            y: 0,
          },
          {
            x,
            y: yMax,
          },
        ];
      }

      const constraintColors = [
        { line: "#38bdf8", glow: "rgba(56,189,248,0.22)" },
        { line: "#a78bfa", glow: "rgba(167,139,250,0.22)" },
        { line: "#f59e0b", glow: "rgba(245,158,11,0.22)" },
        { line: "#f472b6", glow: "rgba(244,114,182,0.22)" },
        { line: "#22d3ee", glow: "rgba(34,211,238,0.22)" },
        { line: "#fb7185", glow: "rgba(251,113,133,0.22)" },
      ];

      const constraintColor =
        constraintColors[index % constraintColors.length];

      datasets.push({
        label: `Constraint ${index + 1}`,
        borderColor: constraintColor.line,
        backgroundColor: constraintColor.glow,
        data: linePoints,
        borderWidth: 3,
        borderDash: [9, 6],
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: constraintColor.line,
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 2,
        tension: 0,
      });
    });

    datasets.push({
      label: "Corner Points",
      data: points.map((point) => ({
        x: point.x1,
        y: point.x2,
      })),
      showLine: false,
      backgroundColor: "#f43f5e",
      pointBackgroundColor: "#f43f5e",
      pointRadius: 7,
      pointBorderColor: "#ffffff",
      pointBorderWidth: 2,
      pointHoverBackgroundColor: "#fb7185",
      pointHoverBorderColor: "#ffffff",
      pointHoverRadius: 10,
    });

    if (result.optimal_solution) {
      datasets.push({
        label: "Optimal Solution",
        data: [
          {
            x: result.optimal_solution.x1,
            y: result.optimal_solution.x2,
          },
        ],
        showLine: false,
        order: 999,
        pointRadius: 15,
        pointStyle: "star",
        backgroundColor: "#22c55e",
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 3,
        pointHoverBackgroundColor: "#4ade80",
        pointHoverBorderColor: "#ffffff",
        pointHoverRadius: 18,
      });
    }

    return {
      datasets,
    };
  };

  const solveProblem = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setSimplexResult(null);

    if (method === "simplex") {
      const solved = solveSimplexDetailed(objective, constraints, optimization);
      if (solved.status === "error") {
        setError(solved.message);
        return;
      }
      setSimplexResult(solved);
      if (solved.status === "unbounded") {
        setError("The Simplex method indicates that the solution is unbounded.");
      }
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        objective: [Number(objective.x1), Number(objective.x2)],
        optimization,
        constraints: constraints.map((constraint) => ({
          coefficients: [Number(constraint.x1), Number(constraint.x2)],
          operator: constraint.operator,
          rhs: Number(constraint.rhs),
        })),
      };

      const response = await axios.post(
        "https://backend-6wiicnc4i-ishant-coders.vercel.app/api/lpp/solve",
        requestData
      );
      setResult(response.data);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "The server returned an error.");
      } else {
        setError("Unable to connect to the Flask backend. Make sure Flask is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalConstraints = constraints.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06142f",
        color: "#e2e8f0",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        paddingBottom: "70px",
      }}
    >
      {/* TOP SYSTEM BAR */}
      <div
        style={{
          borderBottom: "1px solid #1e3a5f",
          background: "#071a38",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: "1320px",
            margin: "0 auto",
            padding: "15px 28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "7px",
                background:
                  "linear-gradient(135deg, #2563eb, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "19px",
                fontWeight: "800",
                color: "#ffffff",
              }}
            >
              OR
            </div>

            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  letterSpacing: "0.08em",
                  color: "#f8fafc",
                }}
              >
                OR SMART SOLVER
              </div>

              <div
                style={{
                  fontSize: "10px",
                  color: "#64748b",
                  letterSpacing: "0.12em",
                  marginTop: "2px",
                }}
              >
                OPERATIONS RESEARCH ENGINE
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "11px",
              color: "#94a3b8",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#22c55e",
                display: "inline-block",
                boxShadow: "0 0 10px rgba(34,197,94,.55)",
              }}
            />

            SYSTEM ONLINE
          </div>
        </div>
      </div>

      <main
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
          padding: "34px 28px",
        }}
      >
        {/* HERO */}
        <section
          style={{
            background:
              "linear-gradient(110deg, #0b1d3d 0%, #0d2750 58%, #0a315c 100%)",
            border: "1px solid #244b78",
            borderRadius: "10px",
            minHeight: "265px",
            padding: "36px 40px",
            position: "relative",
            overflow: "hidden",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-50px",
              top: "-70px",
              width: "360px",
              height: "360px",
              border: "1px solid rgba(96,165,250,.14)",
              borderRadius: "50%",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: "55px",
              top: "38px",
              width: "210px",
              height: "210px",
              border: "1px solid rgba(96,165,250,.12)",
              borderRadius: "50%",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: "95px",
              top: "78px",
              width: "130px",
              height: "130px",
              border: "1px solid rgba(96,165,250,.10)",
              borderRadius: "50%",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: "730px",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #315f91",
                background: "rgba(15,42,78,.7)",
                padding: "7px 11px",
                borderRadius: "4px",
                color: "#7dd3fc",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "0.13em",
                marginBottom: "20px",
              }}
            >
              OPTIMIZATION MODULE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                color: "#f8fafc",
                fontWeight: "800",
              }}
            >
              Linear Programming
            </h1>

            <div
              style={{
                marginTop: "7px",
                color: "#60a5fa",
                fontSize: "16px",
                fontWeight: "700",
                letterSpacing: "0.04em",
              }}
            >
              DECISION OPTIMIZATION ENGINE
            </div>

            <p
              style={{
                margin: "17px 0 0",
                color: "#a8b7ca",
                fontSize: "14px",
                lineHeight: 1.7,
                maxWidth: "670px",
              }}
            >
              Formulate a two-variable optimization model, define
              operational constraints and identify the optimal solution
              using the Graphical Method.
            </p>

            <div
              style={{
                display: "flex",
                gap: "9px",
                marginTop: "22px",
                flexWrap: "wrap",
              }}
            >
              <span style={heroTagStyle}>2 VARIABLES</span>
              <span style={heroTagStyle}>GRAPHICAL METHOD</span>
              <span style={heroTagStyle}>FEASIBLE REGION</span>
              <span style={heroTagStyle}>OPTIMAL POINT</span>
            </div>
          </div>

          {/* Optimization diagram */}
          <div
            style={{
              position: "absolute",
              right: "65px",
              bottom: "30px",
              width: "285px",
              height: "160px",
              opacity: 0.82,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "25px",
                bottom: "25px",
                width: "220px",
                height: "105px",
                borderLeft: "1px solid #456789",
                borderBottom: "1px solid #456789",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "25px",
                bottom: "45px",
                width: "220px",
                height: "1px",
                background: "#315b87",
                transform: "rotate(-23deg)",
                transformOrigin: "left",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "25px",
                bottom: "72px",
                width: "220px",
                height: "1px",
                background: "#5b7392",
                transform: "rotate(-42deg)",
                transformOrigin: "left",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "105px",
                bottom: "59px",
                width: "90px",
                height: "48px",
                background: "rgba(34,197,94,.12)",
                border: "1px solid rgba(34,197,94,.35)",
                transform: "skewY(-22deg)",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: "153px",
                bottom: "73px",
                width: "12px",
                height: "12px",
                background: "#22c55e",
                borderRadius: "50%",
                border: "2px solid #ffffff",
                boxShadow: "0 0 15px rgba(34,197,94,.65)",
              }}
            />

            <span
              style={{
                position: "absolute",
                left: "238px",
                bottom: "18px",
                color: "#64748b",
                fontSize: "9px",
              }}
            >
              X₁
            </span>

            <span
              style={{
                position: "absolute",
                left: "12px",
                bottom: "128px",
                color: "#64748b",
                fontSize: "9px",
              }}
            >
              X₂
            </span>
          </div>
        </section>

        {/* KPI STRIP */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "13px",
            marginBottom: "25px",
          }}
        >
          <KpiCard
            label="DECISION VARIABLES"
            value="02"
            detail="X₁ / X₂"
          />

          <KpiCard
            label="CONSTRAINTS"
            value={String(totalConstraints).padStart(2, "0")}
            detail="Active equations"
          />

          <KpiCard
            label="METHOD"
            value={method === "simplex" ? "SIMPLEX" : "GRAPH"}
            detail={method === "simplex" ? "Simplex Method" : "Graphical Method"}
          />

          <KpiCard
            label="STATUS"
            value={result ? "SOLVED" : "READY"}
            detail={result ? "Analysis available" : "Awaiting model"}
            success={Boolean(result)}
          />
        </section>

        <form onSubmit={solveProblem}>
          {/* METHOD SELECTOR */}
          <section style={panelStyle}>
            <SectionHeader
              number="00"
              title="Solution Method"
              subtitle="Choose the method used to solve the two-variable Linear Programming Problem."
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {[
                ["graphical", "GRAPHICAL METHOD", "Corner points, feasible region and objective evaluation"],
                ["simplex", "SIMPLEX METHOD", "Complete tableau and handwritten-style calculations"],
              ].map(([value, title, subtitle]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMethod(value);
                    setResult(null);
                    setSimplexResult(null);
                    setError("");
                  }}
                  style={{
                    textAlign: "left",
                    padding: "18px",
                    background: method === value ? "#0b2947" : "#071832",
                    border: `1px solid ${method === value ? "#38bdf8" : "#29496c"}`,
                    color: "#e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    boxShadow: method === value ? "0 0 0 1px rgba(56,189,248,.12)" : "none",
                  }}
                >
                  <div style={{ fontSize: "10px", color: method === value ? "#38bdf8" : "#64748b", fontWeight: "800", letterSpacing: "0.1em" }}>
                    {method === value ? "ACTIVE METHOD" : "SELECT METHOD"}
                  </div>
                  <div style={{ marginTop: "7px", fontSize: "16px", fontWeight: "800" }}>{title}</div>
                  <div style={{ marginTop: "5px", color: "#8ba7c0", fontSize: "11px", lineHeight: 1.5 }}>{subtitle}</div>
                </button>
              ))}
            </div>
          </section>

          {/* OBJECTIVE FUNCTION */}
          <section style={panelStyle}>
            <SectionHeader
              number="01"
              title="Objective Function"
              subtitle="Define the optimization target and decision-variable coefficients."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.05fr 1fr 1fr",
                gap: "15px",
                marginTop: "23px",
              }}
            >
              <FieldBlock label="OPTIMIZATION">
                <select
                  style={inputStyle}
                  value={optimization}
                  onChange={(e) => setOptimization(e.target.value)}
                >
                  <option value="max">Maximize</option>
                  <option value="min">Minimize</option>
                </select>
              </FieldBlock>

              <FieldBlock label="COEFFICIENT OF X₁">
                <input
                  type="number"
                  step="any"
                  style={inputStyle}
                  placeholder="e.g. 3"
                  value={objective.x1}
                  onChange={(e) =>
                    handleObjectiveChange("x1", e.target.value)
                  }
                  required
                />
              </FieldBlock>

              <FieldBlock label="COEFFICIENT OF X₂">
                <input
                  type="number"
                  step="any"
                  style={inputStyle}
                  placeholder="e.g. 5"
                  value={objective.x2}
                  onChange={(e) =>
                    handleObjectiveChange("x2", e.target.value)
                  }
                  required
                />
              </FieldBlock>
            </div>

            <div
              style={{
                marginTop: "18px",
                border: "1px solid #244b78",
                background: "#0a1c3b",
                borderRadius: "6px",
                padding: "15px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "9px",
                    fontWeight: "800",
                    letterSpacing: "0.12em",
                    marginBottom: "5px",
                  }}
                >
                  CURRENT OBJECTIVE MODEL
                </div>

                <div
                  style={{
                    fontSize: "19px",
                    fontWeight: "700",
                    color: "#e2e8f0",
                  }}
                >
                  {optimization === "max" ? "Maximize" : "Minimize"}{" "}
                  <span style={{ color: "#60a5fa" }}>Z</span> ={" "}
                  <span style={{ color: "#f8fafc" }}>
                    {objective.x1 || "?"}X₁
                  </span>{" "}
                  +{" "}
                  <span style={{ color: "#f8fafc" }}>
                    {objective.x2 || "?"}X₂
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: "7px 11px",
                  border: "1px solid #315f91",
                  color: "#7dd3fc",
                  fontSize: "10px",
                  fontWeight: "800",
                  letterSpacing: "0.08em",
                  borderRadius: "4px",
                }}
              >
                OBJECTIVE DEFINED
              </div>
            </div>
          </section>

          {/* CONSTRAINTS */}
          <section style={panelStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <SectionHeader
                number="02"
                title="Constraint Matrix"
                subtitle="Configure the operational limits governing the decision variables."
              />

              <button
                type="button"
                onClick={addConstraint}
                style={secondaryButtonStyle}
              >
                + ADD CONSTRAINT
              </button>
            </div>

            <div
              style={{
                marginTop: "24px",
                border: "1px solid #203e64",
                borderRadius: "7px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "65px 1fr 1fr 150px 1fr 115px",
                  background: "#0a1c3b",
                  borderBottom: "1px solid #203e64",
                  padding: "12px 14px",
                  gap: "12px",
                  color: "#64748b",
                  fontSize: "9px",
                  fontWeight: "800",
                  letterSpacing: "0.1em",
                }}
              >
                <div>NO.</div>
                <div>X₁ COEFFICIENT</div>
                <div>X₂ COEFFICIENT</div>
                <div>OPERATOR</div>
                <div>RHS</div>
                <div>ACTION</div>
              </div>

              {constraints.map((constraint, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "65px 1fr 1fr 150px 1fr 115px",
                    gap: "12px",
                    alignItems: "center",
                    padding: "15px 14px",
                    borderBottom:
                      index === constraints.length - 1
                        ? "none"
                        : "1px solid #1b3557",
                    background:
                      index % 2 === 0 ? "#0b1e3f" : "#091b38",
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        width: "30px",
                        height: "30px",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "4px",
                        background: "#102c52",
                        border: "1px solid #2b527c",
                        color: "#60a5fa",
                        fontWeight: "800",
                        fontSize: "11px",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <input
                    type="number"
                    step="any"
                    style={matrixInputStyle}
                    placeholder="Coefficient"
                    value={constraint.x1}
                    onChange={(e) =>
                      handleConstraintChange(
                        index,
                        "x1",
                        e.target.value
                      )
                    }
                    required
                  />

                  <input
                    type="number"
                    step="any"
                    style={matrixInputStyle}
                    placeholder="Coefficient"
                    value={constraint.x2}
                    onChange={(e) =>
                      handleConstraintChange(
                        index,
                        "x2",
                        e.target.value
                      )
                    }
                    required
                  />

                  <select
                    style={matrixInputStyle}
                    value={constraint.operator}
                    onChange={(e) =>
                      handleConstraintChange(
                        index,
                        "operator",
                        e.target.value
                      )
                    }
                  >
                    <option value="<=">≤</option>
                    <option value=">=">≥</option>
                    <option value="=">=</option>
                  </select>

                  <input
                    type="number"
                    step="any"
                    style={matrixInputStyle}
                    placeholder="RHS value"
                    value={constraint.rhs}
                    onChange={(e) =>
                      handleConstraintChange(
                        index,
                        "rhs",
                        e.target.value
                      )
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeConstraint(index)}
                    disabled={constraints.length <= 1}
                    style={{
                      ...removeButtonStyle,
                      opacity:
                        constraints.length <= 1 ? 0.35 : 1,
                      cursor:
                        constraints.length <= 1
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 15px",
                background: "#091a35",
                border: "1px solid #1d385b",
                borderRadius: "5px",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "12px",
                }}
              >
                <strong style={{ color: "#cbd5e1" }}>
                  Non-negativity:
                </strong>{" "}
                X₁ ≥ 0, X₂ ≥ 0
              </div>

              <div
                style={{
                  color: "#64748b",
                  fontSize: "10px",
                  fontWeight: "700",
                  letterSpacing: "0.08em",
                }}
              >
                {totalConstraints} ACTIVE CONSTRAINT
                {totalConstraints !== 1 ? "S" : ""}
              </div>
            </div>
          </section>

          {/* SOLVER CONTROL */}
          <section
            style={{
              background: "#0a1c3b",
              border: "1px solid #28517e",
              borderRadius: "8px",
              padding: "21px 24px",
              marginBottom: "25px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "5px",
                  background: "#102c52",
                  border: "1px solid #315f91",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#60a5fa",
                  fontSize: "16px",
                  fontWeight: "800",
                }}
              >
                LP
              </div>

              <div>
                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "13px",
                    fontWeight: "800",
                  }}
                >
                  Optimization Engine
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: "10px",
                    marginTop: "3px",
                  }}
                >
                  Validate model and calculate feasible optimum
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...solveButtonStyle,
                opacity: loading ? 0.65 : 1,
              }}
            >
              {loading ? "PROCESSING MODEL..." : "RUN OPTIMIZATION"}
              {!loading && <span style={{ fontSize: "17px" }}>→</span>}
            </button>
          </section>
        </form>

        {/* ERROR */}
        {error && (
          <div
            style={{
              background: "#32131a",
              border: "1px solid #7f2638",
              color: "#fecdd3",
              borderRadius: "7px",
              padding: "15px 18px",
              marginBottom: "25px",
              fontSize: "13px",
            }}
          >
            <strong style={{ color: "#fb7185" }}>SYSTEM ERROR:</strong>{" "}
            {error}
          </div>
        )}

        {/* SIMPLEX RESULTS */}
        {method === "simplex" && simplexResult && simplexResult.status === "optimal" && (
          <section style={{ marginBottom: "25px" }}>
            <div style={{ ...panelStyle, background: "#081a2d", borderColor: "#28517e" }}>
              <SectionHeader
                number="03"
                title="Simplex Solution Analysis"
                subtitle="Complete college exam-style working with tableau, Zⱼ, Cⱼ − Zⱼ, ratio test and pivot calculations."
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "14px",
                  marginTop: "22px",
                }}
              >
                <ResultKpi label="OPTIMAL X₁" value={simplexResult.x1} />
                <ResultKpi label="OPTIMAL X₂" value={simplexResult.x2} />
                <ResultKpi
                  label={optimization === "max" ? "MAXIMUM Z" : "MINIMUM Z"}
                  value={simplexResult.z}
                  highlight
                />
              </div>

              <div
                style={{
                  marginTop: "22px",
                  padding: "32px",
                  background: "#f8f6ee",
                  color: "#20252b",
                  border: "1px solid #b8b09d",
                  boxShadow: "0 12px 35px rgba(0,0,0,.28)",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  lineHeight: 1.65,
                }}
              >
                <div
                  style={{
                    borderBottom: "2px solid #777",
                    paddingBottom: "16px",
                    marginBottom: "28px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Arial, sans-serif",
                      fontSize: "10px",
                      fontWeight: "800",
                      letterSpacing: "0.16em",
                      color: "#475569",
                    }}
                  >
                    OPERATIONS RESEARCH • COLLEGE EXAM WORKING
                  </div>

                  <h2
                    style={{
                      margin: "7px 0 0",
                      color: "#111827",
                      fontSize: "27px",
                    }}
                  >
                    Simplex Method — Step-by-Step Solution
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#4b5563",
                      fontSize: "13px",
                    }}
                  >
                    The solution is generated from the LPP entered above and follows the
                    standard Simplex procedure.
                  </p>
                </div>

                {/* STEP 1 */}
                <div style={{ marginBottom: "28px" }}>
                  <h3 style={{ color: "#1e3a5f", marginBottom: "11px" }}>
                    Step 1 — Given LPP
                  </h3>

                  <div
                    style={{
                      padding: "15px 17px",
                      border: "1px solid #aaa",
                      background: "#fffdf7",
                      fontSize: "19px",
                      fontWeight: "700",
                    }}
                  >
                    {optimization === "max" ? "Maximize" : "Minimize"} Z ={" "}
                    {formatHand(simplexResult.objective[0])}X₁{" "}
                    {signedCoefficient(simplexResult.objective[1])}
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    {constraints.map((c, i) => (
                      <div key={i} style={{ padding: "5px 0", fontSize: "17px" }}>
                        {i + 1}. {equationText(c)}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "8px", fontSize: "16px" }}>
                    X₁ ≥ 0, &nbsp; X₂ ≥ 0
                  </div>
                </div>

                {/* STEP 2 */}
                <div style={{ marginBottom: "30px" }}>
                  <h3 style={{ color: "#1e3a5f", marginBottom: "11px" }}>
                    Step 2 — Convert into Standard Form
                  </h3>

                  <p style={{ margin: "5px 0 12px", fontSize: "15px", lineHeight: 1.65 }}>
                    Since the constraints are of the ≤ type, add one slack variable to
                    each constraint.
                  </p>

                  {constraints.map((c, i) => {
                    const a = Number(c.x1);
                    const b = Number(c.x2);

                    return (
                      <div key={i} style={{ padding: "6px 0", fontSize: "17px" }}>
                        {formatHand(a)}X₁{" "}
                        {b < 0
                          ? `− ${formatHand(Math.abs(b))}X₂`
                          : `+ ${formatHand(b)}X₂`}{" "}
                        + S{i + 1} = {formatHand(c.rhs)}
                      </div>
                    );
                  })}

                  <div style={{ marginTop: "9px", fontSize: "16px" }}>
                    X₁, X₂, S₁, S₂, … ≥ 0
                  </div>
                </div>

                {/* TABLEAUX AND CALCULATIONS */}
                {simplexResult.iterations.map((it) => {
                  const pivot = it.pivotDetails;
                  const names = simplexResult.variableNames;
                  const cj = simplexResult.transformedC;

                  return (
                    <div key={it.number} style={{ marginBottom: "38px" }}>
                      <div
                        style={{
                          padding: "13px 16px",
                          background: "#e8e3d7",
                          borderLeft: "4px solid #1e3a5f",
                          marginBottom: "16px",
                        }}
                      >
                        <h3 style={{ margin: 0, color: "#1e3a5f", fontSize: "21px" }}>
                          {it.number === 0
                            ? "Step 3 — Initial Simplex Tableau"
                            : `Iteration ${it.number} — New Simplex Tableau`}
                        </h3>

                        <div style={{ marginTop: "5px", fontSize: "14px", color: "#4b5563" }}>
                          Basic variables: {it.basisNames.join(", ")}
                        </div>
                      </div>

                      <div
                        style={{
                          overflowX: "auto",
                          border: "1px solid #8c8c8c",
                          background: "#fffdf7",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: "760px",
                            fontSize: "13px",
                          }}
                        >
                          <thead>
                            <tr style={{ background: "#e6e1d5" }}>
                              <th style={{ padding: "9px", border: "1px solid #999" }}>Cᵦ</th>
                              <th style={{ padding: "9px", border: "1px solid #999" }}>Basis</th>

                              {names.map((name, j) => (
                                <th key={name} style={{ padding: "9px", border: "1px solid #999" }}>
                                  Cⱼ = {formatHand(cj[j])}
                                  <br />
                                  {name}
                                </th>
                              ))}

                              <th style={{ padding: "9px", border: "1px solid #999" }}>RHS</th>
                            </tr>
                          </thead>

                          <tbody>
                            {it.rows.map((row, ri) => {
                              const basisIndex = it.basis[ri];

                              return (
                                <tr key={ri}>
                                  <td style={{ padding: "9px", border: "1px solid #aaa", textAlign: "center" }}>
                                    {formatHand(cj[basisIndex])}
                                  </td>

                                  <td
                                    style={{
                                      padding: "9px",
                                      border: "1px solid #aaa",
                                      textAlign: "center",
                                      fontWeight: "800",
                                    }}
                                  >
                                    {names[basisIndex]}
                                  </td>

                                  {row.slice(0, names.length).map((v, j) => (
                                    <td
                                      key={j}
                                      style={{
                                        padding: "9px",
                                        border: "1px solid #aaa",
                                        textAlign: "center",
                                      }}
                                    >
                                      {formatHand(v)}
                                    </td>
                                  ))}

                                  <td
                                    style={{
                                      padding: "9px",
                                      border: "1px solid #aaa",
                                      textAlign: "center",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {formatHand(row[names.length])}
                                  </td>
                                </tr>
                              );
                            })}

                            <tr style={{ background: "#eee9dc", fontWeight: "700" }}>
                              <td style={{ padding: "9px", border: "1px solid #aaa" }}>Zⱼ</td>
                              <td style={{ padding: "9px", border: "1px solid #aaa" }}>—</td>

                              {it.calc.zj.slice(0, names.length).map((v, j) => (
                                <td
                                  key={j}
                                  style={{
                                    padding: "9px",
                                    border: "1px solid #aaa",
                                    textAlign: "center",
                                  }}
                                >
                                  {formatHand(v)}
                                </td>
                              ))}

                              <td
                                style={{
                                  padding: "9px",
                                  border: "1px solid #aaa",
                                  textAlign: "center",
                                }}
                              >
                                {formatHand(it.calc.zj[names.length])}
                              </td>
                            </tr>

                            <tr style={{ background: "#ded8ca", fontWeight: "800" }}>
                              <td style={{ padding: "9px", border: "1px solid #aaa" }}>Cⱼ − Zⱼ</td>
                              <td style={{ padding: "9px", border: "1px solid #aaa" }}>—</td>

                              {it.calc.cjMinusZj.map((v, j) => (
                                <td
                                  key={j}
                                  style={{
                                    padding: "9px",
                                    border: "1px solid #aaa",
                                    textAlign: "center",
                                  }}
                                >
                                  {formatHand(v)}
                                </td>
                              ))}

                              <td style={{ padding: "9px", border: "1px solid #aaa", textAlign: "center" }}>
                                —
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div style={{ marginTop: "20px" }}>
                        <h4 style={{ color: "#374151", marginBottom: "9px" }}>
                          1. Calculate Zⱼ
                        </h4>

                        {it.calc.zj.slice(0, names.length).map((z, j) => {
                          const terms = it.rows
                            .map(
                              (row, ri) =>
                                `${formatHand(cj[it.basis[ri]])} × ${formatHand(row[j])}`
                            )
                            .join(" + ");

                          return (
                            <div key={j} style={{ padding: "5px 10px", fontSize: "14px" }}>
                              Zⱼ ({names[j]}) = {terms} = <b>{formatHand(z)}</b>
                            </div>
                          );
                        })}

                        <div style={{ padding: "5px 10px", fontSize: "14px" }}>
                          Zⱼ (RHS) ={" "}
                          {it.rows
                            .map(
                              (row, ri) =>
                                `${formatHand(cj[it.basis[ri]])} × ${formatHand(
                                  row[names.length]
                                )}`
                            )
                            .join(" + ")}{" "}
                          = <b>{formatHand(it.calc.zj[names.length])}</b>
                        </div>
                      </div>

                      <div style={{ marginTop: "18px" }}>
                        <h4 style={{ color: "#374151", marginBottom: "9px" }}>
                          2. Calculate Cⱼ − Zⱼ
                        </h4>

                        {it.calc.cjMinusZj.map((v, j) => (
                          <div key={j} style={{ padding: "4px 10px", fontSize: "14px" }}>
                            Cⱼ − Zⱼ ({names[j]}) = {formatHand(cj[j])} −{" "}
                            {formatHand(it.calc.zj[j])} = <b>{formatHand(v)}</b>
                          </div>
                        ))}
                      </div>

                      {it.optimal ? (
                        <div
                          style={{
                            marginTop: "20px",
                            padding: "14px 16px",
                            border: "2px solid #15803d",
                            background: "#ecfdf5",
                            color: "#166534",
                            fontSize: "15px",
                            fontWeight: "700",
                          }}
                        >
                          All Cⱼ − Zⱼ values are ≤ 0. Therefore, the present tableau is
                          optimal and no further iteration is required.
                        </div>
                      ) : pivot ? (
                        <>
                          <div
                            style={{
                              marginTop: "20px",
                              padding: "14px 16px",
                              border: "1px solid #aaa",
                              background: "#fffdf7",
                              fontSize: "15px",
                            }}
                          >
                            <b>3. Select Entering Variable:</b> {pivot.entering} has the
                            largest positive Cⱼ − Zⱼ value, so {pivot.entering} enters the
                            basis.
                          </div>

                          <h4 style={{ marginTop: "20px", color: "#374151" }}>
                            4. Ratio Test
                          </h4>

                          {pivot.ratios.map((r) => (
                            <div key={r.row} style={{ padding: "5px 10px", fontSize: "14px" }}>
                              R{r.row}:{" "}
                              {r.ratio === null
                                ? "Not applicable because the coefficient is not positive."
                                : `${formatHand(r.rhs)} ÷ ${formatHand(r.coefficient)} = ${formatHand(
                                    r.ratio
                                  )}`}
                            </div>
                          ))}

                          <div style={{ padding: "7px 10px", fontSize: "14px", fontWeight: "700" }}>
                            Smallest positive ratio ={" "}
                            {formatHand(
                              Math.min(
                                ...pivot.ratios
                                  .filter((r) => r.ratio !== null)
                                  .map((r) => r.ratio)
                              )
                            )}{" "}
                            → Leaving variable = <b>{pivot.leaving}</b>.
                          </div>

                          <div
                            style={{
                              marginTop: "20px",
                              padding: "14px 16px",
                              border: "1px solid #aaa",
                              background: "#fffdf7",
                              fontSize: "15px",
                            }}
                          >
                            <b>5. Pivot Element:</b> The pivot element is at the
                            intersection of the entering-variable column and leaving row.
                            Therefore, pivot element ={" "}
                            <b>{formatHand(pivot.pivotElement)}</b>.
                          </div>

                          <h4 style={{ marginTop: "20px", color: "#374151" }}>
                            6. Calculate the New Pivot Row
                          </h4>

                          <div style={{ padding: "5px 10px", fontSize: "14px" }}>
                            New Pivot Row = Old Pivot Row ÷ Pivot Element = Old Pivot Row ÷{" "}
                            {formatHand(pivot.pivotElement)}
                          </div>

                          {pivot.pivotCalculations.map((c, j) => (
                            <div key={j} style={{ padding: "4px 10px", fontSize: "14px" }}>
                              {c.variable}: {c.formula}
                            </div>
                          ))}

                          <h4 style={{ marginTop: "20px", color: "#374151" }}>
                            7. Calculate the Other Rows
                          </h4>

                          {pivot.rowOperations.map((op) => (
                            <div key={op.row} style={{ marginBottom: "13px" }}>
                              <div style={{ padding: "6px 10px", fontWeight: "700" }}>
                                R{op.row} new = R{op.row} old − (
                                {formatHand(op.factor)} × New Pivot Row)
                              </div>

                              {op.cells.map((cell, j) => (
                                <div key={j} style={{ padding: "3px 10px", fontSize: "13px" }}>
                                  {cell.variable}: {cell.formula}
                                </div>
                              ))}
                            </div>
                          ))}

                          <div
                            style={{
                              marginTop: "18px",
                              padding: "13px 15px",
                              border: "1px dashed #64748b",
                              background: "#f3f1e8",
                              fontSize: "14px",
                            }}
                          >
                            The above calculations give the next simplex tableau. Repeat
                            the same procedure until all Cⱼ − Zⱼ values are ≤ 0.
                          </div>
                        </>
                      ) : null}
                    </div>
                  );
                })}

                {/* FINAL ANSWER */}
                <div
                  style={{
                    marginTop: "10px",
                    padding: "23px",
                    border: "2px solid #15803d",
                    background: "#ecfdf5",
                  }}
                >
                  <h3 style={{ color: "#166534", marginTop: 0 }}>
                    Step 10 — Final Answer
                  </h3>

                  <p style={{ fontSize: "15px", lineHeight: 1.65 }}>
                    In the final tableau, all Cⱼ − Zⱼ values are ≤ 0. Therefore, the
                    simplex method has reached the optimal solution.
                  </p>

                  <div style={{ fontSize: "18px", lineHeight: 1.95 }}>
                    X₁ = <b>{formatHand(simplexResult.x1)}</b>
                    <br />
                    X₂ = <b>{formatHand(simplexResult.x2)}</b>
                    <br />
                    Z = {formatHand(simplexResult.objective[0])}(
                    {formatHand(simplexResult.x1)}){" "}
                    {simplexResult.objective[1] < 0 ? "−" : "+"}{" "}
                    {formatHand(Math.abs(simplexResult.objective[1]))}(
                    {formatHand(simplexResult.x2)}) ={" "}
                    <b>{formatHand(simplexResult.z)}</b>
                  </div>

                  <div style={{ marginTop: "11px", fontSize: "15px", fontWeight: "700" }}>
                    Therefore, the {optimization === "max" ? "maximum" : "minimum"} value
                    of Z is {formatHand(simplexResult.z)} at X₁ ={" "}
                    {formatHand(simplexResult.x1)} and X₂ ={" "}
                    {formatHand(simplexResult.x2)}.
                  </div>
                </div>

                {/* VERIFICATION */}
                <div style={{ marginTop: "24px" }}>
                  <h3 style={{ color: "#1e3a5f" }}>Constraint Verification</h3>

                  {simplexResult.checks.map((check, i) => (
                    <div key={i} style={{ padding: "7px 10px", fontSize: "14px" }}>
                      Constraint {i + 1}: LHS = {formatHand(check.lhs)}, RHS ={" "}
                      {formatHand(check.rhs)} → satisfied ✓ &nbsp; Slack ={" "}
                      {formatHand(check.slack)}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "16px",
                    borderTop: "1px dashed #888",
                    fontStyle: "italic",
                    fontSize: "15px",
                  }}
                >
                  Hence, the required {optimization === "max" ? "maximum" : "minimum"}{" "}
                  value is Z = {formatHand(simplexResult.z)} at X₁ ={" "}
                  {formatHand(simplexResult.x1)} and X₂ ={" "}
                  {formatHand(simplexResult.x2)}.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RESULTS */}
        {result && result.status === "optimal" && (
          <>
            {/* RESULT HEADER */}
            <section
              style={{
                background:
                  "linear-gradient(110deg, #0a213e, #0a2949)",
                border: "1px solid #275c52",
                borderRadius: "8px",
                padding: "25px 27px",
                marginBottom: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "800",
                    color: "#4ade80",
                    letterSpacing: "0.13em",
                    marginBottom: "7px",
                  }}
                >
                  OPTIMIZATION COMPLETE
                </div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    color: "#f8fafc",
                    fontWeight: "800",
                  }}
                >
                  Optimal Solution Identified
                </h2>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  The graphical model has produced a feasible optimal
                  decision point.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  border: "1px solid #2d765b",
                  background: "#0b2b27",
                  padding: "10px 14px",
                  borderRadius: "5px",
                  color: "#4ade80",
                  fontSize: "10px",
                  fontWeight: "800",
                  letterSpacing: "0.08em",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                  }}
                />
                OPTIMAL
              </div>
            </section>

            {/* RESULT KPIs */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "14px",
                marginBottom: "25px",
              }}
            >
              <ResultKpi
                label="DECISION VARIABLE X₁"
                value={result.optimal_solution.x1}
              />

              <ResultKpi
                label="DECISION VARIABLE X₂"
                value={result.optimal_solution.x2}
              />

              <ResultKpi
                label={
                  optimization === "max"
                    ? "MAXIMUM OBJECTIVE Z"
                    : "MINIMUM OBJECTIVE Z"
                }
                value={result.optimal_solution.z}
                highlight
              />
            </section>

            {/* ANALYSIS GRID */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "0.82fr 1.18fr",
                gap: "16px",
                marginBottom: "25px",
              }}
            >
              {/* CORNER POINTS */}
              <div style={panelStyle}>
                <SectionHeader
                  number="03"
                  title="Corner Point Analysis"
                  subtitle="Objective value evaluated at feasible corner points."
                />

                <div
                  style={{
                    marginTop: "22px",
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={tableHeaderStyle}>POINT</th>
                        <th style={tableHeaderStyle}>X₁</th>
                        <th style={tableHeaderStyle}>X₂</th>
                        <th style={tableHeaderStyle}>Z</th>
                      </tr>
                    </thead>

                    <tbody>
                      {result.corner_points.map((point, index) => {
                        const isOptimal =
                          Number(point.x1) ===
                            Number(result.optimal_solution.x1) &&
                          Number(point.x2) ===
                            Number(result.optimal_solution.x2);

                        return (
                          <tr key={index}>
                            <td
                              style={{
                                ...tableCellStyle,
                                color: isOptimal
                                  ? "#4ade80"
                                  : "#94a3b8",
                                fontWeight: "800",
                              }}
                            >
                              P{index + 1}
                            </td>

                            <td style={tableCellStyle}>
                              {point.x1}
                            </td>

                            <td style={tableCellStyle}>
                              {point.x2}
                            </td>

                            <td
                              style={{
                                ...tableCellStyle,
                                color: isOptimal
                                  ? "#4ade80"
                                  : "#e2e8f0",
                                fontWeight: "800",
                              }}
                            >
                              {point.z}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SOLUTION SUMMARY */}
              <div style={panelStyle}>
                <SectionHeader
                  number="04"
                  title="Decision Summary"
                  subtitle="Final operational decision generated by the solver."
                />

                <div
                  style={{
                    marginTop: "22px",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <SummaryBlock
                    label="X₁ DECISION"
                    value={result.optimal_solution.x1}
                    description="Optimal level of decision variable X₁"
                  />

                  <SummaryBlock
                    label="X₂ DECISION"
                    value={result.optimal_solution.x2}
                    description="Optimal level of decision variable X₂"
                  />
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    padding: "18px",
                    background: "#0a203d",
                    border: "1px solid #28517e",
                    borderRadius: "6px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#64748b",
                      fontWeight: "800",
                      letterSpacing: "0.11em",
                    }}
                  >
                    OBJECTIVE VALUE
                  </div>

                  <div
                    style={{
                      marginTop: "6px",
                      fontSize: "30px",
                      fontWeight: "800",
                      color: "#60a5fa",
                    }}
                  >
                    {result.optimal_solution.z}
                  </div>

                  <div
                    style={{
                      marginTop: "5px",
                      color: "#94a3b8",
                      fontSize: "11px",
                    }}
                  >
                    {optimization === "max"
                      ? "Maximum achievable objective value"
                      : "Minimum achievable objective value"}
                  </div>
                </div>
              </div>
            </section>

            {/* GRAPHICAL ANALYSIS */}
            {createGraphData() && (
              <section style={panelStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <SectionHeader
                    number="05"
                    title="Optimization Analysis"
                    subtitle="Graphical representation of constraints, feasible region and optimal point."
                  />

                  <div
                    style={{
                      border: "1px solid #2d765b",
                      background: "#0b2b27",
                      color: "#4ade80",
                      padding: "8px 11px",
                      borderRadius: "4px",
                      fontSize: "9px",
                      fontWeight: "800",
                      letterSpacing: "0.08em",
                    }}
                  >
                    GRAPHICAL METHOD
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "22px",
                    height: "500px",
                    background:
                      "radial-gradient(circle at 78% 20%, rgba(59,130,246,.08), transparent 28%), #07162f",
                    border: "1px solid #203e64",
                    borderRadius: "7px",
                    padding: "18px",
                    boxShadow: "inset 0 0 35px rgba(30,64,175,.08)",
                  }}
                >
                  <Line
                    data={createGraphData()}
                    options={graphOptions}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(4, minmax(0, 1fr))",
                    gap: "10px",
                    marginTop: "12px",
                  }}
                >
                  <GraphLegend
                    label="Constraint"
                    detail="Model boundary"
                    type="line"
                  />

                  <GraphLegend
                    label="Feasible Region"
                    detail="Valid solution area"
                    type="area"
                  />

                  <GraphLegend
                    label="Corner Points"
                    detail="Candidate solutions"
                    type="point"
                  />

                  <GraphLegend
                    label="Optimal Point"
                    detail="Selected solution"
                    type="optimal"
                  />
                </div>
              </section>
            )}
          </>
        )}

        {/* INFEASIBLE */}
        {result && result.status === "infeasible" && (
          <section
            style={{
              background: "#251b0d",
              border: "1px solid #6b4c20",
              borderRadius: "8px",
              padding: "25px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                color: "#fbbf24",
                fontSize: "10px",
                fontWeight: "800",
                letterSpacing: "0.12em",
                marginBottom: "8px",
              }}
            >
              SOLVER STATUS
            </div>

            <h3
              style={{
                margin: 0,
                color: "#f8fafc",
                fontSize: "22px",
              }}
            >
              No Feasible Solution
            </h3>

            <p
              style={{
                color: "#cbd5e1",
                fontSize: "13px",
                marginBottom: 0,
                marginTop: "9px",
              }}
            >
              {result.message}
            </p>
          </section>
        )}

        {/* FOOTER SYSTEM STATUS */}
        <div
          style={{
            marginTop: "35px",
            borderTop: "1px solid #1b3557",
            paddingTop: "17px",
            display: "flex",
            justifyContent: "space-between",
            gap: "15px",
            flexWrap: "wrap",
            color: "#475569",
            fontSize: "9px",
            fontWeight: "700",
            letterSpacing: "0.08em",
          }}
        >
          <span>OR SMART SOLVER / LPP ENGINE</span>
          <span>GRAPHICAL OPTIMIZATION SYSTEM</span>
          <span>STATUS: OPERATIONAL</span>
        </div>
      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function KpiCard({ label, value, detail, success = false }) {
  return (
    <div
      style={{
        background: "#0a1c3b",
        border: "1px solid #203e64",
        borderRadius: "7px",
        padding: "16px 18px",
        minHeight: "86px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "9px",
          fontWeight: "800",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "7px",
          color: success ? "#4ade80" : "#f8fafc",
          fontSize: "20px",
          fontWeight: "800",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#526985",
          fontSize: "9px",
          marginTop: "2px",
        }}
      >
        {detail}
      </div>
    </div>
  );
}

function ResultKpi({ label, value, highlight = false }) {
  return (
    <div
      style={{
        background: "#0a1c3b",
        border: highlight
          ? "1px solid #2d765b"
          : "1px solid #244b78",
        borderRadius: "7px",
        padding: "21px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "9px",
          fontWeight: "800",
          letterSpacing: "0.11em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: highlight ? "#4ade80" : "#60a5fa",
          fontSize: "31px",
          fontWeight: "800",
          marginTop: "8px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SummaryBlock({ label, value, description }) {
  return (
    <div
      style={{
        padding: "17px",
        background: "#091b38",
        border: "1px solid #1d385b",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "9px",
          fontWeight: "800",
          letterSpacing: "0.1em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#f8fafc",
          fontSize: "24px",
          fontWeight: "800",
          marginTop: "7px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#64748b",
          fontSize: "9px",
          lineHeight: 1.45,
          marginTop: "5px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

function GraphLegend({ label, detail, type }) {
  let indicator = {};

  if (type === "line") {
    indicator = {
      width: "22px",
      height: "4px",
      borderRadius: "2px",
      background:
        "linear-gradient(90deg, #38bdf8 0%, #a78bfa 34%, #f59e0b 67%, #f472b6 100%)",
      boxShadow: "0 0 8px rgba(125,211,252,.25)",
    };
  }

  if (type === "area") {
    indicator = {
      width: "18px",
      height: "12px",
      background: "rgba(34,197,94,.25)",
      border: "1px solid #22c55e",
    };
  }

  if (type === "point") {
    indicator = {
      width: "9px",
      height: "9px",
      borderRadius: "50%",
      background: "#60a5fa",
    };
  }

  if (type === "optimal") {
    indicator = {
      width: "11px",
      height: "11px",
      borderRadius: "50%",
      background: "#22c55e",
      boxShadow: "0 0 8px rgba(34,197,94,.5)",
    };
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        background: "#091b38",
        border: "1px solid #1b3557",
        borderRadius: "5px",
        padding: "10px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          flexShrink: 0,
          ...indicator,
        }}
      />

      <div>
        <div
          style={{
            color: "#cbd5e1",
            fontSize: "10px",
            fontWeight: "700",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#526985",
            fontSize: "8px",
            marginTop: "2px",
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ number, title, subtitle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "13px",
      }}
    >
      <div
        style={{
          minWidth: "34px",
          height: "34px",
          borderRadius: "5px",
          background: "#102c52",
          border: "1px solid #315f91",
          color: "#60a5fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: "800",
        }}
      >
        {number}
      </div>

      <div>
        <h2
          style={{
            margin: 0,
            color: "#f1f5f9",
            fontSize: "19px",
            fontWeight: "800",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "4px 0 0",
            color: "#64748b",
            fontSize: "11px",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function FieldBlock({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#7890aa",
          fontSize: "9px",
          fontWeight: "800",
          letterSpacing: "0.1em",
          marginBottom: "7px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const heroTagStyle = {
  border: "1px solid #315f91",
  background: "rgba(10,32,61,.75)",
  color: "#8db8df",
  borderRadius: "3px",
  padding: "6px 8px",
  fontSize: "8px",
  fontWeight: "800",
  letterSpacing: "0.09em",
};

const panelStyle = {
  background: "#0a1c3b",
  border: "1px solid #203e64",
  borderRadius: "8px",
  padding: "25px",
  marginBottom: "25px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  height: "46px",
  background: "#071832",
  color: "#e2e8f0",
  border: "1px solid #29496c",
  borderRadius: "5px",
  padding: "0 13px",
  outline: "none",
  fontSize: "13px",
};

const matrixInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  height: "40px",
  background: "#071832",
  color: "#e2e8f0",
  border: "1px solid #29496c",
  borderRadius: "4px",
  padding: "0 10px",
  outline: "none",
  fontSize: "12px",
};

const secondaryButtonStyle = {
  background: "#0d2749",
  border: "1px solid #35689a",
  color: "#7dd3fc",
  borderRadius: "5px",
  padding: "10px 14px",
  fontSize: "9px",
  fontWeight: "800",
  letterSpacing: "0.08em",
  cursor: "pointer",
};

const removeButtonStyle = {
  width: "100%",
  height: "40px",
  background: "#211725",
  border: "1px solid #613342",
  color: "#fb7185",
  borderRadius: "4px",
  fontSize: "9px",
  fontWeight: "800",
  letterSpacing: "0.06em",
};

const solveButtonStyle = {
  border: "1px solid #3984d4",
  background:
    "linear-gradient(135deg, #1769aa, #1677bd)",
  color: "#ffffff",
  borderRadius: "5px",
  padding: "13px 20px",
  minWidth: "205px",
  fontSize: "10px",
  fontWeight: "800",
  letterSpacing: "0.1em",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(14,116,214,.16)",
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "10px 9px",
  color: "#64748b",
  borderBottom: "1px solid #203e64",
  fontSize: "8px",
  fontWeight: "800",
  letterSpacing: "0.1em",
};

const tableCellStyle = {
  padding: "13px 9px",
  borderBottom: "1px solid #1b3557",
  color: "#cbd5e1",
  fontSize: "12px",
};

export default LinearProgramming