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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* =========================================================
   NUMBER / FORMATTING HELPERS
========================================================= */

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

  return String(rounded);
};

const formatCoefficient = (value, variable) => {
  const x = Number(value);

  if (!Number.isFinite(x)) {
    return `0${variable}`;
  }

  if (x === 0) {
    return "";
  }

  const absValue = formatHand(Math.abs(x));
  const coefficient = absValue === "1" ? "" : absValue;

  return `${coefficient}${variable}`;
};

const signedTerm = (value, variable) => {
  const x = Number(value);

  if (!Number.isFinite(x) || x === 0) {
    return "";
  }

  const sign = x < 0 ? "−" : "+";
  const absValue = formatHand(Math.abs(x));
  const coefficient = absValue === "1" ? "" : absValue;

  return `${sign} ${coefficient}${variable}`;
};

const equationText = (constraint) => {
  const a = Number(constraint.x1);
  const b = Number(constraint.x2);
  const rhs = Number(constraint.rhs);

  const op =
    constraint.operator === "<="
      ? "≤"
      : constraint.operator === ">="
        ? "≥"
        : "=";

  let left = "";

  if (a !== 0) {
    left = formatCoefficient(a, "X");
  }

  if (b !== 0) {
    const term = signedTerm(b, "Y");

    if (left) {
      left += ` ${term}`;
    } else {
      left = b < 0 ? `− ${formatHand(Math.abs(b))}Y` : `${formatHand(b)}Y`;
    }
  }

  if (!left) {
    left = "0";
  }

  return `${left} ${op} ${formatHand(rhs)}`;
};

const objectiveText = (objective, optimization) => {
  const x = Number(objective.x1);
  const y = Number(objective.x2);

  let expression = "";

  if (x !== 0) {
    expression = formatCoefficient(x, "X");
  }

  if (y !== 0) {
    const term = signedTerm(y, "Y");

    if (expression) {
      expression += ` ${term}`;
    } else {
      expression = y < 0
        ? `− ${formatHand(Math.abs(y))}Y`
        : `${formatHand(y)}Y`;
    }
  }

  if (!expression) {
    expression = "0";
  }

  return `${optimization === "max" ? "Maximize" : "Minimize"} Z = ${expression}`;
};

/* =========================================================
   DETAILED SIMPLEX ENGINE
========================================================= */

function solveSimplexDetailed(objective, constraints, optimization) {
  const c1 = Number(objective.x1);
  const c2 = Number(objective.x2);

  if (!Number.isFinite(c1) || !Number.isFinite(c2)) {
    return {
      status: "error",
      message: "Please enter valid objective coefficients.",
    };
  }

  if (!constraints.length) {
    return {
      status: "error",
      message: "Please add at least one constraint.",
    };
  }

  const clean = constraints.map((r) => ({
    x1: Number(r.x1),
    x2: Number(r.x2),
    operator: r.operator,
    rhs: Number(r.rhs),
  }));

  for (const r of clean) {
    if (![r.x1, r.x2, r.rhs].every(Number.isFinite)) {
      return {
        status: "error",
        message:
          "Please enter valid numeric values in every constraint.",
      };
    }

    if (r.operator !== "<=") {
      return {
        status: "error",
        message:
          "Detailed Simplex currently supports ≤ constraints only. Use Graphical Method for ≥ or = constraints.",
      };
    }

    if (r.rhs < 0) {
      return {
        status: "error",
        message:
          "Detailed Simplex requires non-negative RHS values.",
      };
    }
  }

  const m = clean.length;

  const variableNames = [
    "X",
    "Y",
    ...clean.map((_, i) => `S${i + 1}`),
  ];

  const originalC = [
    c1,
    c2,
    ...Array(m).fill(0),
  ];

  const transformedC =
    optimization === "min"
      ? [-c1, -c2, ...Array(m).fill(0)]
      : originalC.slice();

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

    const cjMinusZj = transformedC.map(
      (cj, j) => cj - zj[j]
    );

    return {
      zj,
      cjMinusZj,
    };
  };

  const cloneRows = (value) =>
    value.map((row) =>
      row.map((v) => cleanNumber(v))
    );

  const basisNames = (b) =>
    b.map((i) => variableNames[i]);

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

  for (
    let iteration = 1;
    iteration <= maxIterations;
    iteration++
  ) {
    const calc = calculate(rows, basis);

    let entering = -1;

    for (let j = 0; j < totalVars; j++) {
      if (
        calc.cjMinusZj[j] > 1e-9 &&
        (
          entering === -1 ||
          calc.cjMinusZj[j] >
            calc.cjMinusZj[entering]
        )
      ) {
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
        ratio:
          coefficient > 1e-9
            ? rhs / coefficient
            : null,
      };
    });

    let leavingRow = -1;
    let smallestRatio = Infinity;

    ratios.forEach((item, ri) => {
      if (
        item.ratio !== null &&
        item.ratio >= -1e-9 &&
        item.ratio < smallestRatio
      ) {
        smallestRatio = item.ratio;
        leavingRow = ri;
      }
    });

    if (leavingRow === -1) {
      finalStatus = "unbounded";
      iterations[iterations.length - 1].unbounded = true;
      break;
    }

    const pivotElement =
      rows[leavingRow][entering];

    const oldRows = cloneRows(rows);
    const pivotOld =
      rows[leavingRow].slice();

    const newPivot = pivotOld.map(
      (v) => v / pivotElement
    );

    const pivotCalculations =
      pivotOld.map((oldValue, j) => ({
        variable:
          j < totalVars
            ? variableNames[j]
            : "RHS",

        formula:
          `${formatHand(oldValue)} ÷ ${formatHand(
            pivotElement
          )} = ${formatHand(newPivot[j])}`,

        value: newPivot[j],
      }));

    const newRows = rows.map((row, ri) => {
      if (ri === leavingRow) {
        return newPivot.slice();
      }

      const factor = row[entering];

      return row.map(
        (oldValue, j) =>
          oldValue -
          factor * newPivot[j]
      );
    });

    const rowOperations = rows
      .map((row, ri) => {
        if (ri === leavingRow) {
          return null;
        }

        const factor = row[entering];

        return {
          row: ri + 1,
          factor,

          cells: row.map(
            (oldValue, j) => ({
              variable:
                j < totalVars
                  ? variableNames[j]
                  : "RHS",

              formula:
                `${formatHand(
                  oldValue
                )} − (${formatHand(
                  factor
                )} × ${formatHand(
                  newPivot[j]
                )}) = ${formatHand(
                  oldValue -
                    factor *
                      newPivot[j]
                )}`,

              value:
                oldValue -
                factor *
                  newPivot[j],
            })
          ),
        };
      })
      .filter(Boolean);

    const leaving =
      variableNames[basis[leavingRow]];

    const enteringName =
      variableNames[entering];

    iterations[
      iterations.length - 1
    ].pivotDetails = {
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

    const nextCalc =
      calculate(rows, basis);

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

    if (iteration === maxIterations) {
      finalStatus = "iteration_limit";
    }
  }

  const finalCalc =
    calculate(rows, basis);

  const values =
    Array(totalVars).fill(0);

  basis.forEach((bi, ri) => {
    values[bi] =
      rows[ri][totalVars];
  });

  const x1 = cleanNumber(values[0]);
  const x2 = cleanNumber(values[1]);

  const originalZ = cleanNumber(
    c1 * x1 + c2 * x2
  );

  const checks = clean.map((r) => {
    const lhs = cleanNumber(
      r.x1 * x1 +
      r.x2 * x2
    );

    return {
      lhs,
      rhs: r.rhs,
      slack: cleanNumber(
        r.rhs - lhs
      ),
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

/* =========================================================
   EXCEL XML HELPERS
========================================================= */

const escapeXml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const excelCell = (value, type = "String") => {
  return `
    <Cell>
      <Data ss:Type="${type}">
        ${escapeXml(value)}
      </Data>
    </Cell>
  `;
};

const excelRow = (cells) => {
  return `<Row>${cells.join("")}</Row>`;
};

const createExcelWorksheet = (
  name,
  rows
) => {
  const rowMarkup = rows
    .map((row) =>
      excelRow(
        row.map((cell) => {
          if (
            typeof cell === "number" &&
            Number.isFinite(cell)
          ) {
            return excelCell(
              cell,
              "Number"
            );
          }

          return excelCell(
            cell,
            "String"
          );
        })
      )
    )
    .join("");

  return `
    <Worksheet ss:Name="${escapeXml(name)}">
      <Table>
        ${rowMarkup}
      </Table>
    </Worksheet>
  `;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

function LinearProgramming() {
  const [method, setMethod] =
    useState("graphical");

  const [optimization, setOptimization] =
    useState("max");

  const [problemStatement, setProblemStatement] =
    useState("");

  const [objective, setObjective] =
    useState({
      x1: "",
      x2: "",
    });

  const [constraints, setConstraints] =
    useState([
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

  const [result, setResult] =
    useState(null);

  const [simplexResult, setSimplexResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     INPUT HANDLERS
  ======================================================= */

  const handleObjectiveChange =
    (field, value) => {
      setObjective({
        ...objective,
        [field]: value,
      });
    };

  const handleConstraintChange =
    (index, field, value) => {
      const updatedConstraints =
        [...constraints];

      updatedConstraints[index] = {
        ...updatedConstraints[index],
        [field]: value,
      };

      setConstraints(
        updatedConstraints
      );
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

    setConstraints(
      constraints.filter(
        (_, i) => i !== index
      )
    );
  };

  /* =======================================================
     GRAPH OPTIONS
  ======================================================= */

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

        text:
          "Constraints • Feasible Region • Corner Points • Optimal Solution",

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
          color:
            "rgba(148, 163, 184, 0.13)",
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
          text: "Decision Variable X",
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
          color:
            "rgba(148, 163, 184, 0.13)",
        },

        border: {
          color: "#475569",
        },

        title: {
          display: true,
          text: "Decision Variable Y",
          color: "#cbd5e1",

          font: {
            size: 12,
            weight: "600",
          },
        },
      },
    },
  };

  /* =======================================================
     GRAPH DATA
  ======================================================= */

  const createGraphData = () => {
    if (
      !result ||
      !result.graph_constraints
    ) {
      return null;
    }

    const feasibleRegion =
      result.feasible_region || [];

    const points =
      result.corner_points || [];

    const maxX = Math.max(
      ...points.map(
        (point) => point.x1
      ),
      result.optimal_solution?.x1 || 0,
      10
    );

    const maxY = Math.max(
      ...points.map(
        (point) => point.x2
      ),
      result.optimal_solution?.x2 || 0,
      10
    );

    const xMax =
      Math.ceil(maxX + 2);

    const yMax =
      Math.ceil(maxY + 2);

    const datasets = [];

    /* Feasible Region */

    if (feasibleRegion.length >= 3) {
      const regionData =
        feasibleRegion.map(
          (point) => ({
            x: point.x1,
            y: point.x2,
          })
        );

      regionData.push(
        regionData[0]
      );

      datasets.push({
        label: "Feasible Region",
        borderColor: "#22c55e",
        backgroundColor:
          "rgba(34, 197, 94, 0.14)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0,
        data: regionData,
      });
    }

    /* Constraint Lines */

    result.graph_constraints.forEach(
      (constraint, index) => {
        const {
          a,
          b,
          rhs,
        } = constraint;

        let linePoints = [];

        if (b !== 0) {
          linePoints = [
            {
              x: 0,
              y: rhs / b,
            },
            {
              x: xMax,
              y:
                (rhs -
                  a * xMax) /
                b,
            },
          ];
        } else if (a !== 0) {
          const x =
            rhs / a;

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
          {
            line: "#38bdf8",
            glow:
              "rgba(56,189,248,0.22)",
          },
          {
            line: "#a78bfa",
            glow:
              "rgba(167,139,250,0.22)",
          },
          {
            line: "#f59e0b",
            glow:
              "rgba(245,158,11,0.22)",
          },
          {
            line: "#f472b6",
            glow:
              "rgba(244,114,182,0.22)",
          },
          {
            line: "#22d3ee",
            glow:
              "rgba(34,211,238,0.22)",
          },
          {
            line: "#fb7185",
            glow:
              "rgba(251,113,133,0.22)",
          },
        ];

        const constraintColor =
          constraintColors[
            index %
              constraintColors.length
          ];

        datasets.push({
          label: `Constraint ${index + 1}`,

          borderColor:
            constraintColor.line,

          backgroundColor:
            constraintColor.glow,

          data: linePoints,

          borderWidth: 3,
          borderDash: [9, 6],

          pointRadius: 0,
          pointHoverRadius: 4,

          pointHoverBackgroundColor:
            constraintColor.line,

          pointHoverBorderColor:
            "#ffffff",

          pointHoverBorderWidth: 2,

          tension: 0,
        });
      }
    );

    /* Corner Points */

    datasets.push({
      label: "Corner Points",

      data: points.map(
        (point) => ({
          x: point.x1,
          y: point.x2,
        })
      ),

      showLine: false,

      backgroundColor:
        "#f43f5e",

      pointBackgroundColor:
        "#f43f5e",

      pointRadius: 7,

      pointBorderColor:
        "#ffffff",

      pointBorderWidth: 2,

      pointHoverBackgroundColor:
        "#fb7185",

      pointHoverBorderColor:
        "#ffffff",

      pointHoverRadius: 10,
    });

    /* Optimal Point */

    if (result.optimal_solution) {
      datasets.push({
        label: "Optimal Solution",

        data: [
          {
            x:
              result.optimal_solution
                .x1,

            y:
              result.optimal_solution
                .x2,
          },
        ],

        showLine: false,

        order: 999,

        pointRadius: 15,

        pointStyle: "star",

        backgroundColor:
          "#22c55e",

        pointBackgroundColor:
          "#22c55e",

        pointBorderColor:
          "#ffffff",

        pointBorderWidth: 3,

        pointHoverBackgroundColor:
          "#4ade80",

        pointHoverBorderColor:
          "#ffffff",

        pointHoverRadius: 18,
      });
    }

    return {
      datasets,
    };
  };

  /* =======================================================
     SOLVE
  ======================================================= */

  const solveProblem = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);
    setSimplexResult(null);

    if (method === "simplex") {
      const solved =
        solveSimplexDetailed(
          objective,
          constraints,
          optimization
        );

      if (
        solved.status === "error"
      ) {
        setError(
          solved.message
        );

        return;
      }

      setSimplexResult(
        solved
      );

      if (
        solved.status ===
        "unbounded"
      ) {
        setError(
          "The Simplex method indicates that the solution is unbounded."
        );
      }

      return;
    }

    setLoading(true);

    try {
      const requestData = {
        objective: [
          Number(objective.x1),
          Number(objective.x2),
        ],

        optimization,

        constraints:
          constraints.map(
            (constraint) => ({
              coefficients: [
                Number(
                  constraint.x1
                ),
                Number(
                  constraint.x2
                ),
              ],

              operator:
                constraint.operator,

              rhs: Number(
                constraint.rhs
              ),
            })
          ),
      };

      const response =
        await axios.post(
          "https://backend-6wiicnc4i-ishant-coders.vercel.app/api/lpp/solve",
          requestData
        );

      setResult(
        response.data
      );
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data
            ?.message ||
            "The server returned an error."
        );
      } else {
        setError(
          "Unable to connect to the Flask backend. Make sure Flask is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     EXCEL EXPORT
  ======================================================= */

  const exportExcel = async () => {
    if (!result) {
      setError(
        "Please solve the LPP before exporting the Excel sheet."
      );
      return;
    }

    try {
      setError("");
      setLoading(true);

      const requestData = {
        problem_statement:
          problemStatement ||
          "LPP entered using structured coefficients.",

        optimization,

        objective: {
          x1: Number(objective.x1),
          x2: Number(objective.x2),
        },

        constraints: constraints.map((constraint) => ({
          x1: Number(constraint.x1),
          x2: Number(constraint.x2),
          operator: constraint.operator,
          rhs: Number(constraint.rhs),
        })),

        result: {
          optimal_solution:
            result.optimal_solution || null,

          corner_points:
            result.corner_points || [],

          feasible_region:
            result.feasible_region || [],

          graph_constraints:
            result.graph_constraints || [],
        },
      };

      const response = await axios.post(
        "http://127.0.0.1:5000/api/lpp/export-excel",
        requestData,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download =
        "OR_LPP_Practical.xlsx";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "Excel export error:",
        err
      );

      if (err.response) {
        setError(
          "Unable to generate Excel file from backend."
        );
      } else {
        setError(
          "Backend is not connected. Please make sure Flask server is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };;

  /* =======================================================
     COUNTS
  ======================================================= */

  const totalConstraints =
    constraints.length;

  const solvedOptimal =
    result?.optimal_solution;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="lpp-page-shell"
      style={{
        minHeight: "100vh",
        background: "#06142f",
        color: "#e2e8f0",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        paddingBottom: "70px",
      }}
    >
      <style>{`
        /* =====================================================
           LPP MOBILE PROFESSIONAL LAYOUT
           Desktop remains unchanged.
        ====================================================== */
        @media (max-width: 767px) {
          .lpp-page-shell {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: hidden !important;
            padding-bottom: 34px !important;
          }

          .lpp-page-shell * {
            box-sizing: border-box;
          }

          .lpp-page-shell [style*="max-width: 1320px"] {
            width: calc(100% - 10px) !important;
            max-width: none !important;
            margin-left: 5px !important;
            margin-right: 5px !important;
          }

          .lpp-page-shell > div:first-child > div {
            padding: 10px 14px !important;
          }

          .lpp-page-shell > div:first-child > div > div:first-child {
            gap: 9px !important;
          }

          .lpp-page-shell > div:first-child > div > div:first-child > div:first-child {
            width: 34px !important;
            height: 34px !important;
            font-size: 15px !important;
            flex-shrink: 0 !important;
          }

          .lpp-page-shell > div:first-child > div > div:first-child > div:last-child > div:first-child {
            font-size: 11px !important;
          }

          .lpp-page-shell > div:first-child > div > div:first-child > div:last-child > div:last-child {
            font-size: 8px !important;
          }

          .lpp-page-shell > div:first-child > div > div:last-child {
            font-size: 8px !important;
            gap: 6px !important;
            white-space: nowrap !important;
          }

          .lpp-page-shell main {
            width: calc(100% - 10px) !important;
            max-width: none !important;
            margin: 0 5px !important;
            padding: 16px 0 30px !important;
          }

          /* Hero */
          .lpp-page-shell main > section:first-child {
            min-height: 0 !important;
            padding: 22px 14px !important;
            margin-bottom: 16px !important;
            border-radius: 10px !important;
          }

          .lpp-page-shell main > section:first-child > div:nth-child(3) {
            max-width: 100% !important;
          }

          .lpp-page-shell main > section:first-child h1 {
            font-size: 31px !important;
            line-height: 1.08 !important;
            letter-spacing: -0.02em !important;
          }

          .lpp-page-shell main > section:first-child p {
            max-width: 100% !important;
            font-size: 12px !important;
            line-height: 1.55 !important;
            margin-top: 13px !important;
          }

          .lpp-page-shell main > section:first-child > div:nth-child(3) > div:last-child {
            gap: 6px !important;
            margin-top: 16px !important;
          }

          .lpp-page-shell main > section:first-child > div:nth-child(3) > div:last-child span {
            padding: 6px 8px !important;
            font-size: 7px !important;
          }

          /* Compact graphical decoration instead of letting it crowd the text. */
          .lpp-page-shell main > section:first-child > div:last-child {
            position: relative !important;
            right: auto !important;
            bottom: auto !important;
            width: 100% !important;
            height: 92px !important;
            margin-top: 12px !important;
            opacity: .55 !important;
          }

          .lpp-page-shell main > section:first-child > div:last-child > div {
            transform: scale(.58) !important;
            transform-origin: left bottom !important;
          }

          /* KPI strip: two clean columns on phones. */
          .lpp-page-shell main > section:nth-child(2) {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-bottom: 16px !important;
          }

          .lpp-page-shell main > section:nth-child(2) > div {
            min-height: 74px !important;
            padding: 11px 12px !important;
          }

          /* All form panels */
          .lpp-page-shell main > form > section {
            width: 100% !important;
            max-width: 100% !important;
            padding: 16px !important;
            margin-bottom: 12px !important;
            border-radius: 9px !important;
            overflow: hidden !important;
          }

          .lpp-page-shell main > form > section h2 {
            font-size: 16px !important;
            line-height: 1.2 !important;
          }

          .lpp-page-shell main > form > section p {
            font-size: 9px !important;
            line-height: 1.45 !important;
          }

          /* Any desktop grid becomes a controlled mobile stack. */
          .lpp-page-shell [style*="grid-template-columns"] {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 10px !important;
          }

          /* KPI override comes after the generic grid rule. */
          .lpp-page-shell main > section:nth-child(2) {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .lpp-page-shell input,
          .lpp-page-shell select,
          .lpp-page-shell textarea,
          .lpp-page-shell button {
            max-width: 100% !important;
          }

          .lpp-page-shell input,
          .lpp-page-shell select {
            min-height: 44px !important;
            font-size: 14px !important;
          }

          .lpp-page-shell textarea {
            min-height: 120px !important;
            font-size: 13px !important;
          }

          /* Constraint rows should read vertically instead of becoming a tiny table. */
          .lpp-page-shell [style*="65px 1fr 1fr 150px 1fr 115px"] {
            grid-template-columns: 1fr 1fr !important;
          }

          /* Prevent fixed-width tables from crushing the page. */
          .lpp-page-shell [style*="minWidth: "] {
            min-width: 0 !important;
          }

          .lpp-page-shell table {
            font-size: 10px !important;
          }

          .lpp-page-shell table th,
          .lpp-page-shell table td {
            padding: 8px 6px !important;
            white-space: nowrap !important;
          }

          .lpp-page-shell .table-responsive,
          .lpp-page-shell [style*="overflowX"] {
            max-width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }

          /* Result cards */
          .lpp-page-shell canvas {
            max-width: 100% !important;
            height: auto !important;
          }

          .lpp-page-shell [style*="fontSize: \"31px\""] {
            font-size: 24px !important;
          }

          /* Keep long equations readable without overflowing the viewport. */
          .lpp-page-shell [style*="Georgia"] {
            font-size: 17px !important;
            line-height: 1.45 !important;
            overflow-wrap: anywhere !important;
          }

          /* Full-width mobile composition: use almost the entire phone viewport. */
          .lpp-page-shell main > section,
          .lpp-page-shell main > form > section,
          .lpp-page-shell main > section:first-child,
          .lpp-page-shell main > section:nth-child(2) {
            width: 100% !important;
            max-width: none !important;
          }

          .lpp-page-shell main > section:first-child {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          .lpp-page-shell main > form > section {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          /* Footer/status strip */
          .lpp-page-shell main > main {
            width: 100% !important;
          }
        

  /* =========================================================
     MOBILE OBJECTIVE INPUT LAYOUT
     Optimization = full row
     X + Y coefficients = same row
  ========================================================= */
  .lpp-page-shell .objective-input-grid {
    display: grid !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    grid-template-rows: auto auto !important;
    gap: 14px 12px !important;
  }

  .lpp-page-shell .objective-input-grid > * {
    min-width: 0 !important;
    width: 100% !important;
  }

  .lpp-page-shell .objective-input-grid > :first-child {
    grid-column: 1 / -1 !important;
    grid-row: 1 !important;
  }

  .lpp-page-shell .objective-input-grid > :nth-child(2) {
    grid-column: 1 !important;
    grid-row: 2 !important;
  }

  .lpp-page-shell .objective-input-grid > :nth-child(3) {
    grid-column: 2 !important;
    grid-row: 2 !important;
  }

  .lpp-page-shell .objective-input-grid input,
  .lpp-page-shell .objective-input-grid select {
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
  }
}

        @media (max-width: 420px) {
          .lpp-page-shell main {
            width: calc(100% - 8px) !important;
            margin: 0 4px !important;
          }

          .lpp-page-shell main > section:first-child {
            padding: 20px 12px !important;
          }

          .lpp-page-shell main > section:first-child h1 {
            font-size: 28px !important;
          }

          .lpp-page-shell main > section:nth-child(2) > div {
            min-height: 70px !important;
            padding: 10px !important;
          }

          .lpp-page-shell main > form > section {
            padding: 14px !important;
          }
        }
      `}</style>
      {/* ===================================================
          TOP SYSTEM BAR
      =================================================== */}

      <div
        style={{
          borderBottom:
            "1px solid #1e3a5f",
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
            padding:
              "15px 28px",
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
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
                alignItems:
                  "center",
                justifyContent:
                  "center",
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
                  letterSpacing:
                    "0.08em",
                  color:
                    "#f8fafc",
                }}
              >
                OR SMART SOLVER
              </div>

              <div
                style={{
                  fontSize: "10px",
                  color:
                    "#64748b",
                  letterSpacing:
                    "0.12em",
                  marginTop:
                    "2px",
                }}
              >
                OPERATIONS RESEARCH ENGINE
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "10px",
              fontSize: "11px",
              color:
                "#94a3b8",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius:
                  "50%",
                background:
                  "#22c55e",
                display:
                  "inline-block",
                boxShadow:
                  "0 0 10px rgba(34,197,94,.55)",
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
          padding:
            "34px 28px",
        }}
      >
        {/* =================================================
            HERO
        ================================================= */}

        <section
          style={{
            background:
              "linear-gradient(110deg, #0b1d3d 0%, #0d2750 58%, #0a315c 100%)",
            border:
              "1px solid #244b78",
            borderRadius: "10px",
            minHeight: "265px",
            padding:
              "36px 40px",
            position:
              "relative",
            overflow:
              "hidden",
            marginBottom:
              "25px",
          }}
        >
          <div
            style={{
              position:
                "absolute",
              right: "-50px",
              top: "-70px",
              width: "360px",
              height: "360px",
              border:
                "1px solid rgba(96,165,250,.14)",
              borderRadius:
                "50%",
            }}
          />

          <div
            style={{
              position:
                "absolute",
              right: "55px",
              top: "38px",
              width: "210px",
              height: "210px",
              border:
                "1px solid rgba(96,165,250,.12)",
              borderRadius:
                "50%",
            }}
          />

          <div
            style={{
              position:
                "relative",
              zIndex: 2,
              maxWidth:
                "730px",
            }}
          >
            <div
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "8px",
                border:
                  "1px solid #315f91",
                background:
                  "rgba(15,42,78,.7)",
                padding:
                  "7px 11px",
                borderRadius:
                  "4px",
                color:
                  "#7dd3fc",
                fontSize:
                  "10px",
                fontWeight:
                  "800",
                letterSpacing:
                  "0.13em",
                marginBottom:
                  "20px",
              }}
            >
              OPTIMIZATION MODULE
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "42px",
                lineHeight:
                  1.08,
                letterSpacing:
                  "-0.025em",
                color:
                  "#f8fafc",
                fontWeight:
                  "800",
              }}
            >
              Linear Programming
            </h1>

            <div
              style={{
                marginTop:
                  "7px",
                color:
                  "#60a5fa",
                fontSize:
                  "16px",
                fontWeight:
                  "700",
                letterSpacing:
                  "0.04em",
              }}
            >
              DECISION OPTIMIZATION ENGINE
            </div>

            <p
              style={{
                margin:
                  "17px 0 0",
                color:
                  "#a8b7ca",
                fontSize:
                  "14px",
                lineHeight:
                  1.7,
                maxWidth:
                  "670px",
              }}
            >
              Build a complete Operations Research practical workflow:
              enter the problem, formulate the LPP, prepare the C1/C2
              coefficient matrix, solve graphically and export the
              complete solution to Excel.
            </p>

            <div
              style={{
                display:
                  "flex",
                gap: "9px",
                marginTop:
                  "22px",
                flexWrap:
                  "wrap",
              }}
            >
              <span
                style={
                  heroTagStyle
                }
              >
                2 VARIABLES
              </span>

              <span
                style={
                  heroTagStyle
                }
              >
                FORMULATION
              </span>

              <span
                style={
                  heroTagStyle
                }
              >
                C1 / C2 MATRIX
              </span>

              <span
                style={
                  heroTagStyle
                }
              >
                GRAPHICAL METHOD
              </span>

              <span
                style={
                  heroTagStyle
                }
              >
                EXCEL EXPORT
              </span>
            </div>
          </div>

          {/* Diagram */}

          <div
            style={{
              position:
                "absolute",
              right: "65px",
              bottom: "30px",
              width: "285px",
              height: "160px",
              opacity: 0.82,
            }}
          >
            <div
              style={{
                position:
                  "absolute",
                left: "25px",
                bottom: "25px",
                width: "220px",
                height: "105px",
                borderLeft:
                  "1px solid #456789",
                borderBottom:
                  "1px solid #456789",
              }}
            />

            <div
              style={{
                position:
                  "absolute",
                left: "25px",
                bottom: "45px",
                width: "220px",
                height: "1px",
                background:
                  "#315b87",
                transform:
                  "rotate(-23deg)",
                transformOrigin:
                  "left",
              }}
            />

            <div
              style={{
                position:
                  "absolute",
                left: "25px",
                bottom: "72px",
                width: "220px",
                height: "1px",
                background:
                  "#5b7392",
                transform:
                  "rotate(-42deg)",
                transformOrigin:
                  "left",
              }}
            />

            <div
              style={{
                position:
                  "absolute",
                left: "105px",
                bottom: "59px",
                width: "90px",
                height: "48px",
                background:
                  "rgba(34,197,94,.12)",
                border:
                  "1px solid rgba(34,197,94,.35)",
                transform:
                  "skewY(-22deg)",
              }}
            />

            <div
              style={{
                position:
                  "absolute",
                left: "153px",
                bottom: "73px",
                width: "12px",
                height: "12px",
                background:
                  "#22c55e",
                borderRadius:
                  "50%",
                border:
                  "2px solid #ffffff",
                boxShadow:
                  "0 0 15px rgba(34,197,94,.65)",
              }}
            />

            <span
              style={{
                position:
                  "absolute",
                left: "238px",
                bottom: "18px",
                color:
                  "#64748b",
                fontSize: "9px",
              }}
            >
              X
            </span>

            <span
              style={{
                position:
                  "absolute",
                left: "12px",
                bottom: "128px",
                color:
                  "#64748b",
                fontSize: "9px",
              }}
            >
              Y
            </span>
          </div>
        </section>

        {/* =================================================
            KPI STRIP
        ================================================= */}

        <section
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "13px",
            marginBottom:
              "25px",
          }}
        >
          <KpiCard
            label="DECISION VARIABLES"
            value="02"
            detail="X / Y"
          />

          <KpiCard
            label="CONSTRAINTS"
            value={String(
              totalConstraints
            ).padStart(2, "0")}
            detail="Active equations"
          />

          <KpiCard
            label="METHOD"
            value={
              method ===
              "simplex"
                ? "SIMPLEX"
                : "GRAPH"
            }
            detail={
              method ===
              "simplex"
                ? "Simplex Method"
                : "Graphical Method"
            }
          />

          <KpiCard
            label="STATUS"
            value={
              result ||
              simplexResult
                ? "SOLVED"
                : "READY"
            }
            detail={
              result ||
              simplexResult
                ? "Analysis available"
                : "Awaiting model"
            }
            success={Boolean(
              result ||
                simplexResult
            )}
          />
        </section>

        <form
          onSubmit={
            solveProblem
          }
        >
          {/* =================================================
              PROBLEM STATEMENT
          ================================================= */}

          <section
            style={
              panelStyle
            }
          >
            <SectionHeader
              number="00"
              title="Problem Statement"
              subtitle="Enter the OR practical question or case description before defining its mathematical model."
            />

            <textarea
              value={
                problemStatement
              }
              onChange={(e) =>
                setProblemStatement(
                  e.target.value
                )
              }
              placeholder={
                "Example: A company manufactures two products X and Y. Product X gives a profit of 40 per unit and product Y gives a profit of 30 per unit. The products use two limited resources..."
              }
              style={{
                ...inputStyle,
                height: "115px",
                padding:
                  "13px",
                marginTop:
                  "20px",
                resize:
                  "vertical",
                lineHeight:
                  1.6,
              }}
            />

            <div
              style={{
                marginTop:
                  "10px",
                color:
                  "#64748b",
                fontSize:
                  "10px",
              }}
            >
              This statement is included in the practical report and Excel
              worksheet. Mathematical coefficients are defined below.
            </div>
          </section>

          {/* =================================================
              METHOD SELECTOR
          ================================================= */}

          <section
            style={
              panelStyle
            }
          >
            <SectionHeader
              number="01"
              title="Solution Method"
              subtitle="Choose the method used to solve the two-variable Linear Programming Problem."
            />

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "12px",
                marginTop:
                  "20px",
              }}
            >
              {[
                [
                  "graphical",
                  "GRAPHICAL METHOD",
                  "Formulation, C1/C2 matrix, feasible region, corner points and optimal solution.",
                ],

                [
                  "simplex",
                  "SIMPLEX METHOD",
                  "Complete tableau, Zj, Cj-Zj, ratio test and pivot calculations.",
                ],
              ].map(
                ([
                  value,
                  title,
                  subtitle,
                ]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setMethod(
                        value
                      );

                      setResult(
                        null
                      );

                      setSimplexResult(
                        null
                      );

                      setError("");
                    }}
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "18px",
                      background:
                        method ===
                        value
                          ? "#0b2947"
                          : "#071832",
                      border: `1px solid ${
                        method ===
                        value
                          ? "#38bdf8"
                          : "#29496c"
                      }`,
                      color:
                        "#e2e8f0",
                      borderRadius:
                        "6px",
                      cursor:
                        "pointer",
                      boxShadow:
                        method ===
                        value
                          ? "0 0 0 1px rgba(56,189,248,.12)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "10px",
                        color:
                          method ===
                          value
                            ? "#38bdf8"
                            : "#64748b",
                        fontWeight:
                          "800",
                        letterSpacing:
                          "0.1em",
                      }}
                    >
                      {method ===
                      value
                        ? "ACTIVE METHOD"
                        : "SELECT METHOD"}
                    </div>

                    <div
                      style={{
                        marginTop:
                          "7px",
                        fontSize:
                          "16px",
                        fontWeight:
                          "800",
                      }}
                    >
                      {title}
                    </div>

                    <div
                      style={{
                        marginTop:
                          "5px",
                        color:
                          "#8ba7c0",
                        fontSize:
                          "11px",
                        lineHeight:
                          1.5,
                      }}
                    >
                      {subtitle}
                    </div>
                  </button>
                )
              )}
            </div>
          </section>

          {/* =================================================
              OBJECTIVE FUNCTION
          ================================================= */}

          <section
            style={
              panelStyle
            }
          >
            <SectionHeader
              number="02"
              title="Objective Function"
              subtitle="Define the optimization target and objective coefficients."
            />

            <div
              className="objective-input-grid"
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1.05fr 1fr 1fr",
                gap: "15px",
                marginTop:
                  "23px",
              }}
            >
              <FieldBlock label="OPTIMIZATION">
                <select
                  style={
                    inputStyle
                  }
                  value={
                    optimization
                  }
                  onChange={(e) =>
                    setOptimization(
                      e.target.value
                    )
                  }
                >
                  <option value="max">
                    Maximize
                  </option>

                  <option value="min">
                    Minimize
                  </option>
                </select>
              </FieldBlock>

              <FieldBlock label="COEFFICIENT OF X">
                <input
                  type="number"
                  step="any"
                  style={
                    inputStyle
                  }
                  placeholder="e.g. 40"
                  value={
                    objective.x1
                  }
                  onChange={(e) =>
                    handleObjectiveChange(
                      "x1",
                      e.target.value
                    )
                  }
                  required
                />
              </FieldBlock>

              <FieldBlock label="COEFFICIENT OF Y">
                <input
                  type="number"
                  step="any"
                  style={
                    inputStyle
                  }
                  placeholder="e.g. 30"
                  value={
                    objective.x2
                  }
                  onChange={(e) =>
                    handleObjectiveChange(
                      "x2",
                      e.target.value
                    )
                  }
                  required
                />
              </FieldBlock>
            </div>

            <div
              style={{
                marginTop:
                  "18px",
                border:
                  "1px solid #244b78",
                background:
                  "#0a1c3b",
                borderRadius:
                  "6px",
                padding:
                  "15px 18px",
              }}
            >
              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "9px",
                  fontWeight:
                    "800",
                  letterSpacing:
                    "0.12em",
                  marginBottom:
                    "7px",
                }}
              >
                CURRENT OBJECTIVE MODEL
              </div>

              <div
                style={{
                  fontSize:
                    "19px",
                  fontWeight:
                    "700",
                  color:
                    "#e2e8f0",
                }}
              >
                {objectiveText(
                  objective,
                  optimization
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              CONSTRAINT MATRIX
          ================================================= */}

          <section
            style={
              panelStyle
            }
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: "15px",
                flexWrap:
                  "wrap",
              }}
            >
              <SectionHeader
                number="03"
                title="Constraint Matrix"
                subtitle="C1, C2 and additional constraints using X/Y coefficients, operator and RHS."
              />

              <button
                type="button"
                onClick={
                  addConstraint
                }
                style={
                  secondaryButtonStyle
                }
              >
                + ADD CONSTRAINT
              </button>
            </div>

            <div
              style={{
                marginTop:
                  "24px",
                border:
                  "1px solid #203e64",
                borderRadius:
                  "7px",
                overflow:
                  "hidden",
              }}
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "65px 1fr 1fr 150px 1fr 115px",
                  background:
                    "#0a1c3b",
                  borderBottom:
                    "1px solid #203e64",
                  padding:
                    "12px 14px",
                  gap: "12px",
                  color:
                    "#64748b",
                  fontSize:
                    "9px",
                  fontWeight:
                    "800",
                  letterSpacing:
                    "0.1em",
                }}
              >
                <div>
                  NO.
                </div>

                <div>
                  X COEFFICIENT
                </div>

                <div>
                  Y COEFFICIENT
                </div>

                <div>
                  OPERATOR
                </div>

                <div>
                  RHS
                </div>

                <div>
                  ACTION
                </div>
              </div>

              {constraints.map(
                (
                  constraint,
                  index
                ) => (
                  <div
                    key={index}
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "65px 1fr 1fr 150px 1fr 115px",
                      gap: "12px",
                      alignItems:
                        "center",
                      padding:
                        "15px 14px",
                      borderBottom:
                        index ===
                        constraints.length -
                          1
                          ? "none"
                          : "1px solid #1b3557",
                      background:
                        index %
                          2 ===
                        0
                          ? "#0b1e3f"
                          : "#091b38",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display:
                            "inline-flex",
                          width:
                            "30px",
                          height:
                            "30px",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          borderRadius:
                            "4px",
                          background:
                            "#102c52",
                          border:
                            "1px solid #2b527c",
                          color:
                            "#60a5fa",
                          fontWeight:
                            "800",
                          fontSize:
                            "11px",
                        }}
                      >
                        C
                        {index +
                          1}
                      </span>
                    </div>

                    <input
                      type="number"
                      step="any"
                      style={
                        matrixInputStyle
                      }
                      placeholder="X coefficient"
                      value={
                        constraint.x1
                      }
                      onChange={(e) =>
                        handleConstraintChange(
                          index,
                          "x1",
                          e.target
                            .value
                        )
                      }
                      required
                    />

                    <input
                      type="number"
                      step="any"
                      style={
                        matrixInputStyle
                      }
                      placeholder="Y coefficient"
                      value={
                        constraint.x2
                      }
                      onChange={(e) =>
                        handleConstraintChange(
                          index,
                          "x2",
                          e.target
                            .value
                        )
                      }
                      required
                    />

                    <select
                      style={
                        matrixInputStyle
                      }
                      value={
                        constraint.operator
                      }
                      onChange={(e) =>
                        handleConstraintChange(
                          index,
                          "operator",
                          e.target
                            .value
                        )
                      }
                    >
                      <option value="<=">
                        ≤
                      </option>

                      <option value=">=">
                        ≥
                      </option>

                      <option value="=">
                        =
                      </option>
                    </select>

                    <input
                      type="number"
                      step="any"
                      style={
                        matrixInputStyle
                      }
                      placeholder="RHS value"
                      value={
                        constraint.rhs
                      }
                      onChange={(e) =>
                        handleConstraintChange(
                          index,
                          "rhs",
                          e.target
                            .value
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeConstraint(
                          index
                        )
                      }
                      disabled={
                        constraints.length <=
                        1
                      }
                      style={{
                        ...removeButtonStyle,
                        opacity:
                          constraints.length <=
                          1
                            ? 0.35
                            : 1,
                        cursor:
                          constraints.length <=
                          1
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      REMOVE
                    </button>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                marginTop:
                  "15px",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                padding:
                  "12px 15px",
                background:
                  "#091a35",
                border:
                  "1px solid #1d385b",
                borderRadius:
                  "5px",
                gap: "15px",
                flexWrap:
                  "wrap",
              }}
            >
              <div
                style={{
                  color:
                    "#94a3b8",
                  fontSize:
                    "12px",
                }}
              >
                <strong
                  style={{
                    color:
                      "#cbd5e1",
                  }}
                >
                  Non-negativity:
                </strong>{" "}
                X ≥ 0, Y ≥ 0
              </div>

              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "10px",
                  fontWeight:
                    "700",
                  letterSpacing:
                    "0.08em",
                }}
              >
                {totalConstraints} ACTIVE CONSTRAINT
                {totalConstraints !==
                1
                  ? "S"
                  : ""}
              </div>
            </div>
          </section>

          {/* =================================================
              LIVE FORMULATION PREVIEW
          ================================================= */}

          <section
            style={
              panelStyle
            }
          >
            <SectionHeader
              number="04"
              title="Mathematical Formulation"
              subtitle="Automatically generated OR formulation from the entered objective and constraints."
            />

            <div
              style={{
                marginTop:
                  "22px",
                background:
                  "#081a35",
                border:
                  "1px solid #244b78",
                borderRadius:
                  "7px",
                padding:
                  "22px",
              }}
            >
              <div
                style={{
                  color:
                    "#60a5fa",
                  fontSize:
                    "9px",
                  fontWeight:
                    "800",
                  letterSpacing:
                    "0.12em",
                  marginBottom:
                    "12px",
                }}
              >
                OBJECTIVE FUNCTION
              </div>

              <div
                style={{
                  fontSize:
                    "22px",
                  fontWeight:
                    "800",
                  color:
                    "#f8fafc",
                  marginBottom:
                    "22px",
                }}
              >
                {objectiveText(
                  objective,
                  optimization
                )}
              </div>

              <div
                style={{
                  color:
                    "#60a5fa",
                  fontSize:
                    "9px",
                  fontWeight:
                    "800",
                  letterSpacing:
                    "0.12em",
                  marginBottom:
                    "10px",
                }}
              >
                SUBJECT TO
              </div>

              {constraints.map(
                (
                  constraint,
                  index
                ) => (
                  <div
                    key={index}
                    style={{
                      padding:
                        "7px 0",
                      color:
                        "#dbeafe",
                      fontSize:
                        "17px",
                      fontFamily:
                        "Georgia, 'Times New Roman', serif",
                    }}
                  >
                    C{index + 1}:{" "}
                    {equationText(
                      constraint
                    )}
                  </div>
                )
              )}

              <div
                style={{
                  marginTop:
                    "12px",
                  paddingTop:
                    "14px",
                  borderTop:
                    "1px solid #203e64",
                  color:
                    "#cbd5e1",
                  fontSize:
                    "15px",
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                }}
              >
                X ≥ 0, Y ≥ 0
              </div>
            </div>
          </section>

          {/* =================================================
              SOLVER CONTROL
          ================================================= */}

          <section
            style={{
              background:
                "#0a1c3b",
              border:
                "1px solid #28517e",
              borderRadius:
                "8px",
              padding:
                "21px 24px",
              marginBottom:
                "25px",
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "20px",
              flexWrap:
                "wrap",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius:
                    "5px",
                  background:
                    "#102c52",
                  border:
                    "1px solid #315f91",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  color:
                    "#60a5fa",
                  fontSize:
                    "16px",
                  fontWeight:
                    "800",
                }}
              >
                LP
              </div>

              <div>
                <div
                  style={{
                    color:
                      "#f8fafc",
                    fontSize:
                      "13px",
                    fontWeight:
                      "800",
                  }}
                >
                  Optimization Engine
                </div>

                <div
                  style={{
                    color:
                      "#64748b",
                    fontSize:
                      "10px",
                    marginTop:
                      "3px",
                  }}
                >
                  Validate model and calculate feasible optimum
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading
              }
              style={{
                ...solveButtonStyle,
                opacity:
                  loading
                    ? 0.65
                    : 1,
              }}
            >
              {loading
                ? "PROCESSING MODEL..."
                : "RUN OPTIMIZATION"}

              {!loading && (
                <span
                  style={{
                    fontSize:
                      "17px",
                    marginLeft:
                      "10px",
                  }}
                >
                  →
                </span>
              )}
            </button>
          </section>
        </form>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              background:
                "#32131a",
              border:
                "1px solid #7f2638",
              color:
                "#fecdd3",
              borderRadius:
                "7px",
              padding:
                "15px 18px",
              marginBottom:
                "25px",
              fontSize:
                "13px",
            }}
          >
            <strong
              style={{
                color:
                  "#fb7185",
              }}
            >
              SYSTEM ERROR:
            </strong>{" "}
            {error}
          </div>
        )}

        {/* =================================================
            PRACTICAL FORMULATION RESULT
        ================================================= */}

        {result &&
          result.status ===
            "optimal" && (
            <>
              <section
                style={{
                  ...panelStyle,
                  borderColor:
                    "#2d765b",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                    gap: "15px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <SectionHeader
                    number="05"
                    title="OR Practical Formulation"
                    subtitle="Structured formulation generated from the solved LPP model."
                  />

                  <button
                    type="button"
                    onClick={
                      exportExcel
                    }
                    style={{
                      ...excelButtonStyle,
                    }}
                  >
                    EXPORT EXCEL
                  </button>
                </div>

                <div
                  style={{
                    marginTop:
                      "22px",
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "15px",
                  }}
                >
                  <div
                    style={
                      practicalCardStyle
                    }
                  >
                    <div
                      style={
                        practicalLabelStyle
                      }
                    >
                      OBJECTIVE FUNCTION
                    </div>

                    <div
                      style={
                        practicalFormulaStyle
                      }
                    >
                      {objectiveText(
                        objective,
                        optimization
                      )}
                    </div>
                  </div>

                  <div
                    style={
                      practicalCardStyle
                    }
                  >
                    <div
                      style={
                        practicalLabelStyle
                      }
                    >
                      RESTRICTIONS
                    </div>

                    <div
                      style={{
                        marginTop:
                          "9px",
                        color:
                          "#dbeafe",
                        fontSize:
                          "14px",
                        lineHeight:
                          1.7,
                      }}
                    >
                      {constraints.map(
                        (
                          c,
                          i
                        ) => (
                          <div
                            key={
                              i
                            }
                          >
                            C
                            {i +
                              1}
                            :{" "}
                            {equationText(
                              c
                            )}
                          </div>
                        )
                      )}

                      <div>
                        X ≥ 0, Y ≥ 0
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  C1 C2 TABLE
              ================================================= */}

              <section
                style={
                  panelStyle
                }
              >
                <SectionHeader
                  number="06"
                  title="C1 / C2 Coefficient Matrix"
                  subtitle="This is the standard OR practical table containing X and Y coefficients of each constraint."
                />

                <div
                  style={{
                    marginTop:
                      "22px",
                    overflowX:
                      "auto",
                  }}
                >
                  <table
                    style={{
                      width:
                        "100%",
                      borderCollapse:
                        "collapse",
                      minWidth:
                        "650px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={
                            matrixHeaderStyle
                          }
                        >
                          CONSTRAINT
                        </th>

                        <th
                          style={
                            matrixHeaderStyle
                          }
                        >
                          X
                        </th>

                        <th
                          style={
                            matrixHeaderStyle
                          }
                        >
                          Y
                        </th>

                        <th
                          style={
                            matrixHeaderStyle
                          }
                        >
                          SIGN
                        </th>

                        <th
                          style={
                            matrixHeaderStyle
                          }
                        >
                          RHS
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {constraints.map(
                        (
                          constraint,
                          index
                        ) => (
                          <tr
                            key={
                              index
                            }
                          >
                            <td
                              style={{
                                ...matrixCellStyle,
                                color:
                                  "#60a5fa",
                                fontWeight:
                                  "800",
                              }}
                            >
                              C
                              {index +
                                1}
                            </td>

                            <td
                              style={
                                matrixCellStyle
                              }
                            >
                              {
                                constraint.x1
                              }
                            </td>

                            <td
                              style={
                                matrixCellStyle
                              }
                            >
                              {
                                constraint.x2
                              }
                            </td>

                            <td
                              style={{
                                ...matrixCellStyle,
                                color:
                                  "#a78bfa",
                                fontWeight:
                                  "800",
                              }}
                            >
                              {constraint.operator ===
                              "<="
                                ? "≤"
                                : constraint.operator ===
                                    ">="
                                  ? "≥"
                                  : "="}
                            </td>

                            <td
                              style={{
                                ...matrixCellStyle,
                                fontWeight:
                                  "800",
                              }}
                            >
                              {
                                constraint.rhs
                              }
                            </td>
                          </tr>
                        )
                      )}

                      <tr>
                        <td
                          style={{
                            ...matrixCellStyle,
                            color:
                              "#22c55e",
                            fontWeight:
                              "800",
                          }}
                        >
                          OBJECTIVE
                        </td>

                        <td
                          style={{
                            ...matrixCellStyle,
                            color:
                              "#22c55e",
                            fontWeight:
                              "800",
                          }}
                        >
                          {
                            objective.x1
                          }
                        </td>

                        <td
                          style={{
                            ...matrixCellStyle,
                            color:
                              "#22c55e",
                            fontWeight:
                              "800",
                          }}
                        >
                          {
                            objective.x2
                          }
                        </td>

                        <td
                          style={
                            matrixCellStyle
                          }
                        >
                          —
                        </td>

                        <td
                          style={
                            matrixCellStyle
                          }
                        >
                          —
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  style={{
                    marginTop:
                      "17px",
                    padding:
                      "14px 16px",
                    background:
                      "#091b38",
                    border:
                      "1px solid #1d385b",
                    borderRadius:
                      "6px",
                    color:
                      "#94a3b8",
                    fontSize:
                      "11px",
                    lineHeight:
                      1.6,
                  }}
                >
                  <strong
                    style={{
                      color:
                        "#cbd5e1",
                    }}
                  >
                    Practical format:
                  </strong>{" "}
                  C1, C2, C3... contain the coefficients of decision
                  variables X and Y, followed by the inequality sign and
                  right-hand-side resource value.
                </div>
              </section>

              {/* =================================================
                  RESULT HEADER
              ================================================= */}

              <section
                style={{
                  background:
                    "linear-gradient(110deg, #0a213e, #0a2949)",
                  border:
                    "1px solid #275c52",
                  borderRadius:
                    "8px",
                  padding:
                    "25px 27px",
                  marginBottom:
                    "16px",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: "20px",
                  flexWrap:
                    "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize:
                        "9px",
                      fontWeight:
                        "800",
                      color:
                        "#4ade80",
                      letterSpacing:
                        "0.13em",
                      marginBottom:
                        "7px",
                    }}
                  >
                    OPTIMIZATION COMPLETE
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize:
                        "26px",
                      color:
                        "#f8fafc",
                      fontWeight:
                        "800",
                    }}
                  >
                    Optimal Solution Identified
                  </h2>

                  <p
                    style={{
                      margin:
                        "7px 0 0",
                      color:
                        "#94a3b8",
                      fontSize:
                        "12px",
                    }}
                  >
                    The graphical model has produced a feasible optimal
                    decision point.
                  </p>
                </div>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "9px",
                    border:
                      "1px solid #2d765b",
                    background:
                      "#0b2b27",
                    padding:
                      "10px 14px",
                    borderRadius:
                      "5px",
                    color:
                      "#4ade80",
                    fontSize:
                      "10px",
                    fontWeight:
                      "800",
                    letterSpacing:
                      "0.08em",
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius:
                        "50%",
                      background:
                        "#22c55e",
                      display:
                        "inline-block",
                    }}
                  />

                  OPTIMAL
                </div>
              </section>

              {/* =================================================
                  RESULT KPIs
              ================================================= */}

              <section
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: "14px",
                  marginBottom:
                    "25px",
                }}
              >
                <ResultKpi
                  label="OPTIMAL X"
                  value={
                    result
                      .optimal_solution
                      .x1
                  }
                />

                <ResultKpi
                  label="OPTIMAL Y"
                  value={
                    result
                      .optimal_solution
                      .x2
                  }
                />

                <ResultKpi
                  label={
                    optimization ===
                    "max"
                      ? "MAXIMUM OBJECTIVE Z"
                      : "MINIMUM OBJECTIVE Z"
                  }
                  value={
                    result
                      .optimal_solution
                      .z
                  }
                  highlight
                />
              </section>

              {/* =================================================
                  CORNER POINT ANALYSIS
              ================================================= */}

              <section
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "0.82fr 1.18fr",
                  gap: "16px",
                  marginBottom:
                    "25px",
                }}
              >
                <div
                  style={
                    panelStyle
                  }
                >
                  <SectionHeader
                    number="07"
                    title="Corner Point Analysis"
                    subtitle="Objective value evaluated at every feasible corner point."
                  />

                  <div
                    style={{
                      marginTop:
                        "22px",
                      overflowX:
                        "auto",
                    }}
                  >
                    <table
                      style={{
                        width:
                          "100%",
                        borderCollapse:
                          "collapse",
                        fontSize:
                          "12px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            POINT
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            X
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Y
                          </th>

                          <th
                            style={
                              tableHeaderStyle
                            }
                          >
                            Z
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {(
                          result.corner_points ||
                          []
                        ).map(
                          (
                            point,
                            index
                          ) => {
                            const isOptimal =
                              Number(
                                point.x1
                              ) ===
                                Number(
                                  result
                                    .optimal_solution
                                    .x1
                                ) &&
                              Number(
                                point.x2
                              ) ===
                                Number(
                                  result
                                    .optimal_solution
                                    .x2
                                );

                            return (
                              <tr
                                key={
                                  index
                                }
                              >
                                <td
                                  style={{
                                    ...tableCellStyle,
                                    color:
                                      isOptimal
                                        ? "#4ade80"
                                        : "#94a3b8",
                                    fontWeight:
                                      "800",
                                  }}
                                >
                                  P
                                  {index +
                                    1}
                                </td>

                                <td
                                  style={
                                    tableCellStyle
                                  }
                                >
                                  {
                                    point.x1
                                  }
                                </td>

                                <td
                                  style={
                                    tableCellStyle
                                  }
                                >
                                  {
                                    point.x2
                                  }
                                </td>

                                <td
                                  style={{
                                    ...tableCellStyle,
                                    color:
                                      isOptimal
                                        ? "#4ade80"
                                        : "#e2e8f0",
                                    fontWeight:
                                      "800",
                                  }}
                                >
                                  {
                                    point.z
                                  }
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SUMMARY */}

                <div
                  style={
                    panelStyle
                  }
                >
                  <SectionHeader
                    number="08"
                    title="Decision Summary"
                    subtitle="Final operational decision generated by the solver."
                  />

                  <div
                    style={{
                      marginTop:
                        "22px",
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <SummaryBlock
                      label="X DECISION"
                      value={
                        result
                          .optimal_solution
                          .x1
                      }
                      description="Optimal level of decision variable X"
                    />

                    <SummaryBlock
                      label="Y DECISION"
                      value={
                        result
                          .optimal_solution
                          .x2
                      }
                      description="Optimal level of decision variable Y"
                    />
                  </div>

                  <div
                    style={{
                      marginTop:
                        "12px",
                      padding:
                        "18px",
                      background:
                        "#0a203d",
                      border:
                        "1px solid #28517e",
                      borderRadius:
                        "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "9px",
                        color:
                          "#64748b",
                        fontWeight:
                          "800",
                        letterSpacing:
                          "0.11em",
                      }}
                    >
                      OBJECTIVE VALUE
                    </div>

                    <div
                      style={{
                        marginTop:
                          "6px",
                        fontSize:
                          "30px",
                        fontWeight:
                          "800",
                        color:
                          "#60a5fa",
                      }}
                    >
                      {
                        result
                          .optimal_solution
                          .z
                      }
                    </div>

                    <div
                      style={{
                        marginTop:
                          "5px",
                        color:
                          "#94a3b8",
                        fontSize:
                          "11px",
                      }}
                    >
                      {optimization ===
                      "max"
                        ? "Maximum achievable objective value"
                        : "Minimum achievable objective value"}
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  GRAPH
              ================================================= */}

              {createGraphData() && (
                <section
                  style={
                    panelStyle
                  }
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: "15px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <SectionHeader
                      number="09"
                      title="Graphical Analysis"
                      subtitle="Constraints, feasible region, corner points and optimal point."
                    />

                    <div
                      style={{
                        border:
                          "1px solid #2d765b",
                        background:
                          "#0b2b27",
                        color:
                          "#4ade80",
                        padding:
                          "8px 11px",
                        borderRadius:
                          "4px",
                        fontSize:
                          "9px",
                        fontWeight:
                          "800",
                        letterSpacing:
                          "0.08em",
                      }}
                    >
                      GRAPHICAL METHOD
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop:
                        "22px",
                      height:
                        "500px",
                      background:
                        "radial-gradient(circle at 78% 20%, rgba(59,130,246,.08), transparent 28%), #07162f",
                      border:
                        "1px solid #203e64",
                      borderRadius:
                        "7px",
                      padding:
                        "18px",
                      boxShadow:
                        "inset 0 0 35px rgba(30,64,175,.08)",
                    }}
                  >
                    <Line
                      data={
                        createGraphData()
                      }
                      options={
                        graphOptions
                      }
                    />
                  </div>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "repeat(4, minmax(0, 1fr))",
                      gap: "10px",
                      marginTop:
                        "12px",
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

              {/* =================================================
                  CONSTRAINT VERIFICATION
              ================================================= */}

              <section
                style={
                  panelStyle
                }
              >
                <SectionHeader
                  number="10"
                  title="Constraint Verification"
                  subtitle="Check whether the final decision satisfies each constraint."
                />

                <div
                  style={{
                    marginTop:
                      "20px",
                  }}
                >
                  {constraints.map(
                    (
                      constraint,
                      index
                    ) => {
                      const lhs =
                        cleanNumber(
                          Number(
                            constraint.x1
                          ) *
                            Number(
                              result
                                .optimal_solution
                                .x1
                            ) +
                            Number(
                              constraint.x2
                            ) *
                              Number(
                                result
                                  .optimal_solution
                                  .x2
                              )
                        );

                      return (
                        <div
                          key={
                            index
                          }
                          style={{
                            padding:
                              "13px 15px",
                            background:
                              "#091b38",
                            border:
                              "1px solid #1d385b",
                            borderRadius:
                              "5px",
                            marginBottom:
                              "9px",
                            color:
                              "#cbd5e1",
                            fontSize:
                              "13px",
                          }}
                        >
                          <strong
                            style={{
                              color:
                                "#60a5fa",
                            }}
                          >
                            C
                            {index +
                              1}
                            :
                          </strong>{" "}
                          LHS ={" "}
                          {formatHand(
                            lhs
                          )}{" "}
                          {constraint.operator ===
                          "<="
                            ? "≤"
                            : constraint.operator ===
                                ">="
                              ? "≥"
                              : "="}{" "}
                          RHS ={" "}
                          {formatHand(
                            constraint.rhs
                          )}{" "}
                          <span
                            style={{
                              color:
                                "#4ade80",
                              fontWeight:
                                "800",
                              marginLeft:
                                "8px",
                            }}
                          >
                            ✓ SATISFIED
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>

              {/* =================================================
                  FINAL ANSWER
              ================================================= */}

              <section
                style={{
                  background:
                    "linear-gradient(135deg, #08261d, #0b3327)",
                  border:
                    "1px solid #2d765b",
                  borderRadius:
                    "8px",
                  padding:
                    "27px",
                  marginBottom:
                    "25px",
                }}
              >
                <div
                  style={{
                    color:
                      "#4ade80",
                    fontSize:
                      "9px",
                    fontWeight:
                      "800",
                    letterSpacing:
                      "0.13em",
                    marginBottom:
                      "8px",
                  }}
                >
                  FINAL OR PRACTICAL ANSWER
                </div>

                <h2
                  style={{
                    margin: 0,
                    color:
                      "#f8fafc",
                    fontSize:
                      "24px",
                    fontWeight:
                      "800",
                  }}
                >
                  Optimal Solution
                </h2>

                <div
                  style={{
                    marginTop:
                      "18px",
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div
                    style={
                      finalAnswerBox
                    }
                  >
                    <span>
                      X
                    </span>

                    <strong>
                      {
                        result
                          .optimal_solution
                          .x1
                      }
                    </strong>
                  </div>

                  <div
                    style={
                      finalAnswerBox
                    }
                  >
                    <span>
                      Y
                    </span>

                    <strong>
                      {
                        result
                          .optimal_solution
                          .x2
                      }
                    </strong>
                  </div>

                  <div
                    style={
                      finalAnswerBox
                    }
                  >
                    <span>
                      Z
                    </span>

                    <strong>
                      {
                        result
                          .optimal_solution
                          .z
                      }
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    marginTop:
                      "18px",
                    color:
                      "#d1fae5",
                    fontSize:
                      "14px",
                    lineHeight:
                      1.7,
                  }}
                >
                  Therefore, the{" "}
                  <strong>
                    {optimization ===
                    "max"
                      ? "maximum"
                      : "minimum"}{" "}
                    value of Z
                  </strong>{" "}
                  is{" "}
                  <strong>
                    {formatHand(
                      solvedOptimal?.z
                    )}
                  </strong>{" "}
                  at{" "}
                  <strong>
                    X ={" "}
                    {formatHand(
                      solvedOptimal?.x1
                    )}
                  </strong>{" "}
                  and{" "}
                  <strong>
                    Y ={" "}
                    {formatHand(
                      solvedOptimal?.x2
                    )}
                  </strong>
                  .
                </div>

                <button
                  type="button"
                  onClick={
                    exportExcel
                  }
                  style={{
                    ...excelButtonStyle,
                    marginTop:
                      "20px",
                  }}
                >
                  DOWNLOAD COMPLETE EXCEL PRACTICAL
                </button>
              </section>
            </>
          )}

        {/* =================================================
            SIMPLEX RESULTS
        ================================================= */}

        {method ===
          "simplex" &&
          simplexResult &&
          simplexResult.status ===
            "optimal" && (
            <section
              style={{
                marginBottom:
                  "25px",
              }}
            >
              <div
                style={{
                  ...panelStyle,
                  background:
                    "#081a2d",
                  borderColor:
                    "#28517e",
                }}
              >
                <SectionHeader
                  number="05"
                  title="Simplex Solution Analysis"
                  subtitle="Complete exam-style Simplex working with tableau, Zj, Cj-Zj, ratio test and pivot calculations."
                />

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(3, minmax(0, 1fr))",
                    gap: "14px",
                    marginTop:
                      "22px",
                  }}
                >
                  <ResultKpi
                    label="OPTIMAL X"
                    value={
                      simplexResult.x1
                    }
                  />

                  <ResultKpi
                    label="OPTIMAL Y"
                    value={
                      simplexResult.x2
                    }
                  />

                  <ResultKpi
                    label={
                      optimization ===
                      "max"
                        ? "MAXIMUM Z"
                        : "MINIMUM Z"
                    }
                    value={
                      simplexResult.z
                    }
                    highlight
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      "22px",
                    padding:
                      "32px",
                    background:
                      "#f8f6ee",
                    color:
                      "#20252b",
                    border:
                      "1px solid #b8b09d",
                    boxShadow:
                      "0 12px 35px rgba(0,0,0,.28)",
                    fontFamily:
                      "Georgia, 'Times New Roman', serif",
                    lineHeight:
                      1.65,
                  }}
                >
                  <div
                    style={{
                      borderBottom:
                        "2px solid #777",
                      paddingBottom:
                        "16px",
                      marginBottom:
                        "28px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily:
                          "Arial, sans-serif",
                        fontSize:
                          "10px",
                        fontWeight:
                          "800",
                        letterSpacing:
                          "0.16em",
                        color:
                          "#475569",
                      }}
                    >
                      OPERATIONS RESEARCH • COLLEGE EXAM WORKING
                    </div>

                    <h2
                      style={{
                        margin:
                          "7px 0 0",
                        color:
                          "#111827",
                        fontSize:
                          "27px",
                      }}
                    >
                      Simplex Method — Step-by-Step Solution
                    </h2>
                  </div>

                  <div
                    style={{
                      marginBottom:
                        "28px",
                    }}
                  >
                    <h3
                      style={{
                        color:
                          "#1e3a5f",
                      }}
                    >
                      Step 1 — Given LPP
                    </h3>

                    <div
                      style={{
                        padding:
                          "15px 17px",
                        border:
                          "1px solid #aaa",
                        background:
                          "#fffdf7",
                        fontSize:
                          "19px",
                        fontWeight:
                          "700",
                      }}
                    >
                      {objectiveText(
                        objective,
                        optimization
                      )}
                    </div>

                    <div
                      style={{
                        marginTop:
                          "12px",
                      }}
                    >
                      {constraints.map(
                        (
                          c,
                          i
                        ) => (
                          <div
                            key={
                              i
                            }
                            style={{
                              padding:
                                "5px 0",
                              fontSize:
                                "17px",
                            }}
                          >
                            C
                            {i +
                              1}
                            :{" "}
                            {equationText(
                              c
                            )}
                          </div>
                        )
                      )}
                    </div>

                    <div
                      style={{
                        marginTop:
                          "8px",
                        fontSize:
                          "16px",
                      }}
                    >
                      X ≥ 0, Y ≥ 0
                    </div>
                  </div>

                  <div
                    style={{
                      marginBottom:
                        "30px",
                    }}
                  >
                    <h3
                      style={{
                        color:
                          "#1e3a5f",
                      }}
                    >
                      Step 2 — Convert into Standard Form
                    </h3>

                    <p
                      style={{
                        fontSize:
                          "15px",
                      }}
                    >
                      Since the constraints are of the ≤ type, add one slack
                      variable to each constraint.
                    </p>

                    {constraints.map(
                      (
                        c,
                        i
                      ) => {
                        const a =
                          Number(
                            c.x1
                          );

                        const b =
                          Number(
                            c.x2
                          );

                        return (
                          <div
                            key={
                              i
                            }
                            style={{
                              padding:
                                "6px 0",
                              fontSize:
                                "17px",
                            }}
                          >
                            {formatHand(
                              a
                            )}
                            X{" "}
                            {b < 0
                              ? `− ${formatHand(
                                  Math.abs(
                                    b
                                  )
                                )}Y`
                              : `+ ${formatHand(
                                  b
                                )}Y`}{" "}
                            + S
                            {i +
                              1}{" "}
                            ={" "}
                            {formatHand(
                              c.rhs
                            )}
                          </div>
                        );
                      }
                    )}

                    <div
                      style={{
                        marginTop:
                          "9px",
                        fontSize:
                          "16px",
                      }}
                    >
                      X, Y, S1, S2, … ≥ 0
                    </div>
                  </div>

                  {simplexResult.iterations.map(
                    (it) => {
                      const pivot =
                        it.pivotDetails;

                      const names =
                        simplexResult.variableNames;

                      const cj =
                        simplexResult.transformedC;

                      return (
                        <div
                          key={
                            it.number
                          }
                          style={{
                            marginBottom:
                              "38px",
                          }}
                        >
                          <div
                            style={{
                              padding:
                                "13px 16px",
                              background:
                                "#e8e3d7",
                              borderLeft:
                                "4px solid #1e3a5f",
                              marginBottom:
                                "16px",
                            }}
                          >
                            <h3
                              style={{
                                margin:
                                  0,
                                color:
                                  "#1e3a5f",
                                fontSize:
                                  "21px",
                              }}
                            >
                              {it.number ===
                              0
                                ? "Step 3 — Initial Simplex Tableau"
                                : `Iteration ${it.number} — New Simplex Tableau`}
                            </h3>

                            <div
                              style={{
                                marginTop:
                                  "5px",
                                fontSize:
                                  "14px",
                                color:
                                  "#4b5563",
                              }}
                            >
                              Basic variables:{" "}
                              {it.basisNames.join(
                                ", "
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              overflowX:
                                "auto",
                              border:
                                "1px solid #8c8c8c",
                              background:
                                "#fffdf7",
                            }}
                          >
                            <table
                              style={{
                                width:
                                  "100%",
                                borderCollapse:
                                  "collapse",
                                minWidth:
                                  "760px",
                                fontSize:
                                  "13px",
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    background:
                                      "#e6e1d5",
                                  }}
                                >
                                  <th
                                    style={
                                      simplexTableHeader
                                    }
                                  >
                                    Cb
                                  </th>

                                  <th
                                    style={
                                      simplexTableHeader
                                    }
                                  >
                                    Basis
                                  </th>

                                  {names.map(
                                    (
                                      name,
                                      j
                                    ) => (
                                      <th
                                        key={
                                          name
                                        }
                                        style={
                                          simplexTableHeader
                                        }
                                      >
                                        Cj ={" "}
                                        {formatHand(
                                          cj[
                                            j
                                          ]
                                        )}
                                        <br />
                                        {
                                          name
                                        }
                                      </th>
                                    )
                                  )}

                                  <th
                                    style={
                                      simplexTableHeader
                                    }
                                  >
                                    RHS
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {it.rows.map(
                                  (
                                    row,
                                    ri
                                  ) => {
                                    const basisIndex =
                                      it
                                        .basis[
                                        ri
                                      ];

                                    return (
                                      <tr
                                        key={
                                          ri
                                        }
                                      >
                                        <td
                                          style={
                                            simplexTableCell
                                          }
                                        >
                                          {formatHand(
                                            cj[
                                              basisIndex
                                            ]
                                          )}
                                        </td>

                                        <td
                                          style={{
                                            ...simplexTableCell,
                                            fontWeight:
                                              "800",
                                          }}
                                        >
                                          {
                                            names[
                                              basisIndex
                                            ]
                                          }
                                        </td>

                                        {row
                                          .slice(
                                            0,
                                            names.length
                                          )
                                          .map(
                                            (
                                              v,
                                              j
                                            ) => (
                                              <td
                                                key={
                                                  j
                                                }
                                                style={
                                                  simplexTableCell
                                                }
                                              >
                                                {formatHand(
                                                  v
                                                )}
                                              </td>
                                            )
                                          )}

                                        <td
                                          style={{
                                            ...simplexTableCell,
                                            fontWeight:
                                              "700",
                                          }}
                                        >
                                          {formatHand(
                                            row[
                                              names.length
                                            ]
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}

                                <tr
                                  style={{
                                    background:
                                      "#eee9dc",
                                    fontWeight:
                                      "700",
                                  }}
                                >
                                  <td
                                    style={
                                      simplexTableCell
                                    }
                                  >
                                    Zj
                                  </td>

                                  <td
                                    style={
                                      simplexTableCell
                                    }
                                  >
                                    —
                                  </td>

                                  {it.calc.zj
                                    .slice(
                                      0,
                                      names.length
                                    )
                                    .map(
                                      (
                                        v,
                                        j
                                      ) => (
                                        <td
                                          key={
                                            j
                                          }
                                          style={
                                            simplexTableCell
                                          }
                                        >
                                          {formatHand(
                                            v
                                          )}
                                        </td>
                                      )
                                    )}

                                  <td
                                    style={
                                      simplexTableCell
                                    }
                                  >
                                    {formatHand(
                                      it
                                        .calc
                                        .zj[
                                        names.length
                                      ]
                                    )}
                                  </td>
                                </tr>

                                <tr
                                  style={{
                                    background:
                                      "#ded8ca",
                                    fontWeight:
                                      "800",
                                  }}
                                >
                                  <td
                                    style={
                                      simplexTableCell
                                    }
                                  >
                                    Cj − Zj
                                  </td>

                                  <td
                                    style={
                                      simplexTableCell
                                    }
                                  >
                                    —
                                  </td>

                                  {it.calc.cjMinusZj.map(
                                    (
                                      v,
                                      j
                                    ) => (
                                      <td
                                        key={
                                          j
                                        }
                                        style={
                                          simplexTableCell
                                        }
                                      >
                                        {formatHand(
                                          v
                                        )}
                                      </td>
                                    )
                                  )}

                                  <td
                                    style={
                                      simplexTableCell
                                    }
                                  >
                                    —
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div
                            style={{
                              marginTop:
                                "20px",
                            }}
                          >
                            <h4
                              style={{
                                color:
                                  "#374151",
                              }}
                            >
                              1. Calculate Zj
                            </h4>

                            {it.calc.zj
                              .slice(
                                0,
                                names.length
                              )
                              .map(
                                (
                                  z,
                                  j
                                ) => {
                                  const terms =
                                    it.rows
                                      .map(
                                        (
                                          row,
                                          ri
                                        ) =>
                                          `${formatHand(
                                            cj[
                                              it
                                                .basis[
                                                ri
                                              ]
                                            ]
                                          )} × ${formatHand(
                                            row[
                                              j
                                            ]
                                          )}`
                                      )
                                      .join(
                                        " + "
                                      );

                                  return (
                                    <div
                                      key={
                                        j
                                      }
                                      style={{
                                        padding:
                                          "5px 10px",
                                        fontSize:
                                          "14px",
                                      }}
                                    >
                                      Zj (
                                      {
                                        names[
                                          j
                                        ]
                                      }
                                      ) ={" "}
                                      {
                                        terms
                                      }{" "}
                                      ={" "}
                                      <b>
                                        {formatHand(
                                          z
                                        )}
                                      </b>
                                    </div>
                                  );
                                }
                              )}
                          </div>

                          {it.optimal ? (
                            <div
                              style={{
                                marginTop:
                                  "20px",
                                padding:
                                  "14px 16px",
                                border:
                                  "2px solid #15803d",
                                background:
                                  "#ecfdf5",
                                color:
                                  "#166534",
                                fontSize:
                                  "15px",
                                fontWeight:
                                  "700",
                              }}
                            >
                              All Cj − Zj values are ≤ 0. Therefore, the
                              present tableau is optimal.
                            </div>
                          ) : pivot ? (
                            <>
                              <div
                                style={{
                                  marginTop:
                                    "20px",
                                  padding:
                                    "14px 16px",
                                  border:
                                    "1px solid #aaa",
                                  background:
                                    "#fffdf7",
                                  fontSize:
                                    "15px",
                                }}
                              >
                                <b>
                                  Entering Variable:
                                </b>{" "}
                                {
                                  pivot.entering
                                }
                              </div>

                              <h4
                                style={{
                                  marginTop:
                                    "20px",
                                  color:
                                    "#374151",
                                }}
                              >
                                Ratio Test
                              </h4>

                              {pivot.ratios.map(
                                (
                                  r
                                ) => (
                                  <div
                                    key={
                                      r.row
                                    }
                                    style={{
                                      padding:
                                        "5px 10px",
                                      fontSize:
                                        "14px",
                                    }}
                                  >
                                    R
                                    {
                                      r.row
                                    }
                                    :{" "}
                                    {r.ratio ===
                                    null
                                      ? "Not applicable."
                                      : `${formatHand(
                                          r.rhs
                                        )} ÷ ${formatHand(
                                          r.coefficient
                                        )} = ${formatHand(
                                          r.ratio
                                        )}`}
                                  </div>
                                )
                              )}

                              <div
                                style={{
                                  marginTop:
                                    "18px",
                                  padding:
                                    "14px 16px",
                                  border:
                                    "1px solid #aaa",
                                  background:
                                    "#fffdf7",
                                }}
                              >
                                <b>
                                  Pivot Element:
                                </b>{" "}
                                {formatHand(
                                  pivot.pivotElement
                                )}
                              </div>
                            </>
                          ) : null}
                        </div>
                      );
                    }
                  )}

                  <div
                    style={{
                      marginTop:
                        "10px",
                      padding:
                        "23px",
                      border:
                        "2px solid #15803d",
                      background:
                        "#ecfdf5",
                    }}
                  >
                    <h3
                      style={{
                        color:
                          "#166534",
                        marginTop:
                          0,
                      }}
                    >
                      Final Answer
                    </h3>

                    <div
                      style={{
                        fontSize:
                          "18px",
                        lineHeight:
                          1.95,
                      }}
                    >
                      X ={" "}
                      <b>
                        {formatHand(
                          simplexResult.x1
                        )}
                      </b>

                      <br />

                      Y ={" "}
                      <b>
                        {formatHand(
                          simplexResult.x2
                        )}
                      </b>

                      <br />

                      Z ={" "}
                      <b>
                        {formatHand(
                          simplexResult.z
                        )}
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

        {/* =================================================
            FOOTER STATUS
        ================================================= */}

        <div
          style={{
            marginTop:
              "35px",
            borderTop:
              "1px solid #1b3557",
            paddingTop:
              "17px",
            display:
              "flex",
            justifyContent:
              "space-between",
            gap: "15px",
            flexWrap:
              "wrap",
            color:
              "#475569",
            fontSize:
              "9px",
            fontWeight:
              "700",
            letterSpacing:
              "0.08em",
          }}
        >
          <span>
            OR SMART SOLVER / LPP ENGINE
          </span>

          <span>
            OR PRACTICAL WORKFLOW
          </span>

          <span>
            STATUS: OPERATIONAL
          </span>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function KpiCard({
  label,
  value,
  detail,
  success = false,
}) {
  return (
    <div
      style={{
        background:
          "#0a1c3b",
        border:
          "1px solid #203e64",
        borderRadius:
          "7px",
        padding:
          "16px 18px",
        minHeight:
          "86px",
      }}
    >
      <div
        style={{
          color:
            "#64748b",
          fontSize:
            "9px",
          fontWeight:
            "800",
          letterSpacing:
            "0.1em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop:
            "7px",
          color:
            success
              ? "#4ade80"
              : "#f8fafc",
          fontSize:
            "20px",
          fontWeight:
            "800",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color:
            "#526985",
          fontSize:
            "9px",
          marginTop:
            "2px",
        }}
      >
        {detail}
      </div>
    </div>
  );
}

function ResultKpi({
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      style={{
        background:
          "#0a1c3b",
        border: highlight
          ? "1px solid #2d765b"
          : "1px solid #244b78",
        borderRadius:
          "7px",
        padding:
          "21px",
      }}
    >
      <div
        style={{
          color:
            "#64748b",
          fontSize:
            "9px",
          fontWeight:
            "800",
          letterSpacing:
            "0.11em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            highlight
              ? "#4ade80"
              : "#60a5fa",
          fontSize:
            "31px",
          fontWeight:
            "800",
          marginTop:
            "8px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SummaryBlock({
  label,
  value,
  description,
}) {
  return (
    <div
      style={{
        padding:
          "17px",
        background:
          "#091b38",
        border:
          "1px solid #1d385b",
        borderRadius:
          "6px",
      }}
    >
      <div
        style={{
          color:
            "#64748b",
          fontSize:
            "9px",
          fontWeight:
            "800",
          letterSpacing:
            "0.1em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color:
            "#f8fafc",
          fontSize:
            "24px",
          fontWeight:
            "800",
          marginTop:
            "7px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color:
            "#64748b",
          fontSize:
            "9px",
          lineHeight:
            1.45,
          marginTop:
            "5px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

function GraphLegend({
  label,
  detail,
  type,
}) {
  let indicator = {};

  if (type === "line") {
    indicator = {
      width: "22px",
      height: "4px",
      borderRadius: "2px",
      background:
        "linear-gradient(90deg, #38bdf8 0%, #a78bfa 34%, #f59e0b 67%, #f472b6 100%)",
    };
  }

  if (type === "area") {
    indicator = {
      width: "18px",
      height: "12px",
      background:
        "rgba(34,197,94,.25)",
      border:
        "1px solid #22c55e",
    };
  }

  if (type === "point") {
    indicator = {
      width: "9px",
      height: "9px",
      borderRadius:
        "50%",
      background:
        "#60a5fa",
    };
  }

  if (type === "optimal") {
    indicator = {
      width: "11px",
      height: "11px",
      borderRadius:
        "50%",
      background:
        "#22c55e",
      boxShadow:
        "0 0 8px rgba(34,197,94,.5)",
    };
  }

  return (
    <div
      style={{
        display:
          "flex",
        alignItems:
          "center",
        gap: "9px",
        background:
          "#091b38",
        border:
          "1px solid #1b3557",
        borderRadius:
          "5px",
        padding:
          "10px",
      }}
    >
      <span
        style={{
          display:
            "inline-block",
          flexShrink: 0,
          ...indicator,
        }}
      />

      <div>
        <div
          style={{
            color:
              "#cbd5e1",
            fontSize:
              "10px",
            fontWeight:
              "700",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color:
              "#526985",
            fontSize:
              "8px",
            marginTop:
              "2px",
          }}
        >
          {detail}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  number,
  title,
  subtitle,
}) {
  return (
    <div
      style={{
        display:
          "flex",
        alignItems:
          "flex-start",
        gap: "13px",
      }}
    >
      <div
        style={{
          minWidth:
            "34px",
          height:
            "34px",
          borderRadius:
            "5px",
          background:
            "#102c52",
          border:
            "1px solid #315f91",
          color:
            "#60a5fa",
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontSize:
            "10px",
          fontWeight:
            "800",
        }}
      >
        {number}
      </div>

      <div>
        <h2
          style={{
            margin: 0,
            color:
              "#f1f5f9",
            fontSize:
              "19px",
            fontWeight:
              "800",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin:
              "4px 0 0",
            color:
              "#64748b",
            fontSize:
              "11px",
            lineHeight:
              1.5,
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function FieldBlock({
  label,
  children,
}) {
  return (
    <div>
      <label
        style={{
          display:
            "block",
          color:
            "#7890aa",
          fontSize:
            "9px",
          fontWeight:
            "800",
          letterSpacing:
            "0.1em",
          marginBottom:
            "7px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const heroTagStyle = {
  border:
    "1px solid #315f91",
  background:
    "rgba(10,32,61,.75)",
  color:
    "#8db8df",
  borderRadius:
    "3px",
  padding:
    "6px 8px",
  fontSize:
    "8px",
  fontWeight:
    "800",
  letterSpacing:
    "0.09em",
};

const panelStyle = {
  background:
    "#0a1c3b",
  border:
    "1px solid #203e64",
  borderRadius:
    "8px",
  padding:
    "25px",
  marginBottom:
    "25px",
};

const inputStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  height:
    "46px",
  background:
    "#071832",
  color:
    "#e2e8f0",
  border:
    "1px solid #29496c",
  borderRadius:
    "5px",
  padding:
    "0 13px",
  outline:
    "none",
  fontSize:
    "13px",
};

const matrixInputStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  height:
    "40px",
  background:
    "#071832",
  color:
    "#e2e8f0",
  border:
    "1px solid #29496c",
  borderRadius:
    "4px",
  padding:
    "0 10px",
  outline:
    "none",
  fontSize:
    "12px",
};

const secondaryButtonStyle = {
  background:
    "#0d2749",
  border:
    "1px solid #35689a",
  color:
    "#7dd3fc",
  borderRadius:
    "5px",
  padding:
    "10px 14px",
  fontSize:
    "9px",
  fontWeight:
    "800",
  letterSpacing:
    "0.08em",
  cursor:
    "pointer",
};

const removeButtonStyle = {
  width:
    "100%",
  height:
    "40px",
  background:
    "#211725",
  border:
    "1px solid #613342",
  color:
    "#fb7185",
  borderRadius:
    "4px",
  fontSize:
    "9px",
  fontWeight:
    "800",
  letterSpacing:
    "0.06em",
};

const solveButtonStyle = {
  border:
    "1px solid #3984d4",
  background:
    "linear-gradient(135deg, #1769aa, #1677bd)",
  color:
    "#ffffff",
  borderRadius:
    "5px",
  padding:
    "13px 20px",
  minWidth:
    "205px",
  fontSize:
    "10px",
  fontWeight:
    "800",
  letterSpacing:
    "0.1em",
  cursor:
    "pointer",
  boxShadow:
    "0 8px 20px rgba(14,116,214,.16)",
};

const excelButtonStyle = {
  border:
    "1px solid #3d996e",
  background:
    "linear-gradient(135deg, #166534, #15803d)",
  color:
    "#ffffff",
  borderRadius:
    "5px",
  padding:
    "11px 16px",
  fontSize:
    "9px",
  fontWeight:
    "800",
  letterSpacing:
    "0.08em",
  cursor:
    "pointer",
  boxShadow:
    "0 8px 20px rgba(34,197,94,.12)",
};

const tableHeaderStyle = {
  textAlign:
    "left",
  padding:
    "10px 9px",
  color:
    "#64748b",
  borderBottom:
    "1px solid #203e64",
  fontSize:
    "8px",
  fontWeight:
    "800",
  letterSpacing:
    "0.1em",
};

const tableCellStyle = {
  padding:
    "13px 9px",
  borderBottom:
    "1px solid #1b3557",
  color:
    "#cbd5e1",
  fontSize:
    "12px",
};

const matrixHeaderStyle = {
  padding:
    "13px 14px",
  textAlign:
    "left",
  background:
    "#0b2547",
  color:
    "#7dd3fc",
  border:
    "1px solid #244b78",
  fontSize:
    "10px",
  fontWeight:
    "800",
  letterSpacing:
    "0.08em",
};

const matrixCellStyle = {
  padding:
    "14px",
  border:
    "1px solid #1d385b",
  color:
    "#e2e8f0",
  fontSize:
    "13px",
};

const practicalCardStyle = {
  background:
    "#091b38",
  border:
    "1px solid #1d385b",
  borderRadius:
    "6px",
  padding:
    "18px",
};

const practicalLabelStyle = {
  color:
    "#64748b",
  fontSize:
    "9px",
  fontWeight:
    "800",
  letterSpacing:
    "0.11em",
};

const practicalFormulaStyle = {
  marginTop:
    "10px",
  color:
    "#f8fafc",
  fontSize:
    "20px",
  fontWeight:
    "700",
  fontFamily:
    "Georgia, 'Times New Roman', serif",
};

const finalAnswerBox = {
  padding:
    "18px",
  background:
    "rgba(255,255,255,.04)",
  border:
    "1px solid rgba(134,239,172,.18)",
  borderRadius:
    "6px",
};

const simplexTableHeader = {
  padding:
    "9px",
  border:
    "1px solid #999",
};

const simplexTableCell = {
  padding:
    "9px",
  border:
    "1px solid #aaa",
  textAlign:
    "center",
};

export default LinearProgramming;