function About() {
  const modules = [
    {
      number: "01",
      title: "Linear Programming",
      short: "LPP",
      description:
        "Solve optimization problems using mathematical models, constraints, objective functions, and graphical or simplex-based approaches.",
      methods: ["Graphical Method", "Simplex Method"],
    },
    {
      number: "02",
      title: "Transportation Problem",
      short: "TP",
      description:
        "Determine efficient transportation plans by minimizing the total cost of shipping goods from sources to destinations.",
      methods: [
        "North-West Corner",
        "Least Cost",
        "Vogel's Approximation",
        "MODI",
      ],
    },
    {
      number: "03",
      title: "Assignment Problem",
      short: "AP",
      description:
        "Find the most efficient assignment of jobs to resources while minimizing total cost or maximizing overall efficiency.",
      methods: ["Assignment Model", "Optimal Allocation"],
    },
  ];

  const features = [
    {
      title: "Problem Solving",
      text: "Convert operational problems into structured mathematical models.",
    },
    {
      title: "Optimization",
      text: "Identify efficient and optimal solutions using OR techniques.",
    },
    {
      title: "Step-by-Step Learning",
      text: "Understand methods and calculations instead of only viewing final answers.",
    },
    {
      title: "Interactive Results",
      text: "View calculated solutions, tables, analysis, and important decision information.",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "Define",
      text: "Identify the decision variables, objective and constraints.",
    },
    {
      step: "02",
      title: "Model",
      text: "Represent the real-world problem using an OR mathematical model.",
    },
    {
      step: "03",
      title: "Solve",
      text: "Apply the appropriate optimization technique to obtain a solution.",
    },
    {
      step: "04",
      title: "Analyze",
      text: "Interpret the result and identify the best possible decision.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#07111f",
        color: "#e8f1fb",
        fontFamily:
          "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* HERO SECTION */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "85px 20px 75px",
          borderBottom: "1px solid rgba(71, 135, 190, 0.18)",
          background:
            "linear-gradient(135deg, #07111f 0%, #0a1b2e 55%, #0b2238 100%)",
        }}
      >
        {/* Background Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(rgba(70,160,220,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(70,160,220,.5) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "rgba(14, 165, 233, 0.08)",
            filter: "blur(80px)",
            right: "-120px",
            top: "-130px",
          }}
        />

        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "1180px",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 14px",
              border: "1px solid rgba(56, 189, 248, 0.35)",
              background: "rgba(14, 165, 233, 0.07)",
              color: "#67d3ff",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1.6px",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#38bdf8",
                boxShadow: "0 0 12px rgba(56,189,248,.8)",
              }}
            />
            Operations Research Learning Platform
          </div>

          <div style={{ maxWidth: "850px" }}>
            <h1
              style={{
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 1.02,
                fontWeight: 800,
                letterSpacing: "-2px",
                marginBottom: "25px",
              }}
            >
              About{" "}
              <span style={{ color: "#38bdf8" }}>OR Smart Solver</span>
            </h1>

            <p
              style={{
                color: "#a9bfd3",
                fontSize: "19px",
                lineHeight: 1.8,
                maxWidth: "780px",
                marginBottom: "0",
              }}
            >
              OR Smart Solver is an interactive learning and problem-solving
              platform designed to make Operations Research concepts easier to
              understand, practice, and apply.
            </p>
          </div>

          {/* Hero Metrics */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "14px",
              marginTop: "50px",
              maxWidth: "850px",
            }}
          >
            {[
              ["03", "Core Modules"],
              ["02", "LPP Methods"],
              ["04", "Transportation Methods"],
              ["01", "Interactive Solver"],
            ].map(([value, label]) => (
              <div
                key={label}
                style={{
                  padding: "18px 20px",
                  border: "1px solid rgba(91, 151, 198, 0.22)",
                  background: "rgba(8, 24, 40, 0.72)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "#eaf7ff",
                    marginBottom: "4px",
                  }}
                >
                  {value}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#7895ad",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT IS OR */}
      <section
        style={{
          padding: "75px 20px",
          background: "#081522",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1180px",
          }}
        >
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div
                style={{
                  color: "#38bdf8",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: "14px",
                }}
              >
                Understanding the discipline
              </div>

              <h2
                style={{
                  fontSize: "38px",
                  fontWeight: 800,
                  letterSpacing: "-1px",
                  marginBottom: "20px",
                }}
              >
                What is Operations Research?
              </h2>

              <p
                style={{
                  color: "#a5b8c9",
                  lineHeight: 1.85,
                  fontSize: "16px",
                }}
              >
                Operations Research uses mathematical techniques,
                analytical models, and optimization methods to help solve
                decision-making problems.
              </p>

              <p
                style={{
                  color: "#8299ad",
                  lineHeight: 1.85,
                  fontSize: "15px",
                }}
              >
                The goal is to understand a problem systematically, evaluate
                possible alternatives, and determine an efficient or optimal
                course of action.
              </p>
            </div>

            <div className="col-lg-6">
              <div
                style={{
                  border: "1px solid rgba(71, 135, 190, 0.24)",
                  background: "#0a1b2b",
                  padding: "28px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: "-40px",
                    top: "-40px",
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    border: "1px solid rgba(56,189,248,.15)",
                  }}
                />

                <div
                  style={{
                    fontSize: "12px",
                    color: "#6f8ca5",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: "25px",
                  }}
                >
                  Decision Optimization
                </div>

                {[
                  ["01", "Problem", "Understand the decision situation"],
                  ["02", "Model", "Build a mathematical representation"],
                  ["03", "Method", "Apply an appropriate OR technique"],
                  ["04", "Decision", "Select the efficient solution"],
                ].map(([number, title, text]) => (
                  <div
                    key={number}
                    style={{
                      display: "flex",
                      gap: "18px",
                      padding: "17px 0",
                      borderBottom:
                        number !== "04"
                          ? "1px solid rgba(71,135,190,.14)"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        color: "#38bdf8",
                        fontSize: "12px",
                        fontWeight: 800,
                        minWidth: "25px",
                      }}
                    >
                      {number}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#dcecf8",
                          marginBottom: "4px",
                        }}
                      >
                        {title}
                      </div>

                      <div
                        style={{
                          color: "#7892a7",
                          fontSize: "13px",
                        }}
                      >
                        {text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM PURPOSE */}
      <section
        style={{
          padding: "75px 20px",
          background: "#07111f",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1180px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "760px",
              margin: "0 auto 45px",
            }}
          >
            <div
              style={{
                color: "#38bdf8",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "13px",
              }}
            >
              Platform Objective
            </div>

            <h2
              style={{
                fontSize: "36px",
                fontWeight: 800,
                marginBottom: "15px",
              }}
            >
              Learn the method. Understand the solution.
            </h2>

            <p
              style={{
                color: "#8199ae",
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              OR Smart Solver combines learning material with interactive
              problem solving so that students can understand both the
              concept and the calculation process.
            </p>
          </div>

          <div className="row g-3">
            {features.map((feature, index) => (
              <div className="col-md-6 col-lg-3" key={feature.title}>
                <div
                  style={{
                    height: "100%",
                    padding: "27px 23px",
                    border: "1px solid rgba(71,135,190,.2)",
                    background: "#0a1928",
                    transition: "transform .2s ease",
                  }}
                >
                  <div
                    style={{
                      color: "#38bdf8",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "1.5px",
                      marginBottom: "20px",
                    }}
                  >
                    0{index + 1}
                  </div>

                  <h5
                    style={{
                      color: "#e6f2fa",
                      fontWeight: 750,
                      marginBottom: "12px",
                    }}
                  >
                    {feature.title}
                  </h5>

                  <p
                    style={{
                      color: "#7892a7",
                      fontSize: "13px",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section
        style={{
          padding: "80px 20px",
          background: "#081522",
          borderTop: "1px solid rgba(71,135,190,.12)",
          borderBottom: "1px solid rgba(71,135,190,.12)",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1180px",
          }}
        >
          <div style={{ marginBottom: "42px" }}>
            <div
              style={{
                color: "#38bdf8",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              OR Learning Modules
            </div>

            <h2
              style={{
                fontSize: "38px",
                fontWeight: 800,
                marginBottom: "10px",
              }}
            >
              Built around core OR problems
            </h2>

            <p
              style={{
                color: "#8098ad",
                margin: 0,
              }}
            >
              Explore the major problem-solving areas available in the
              platform.
            </p>
          </div>

          <div className="row g-4">
            {modules.map((module) => (
              <div className="col-lg-4" key={module.number}>
                <div
                  style={{
                    height: "100%",
                    padding: "28px",
                    background: "#0a1b2b",
                    border: "1px solid rgba(71,135,190,.22)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "27px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "1.5px",
                        color: "#38bdf8",
                      }}
                    >
                      MODULE {module.number}
                    </span>

                    <span
                      style={{
                        padding: "5px 9px",
                        border: "1px solid rgba(56,189,248,.25)",
                        color: "#70a8c5",
                        fontSize: "10px",
                        fontWeight: 800,
                      }}
                    >
                      {module.short}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontWeight: 800,
                      color: "#e4f0f7",
                      marginBottom: "14px",
                    }}
                  >
                    {module.title}
                  </h4>

                  <p
                    style={{
                      color: "#8198aa",
                      fontSize: "13px",
                      lineHeight: 1.75,
                      minHeight: "72px",
                    }}
                  >
                    {module.description}
                  </p>

                  <div
                    style={{
                      marginTop: "25px",
                      paddingTop: "18px",
                      borderTop: "1px solid rgba(71,135,190,.14)",
                    }}
                  >
                    <div
                      style={{
                        color: "#627e95",
                        fontSize: "10px",
                        fontWeight: 800,
                        letterSpacing: "1.3px",
                        textTransform: "uppercase",
                        marginBottom: "12px",
                      }}
                    >
                      Methods / Focus
                    </div>

                    {module.methods.map((method) => (
                      <div
                        key={method}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "9px",
                          color: "#a9bdcd",
                          fontSize: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            background: "#38bdf8",
                            display: "inline-block",
                          }}
                        />
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section
        style={{
          padding: "80px 20px",
          background: "#07111f",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1180px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "48px",
            }}
          >
            <div
              style={{
                color: "#38bdf8",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Solver Workflow
            </div>

            <h2
              style={{
                fontSize: "36px",
                fontWeight: 800,
                marginBottom: "12px",
              }}
            >
              From problem to decision
            </h2>

            <p
              style={{
                color: "#7e96aa",
                maxWidth: "650px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              A structured approach helps transform an operational problem
              into a meaningful decision.
            </p>
          </div>

          <div className="row g-3">
            {workflow.map((item, index) => (
              <div className="col-md-6 col-lg-3" key={item.step}>
                <div
                  style={{
                    position: "relative",
                    height: "100%",
                    padding: "25px",
                    border: "1px solid rgba(71,135,190,.2)",
                    background: "#0a1928",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "25px",
                    }}
                  >
                    <span
                      style={{
                        color: "#38bdf8",
                        fontSize: "12px",
                        fontWeight: 800,
                      }}
                    >
                      STEP {item.step}
                    </span>

                    {index < workflow.length - 1 && (
                      <span
                        style={{
                          color: "#31546d",
                          fontSize: "18px",
                        }}
                      >
                        â†’
                      </span>
                    )}
                  </div>

                  <h5
                    style={{
                      fontWeight: 800,
                      color: "#e2eef6",
                      marginBottom: "10px",
                    }}
                  >
                    {item.title}
                  </h5>

                  <p
                    style={{
                      color: "#7892a7",
                      fontSize: "13px",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STUDENT SECTION */}
      <section
        style={{
          padding: "70px 20px",
          background: "#0a1b2b",
          borderTop: "1px solid rgba(71,135,190,.15)",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              border: "1px solid rgba(56,189,248,.22)",
              padding: "42px",
              background:
                "linear-gradient(135deg, rgba(14,165,233,.06), rgba(8,25,42,.8))",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#38bdf8",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "15px",
              }}
            >
              Designed for Learning
            </div>

            <h2
              style={{
                fontSize: "34px",
                fontWeight: 800,
                marginBottom: "16px",
              }}
            >
              Understand OR, don't just calculate it.
            </h2>

            <p
              style={{
                color: "#8ca3b6",
                maxWidth: "700px",
                margin: "0 auto",
                lineHeight: 1.8,
                fontSize: "14px",
              }}
            >
              The platform is designed to support students while learning
              Operations Research concepts, practicing numerical problems,
              applying appropriate methods, and interpreting the resulting
              solutions.
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM STATUS STRIP */}
      <section
        style={{
          padding: "24px 20px",
          background: "#050d17",
          borderTop: "1px solid rgba(71,135,190,.15)",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "1180px",
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
                color: "#dbeaf4",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              OR SMART SOLVER
            </div>

            <div
              style={{
                color: "#5f778c",
                fontSize: "11px",
                marginTop: "4px",
              }}
            >
              Structured learning â€¢ Optimization â€¢ Decision support
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              color: "#6f899e",
              fontSize: "11px",
              letterSpacing: ".8px",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 10px rgba(34,197,94,.5)",
              }}
            />
            Learning System Active
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
