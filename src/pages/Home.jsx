import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCalculator,
  FaTruck,
  FaTasks,
  FaCheckCircle,
  FaRocket,
  FaChartLine,
  FaLightbulb,
} from "react-icons/fa";

import "../styles/home.css";

function Home() {
  return (
    <div className="home-page">

      {/* ================= HERO ================= */}
      <section className="hero-section">

        {/* Decorative background elements */}
        <div className="hero-glow hero-glow-pink"></div>
        <div className="hero-glow hero-glow-blue"></div>
        <div className="hero-glow hero-glow-purple"></div>

        <div className="math-symbol math-one">xâ‚ + xâ‚‚</div>
        <div className="math-symbol math-two">MAX Z</div>
        <div className="math-symbol math-three">â‰¤</div>
        <div className="math-symbol math-four">âˆ‘</div>

        <div className="container hero-container">

          <div className="row align-items-center">

            {/* ================= LEFT SIDE ================= */}
            <div className="col-lg-6">

              <div className="hero-label">
                <span className="label-dot"></span>
                OPERATION RESEARCH â€¢ B.Sc. IT
              </div>

              <h1 className="hero-title">

                Turn Complex
                <br />

                <span className="gradient-text">
                  Decisions
                </span>{" "}

                Into

                <br />

                <span className="gradient-text">
                  Smart Solutions.
                </span>

              </h1>

              <p className="hero-description">
                Operation Research meets technology. Learn optimization
                through interactive methods, step-by-step solutions,
                mathematical models, and visual learning.
              </p>

              {/* Buttons */}
              <div className="hero-buttons">

                <Link
                  to="/linear-programming"
                  className="hero-btn hero-btn-primary"
                >
                  <FaRocket />
                  Start Solving
                  <FaArrowRight />
                </Link>

                <a
                  href="#modules"
                  className="hero-btn hero-btn-secondary"
                >
                  Explore Modules
                  <span>â†“</span>
                </a>

              </div>

              {/* Benefits */}
              <div className="hero-benefits">

                <div className="hero-benefit">
                  <FaCheckCircle />
                  <span>Step-by-step</span>
                </div>

                <div className="hero-benefit">
                  <FaChartLine />
                  <span>Interactive Visuals</span>
                </div>

                <div className="hero-benefit">
                  <FaLightbulb />
                  <span>Easy to Understand</span>
                </div>

              </div>

            </div>


            {/* ================= RIGHT SIDE ================= */}
            <div className="col-lg-6">

              <div className="optimization-wrapper">

                {/* Outer glowing circle */}
                <div className="optimization-ring"></div>

                {/* Main optimization card */}
                <div className="optimization-card">

                  <div className="optimization-header">

                    <div>
                      <span className="optimization-label">
                        OPTIMIZATION ENGINE
                      </span>

                      <h3>Linear Programming</h3>
                    </div>

                    <div className="optimization-icon">
                      <FaChartLine />
                    </div>

                  </div>


                  {/* Graph */}
                  <div className="optimization-graph">

                    <div className="graph-axis-x"></div>
                    <div className="graph-axis-y"></div>

                    <div className="graph-line-one"></div>
                    <div className="graph-line-two"></div>

                    <div className="feasible-region"></div>

                    <div className="graph-point graph-point-one"></div>
                    <div className="graph-point graph-point-two"></div>

                    <div className="optimal-point">
                      <span></span>
                    </div>

                    <span className="axis-label axis-x-label">
                      xâ‚
                    </span>

                    <span className="axis-label axis-y-label">
                      xâ‚‚
                    </span>

                    <span className="equation equation-one">
                      xâ‚ + 2xâ‚‚ â‰¤ 8
                    </span>

                    <span className="equation equation-two">
                      3xâ‚ + 2xâ‚‚ â‰¤ 12
                    </span>

                    <span className="feasible-text">
                      Feasible Region
                    </span>

                  </div>


                  {/* Result */}
                  <div className="optimization-result">

                    <div>

                      <span className="result-label">
                        MAX Z
                      </span>

                      <strong>
                        Z = 3xâ‚ + 5xâ‚‚
                      </strong>

                      <small>
                        xâ‚ = 2.67 &nbsp; | &nbsp; xâ‚‚ = 2.67
                      </small>

                    </div>

                    <div className="optimal-badge">
                      <FaCheckCircle />
                      <span>
                        OPTIMAL
                        <br />
                        SOLUTION
                      </span>
                    </div>

                  </div>

                </div>


                {/* Floating mini card */}
                <div className="floating-solver-card solver-card-top">

                  <div className="mini-card-icon">
                    <FaCalculator />
                  </div>

                  <div>
                    <strong>Simplex Method</strong>
                    <span>Iteration 03</span>
                  </div>

                </div>


                {/* Floating code card */}
                <div className="floating-code-card">

                  <span>// SMART SOLVER</span>

                  <p>
                    <b>solve</b>(problem)
                  </p>

                  <p>
                    â†’ optimize()
                  </p>

                  <p>
                    â†’ result âœ“
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ================= MODULES ================= */}
          <div id="modules" className="hero-modules">

            <div className="module-card module-lpp">

              <div className="module-icon">
                <FaChartLine />
              </div>

              <div className="module-content">

                <div className="module-number">
                  01
                </div>

                <h4>
                  Linear Programming
                </h4>

                <p>
                  Optimize resources and maximize profit.
                </p>

                <div className="module-methods">
                  Graphical â€¢ Simplex â€¢ Big M â€¢ Duality
                </div>

              </div>

              <Link to="/linear-programming">
                Solve Now <FaArrowRight />
              </Link>

            </div>


            <div className="module-card module-transport">

              <div className="module-icon">
                <FaTruck />
              </div>

              <div className="module-content">

                <div className="module-number">
                  02
                </div>

                <h4>
                  Transportation
                </h4>

                <p>
                  Minimize cost and optimize allocation.
                </p>

                <div className="module-methods">
                  NW Corner â€¢ Least Cost â€¢ VAM â€¢ MODI
                </div>

              </div>

              <Link to="/transportation">
                Solve Now <FaArrowRight />
              </Link>

            </div>


            <div className="module-card module-assignment">

              <div className="module-icon">
                <FaTasks />
              </div>

              <div className="module-content">

                <div className="module-number">
                  03
                </div>

                <h4>
                  Assignment
                </h4>

                <p>
                  Find the optimal assignment with minimum cost.
                </p>

                <div className="module-methods">
                  Hungarian â€¢ Maximize â€¢ Minimize
                </div>

              </div>

              <Link to="/assignment">
                Solve Now <FaArrowRight />
              </Link>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Home;
