import { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  FaHeadset,
  FaBug,
  FaCode,
  FaServer,
  FaPython,
  FaReact,
  FaDatabase,
  FaChartLine,
  FaGraduationCap,
  FaEnvelope,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaCogs,
  FaNetworkWired,
  FaTerminal,
  FaPaperPlane,
  FaBookOpen,
} from "react-icons/fa";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "Technical Issue",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sending) return;

    setSending(true);
    setSubmitted(false);
    setSubmitError("");

    const templateParams = {
      name: form.name,
      email: form.email,
      category: form.category,
      subject: form.subject,
      message: form.message,

      // Common EmailJS template variable names
      from_name: form.name,
      from_email: form.email,
      request_category: form.category,
      reply_to: form.email,
    };

    try {
      await emailjs.send(
        "service_vrxevbp",
        "template_dm7cs1o",
        templateParams,
        {
          publicKey: "FBdDr_OWbleCBY6g7",
        }
      );

      setSubmitted(true);

      setForm({
        name: "",
        email: "",
        category: "Technical Issue",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 3500);
    } catch (error) {
      console.error("EmailJS submission failed:", error);

      setSubmitError(
        "Unable to send the request right now. Please check the EmailJS configuration and try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          .contact-page {
            min-height: 100vh;
            background:
              radial-gradient(
                circle at 85% 10%,
                rgba(14, 165, 233, 0.10),
                transparent 28%
              ),
              radial-gradient(
                circle at 10% 35%,
                rgba(37, 99, 235, 0.08),
                transparent 30%
              ),
              #020b16;
            color: #dce9f5;
            padding-bottom: 80px;
            overflow: hidden;
          }

          .contact-container {
            width: min(1380px, calc(100% - 40px));
            margin: 0 auto;
          }

          /* =====================================================
             HERO
          ===================================================== */

          .contact-hero {
            position: relative;
            padding: 75px 0 55px;
            border-bottom: 1px solid #12385b;
            overflow: hidden;
          }

          .contact-hero::before {
            content: "";
            position: absolute;
            top: -180px;
            right: -140px;
            width: 520px;
            height: 520px;
            border: 1px solid rgba(14, 165, 233, 0.15);
            transform: rotate(45deg);
          }

          .contact-hero::after {
            content: "";
            position: absolute;
            bottom: -230px;
            left: -150px;
            width: 500px;
            height: 500px;
            border: 1px solid rgba(37, 99, 235, 0.12);
            transform: rotate(45deg);
          }

          .hero-grid {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1.35fr 0.65fr;
            gap: 50px;
            align-items: center;
          }

          .system-tag {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            padding: 7px 11px;
            margin-bottom: 20px;
            border: 1px solid #20547d;
            background: rgba(8, 31, 53, 0.85);
            color: #63c7f5;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.15em;
            text-transform: uppercase;
          }

          .system-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #31e4b0;
            box-shadow: 0 0 10px rgba(49, 228, 176, 0.8);
          }

          .hero-title {
            margin: 0;
            max-width: 800px;
            font-size: clamp(38px, 5vw, 66px);
            line-height: 1.02;
            letter-spacing: -0.045em;
            font-weight: 850;
            color: #f7fbff;
          }

          .hero-title span {
            color: #20a9f5;
          }

          .hero-description {
            max-width: 720px;
            margin: 22px 0 0;
            color: #8da9c1;
            font-size: 15px;
            line-height: 1.8;
          }

          .hero-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 27px;
          }

          .meta-chip {
            padding: 9px 13px;
            border: 1px solid #173f62;
            background: #06182b;
            color: #9bb4ca;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          /* =====================================================
             TECHNICAL CONTROL PANEL
          ===================================================== */

          .control-panel {
            position: relative;
            min-height: 270px;
            border: 1px solid #1a527b;
            background:
              linear-gradient(
                145deg,
                #061a2d,
                #071322
              );
            padding: 24px;
            box-shadow:
              0 20px 50px rgba(0, 0, 0, 0.28),
              inset 0 1px 0 rgba(255,255,255,0.03);
          }

          .control-panel::before {
            content: "";
            position: absolute;
            inset: 12px;
            border: 1px dashed rgba(62, 151, 210, 0.12);
            pointer-events: none;
          }

          .panel-label {
            position: relative;
            z-index: 1;
            color: #5f8aaa;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.15em;
          }

          .terminal-title {
            position: relative;
            z-index: 1;
            margin: 14px 0 20px;
            color: #eef8ff;
            font-size: 18px;
            font-weight: 800;
          }

          .terminal-line {
            position: relative;
            z-index: 1;
            display: flex;
            gap: 10px;
            margin: 10px 0;
            color: #91aec5;
            font-family: "Courier New", monospace;
            font-size: 11px;
          }

          .terminal-prefix {
            color: #20b8ff;
          }

          .terminal-success {
            color: #31e4b0;
          }

          .terminal-muted {
            color: #52738f;
          }

          /* =====================================================
             SECTION HEADER
          ===================================================== */

          .section-block {
            margin-top: 48px;
          }

          .section-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 20px;
          }

          .section-number {
            color: #238bd0;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.15em;
          }

          .section-title {
            margin: 4px 0 0;
            color: #f2f8fd;
            font-size: 25px;
            font-weight: 800;
          }

          .section-description {
            margin: 0;
            max-width: 520px;
            color: #69869f;
            font-size: 11px;
            line-height: 1.6;
          }

          /* =====================================================
             SUPPORT CARDS
          ===================================================== */

          .support-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }

          .support-card {
            position: relative;
            min-height: 185px;
            padding: 23px;
            background: #06182b;
            border: 1px solid #153b5d;
            transition:
              transform 0.2s ease,
              border-color 0.2s ease,
              background 0.2s ease;
          }

          .support-card:hover {
            transform: translateY(-4px);
            border-color: #2879ac;
            background: #071d33;
          }

          .support-icon {
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #09243d;
            border: 1px solid #1b547c;
            color: #3bbcff;
            font-size: 17px;
            margin-bottom: 18px;
          }

          .support-card h3 {
            margin: 0 0 9px;
            color: #e9f3fa;
            font-size: 16px;
          }

          .support-card p {
            margin: 0;
            color: #7895ad;
            font-size: 11px;
            line-height: 1.7;
          }

          .support-arrow {
            position: absolute;
            right: 20px;
            bottom: 20px;
            color: #2d7fb5;
            font-size: 12px;
          }

          /* =====================================================
             ARCHITECTURE
          ===================================================== */

          .architecture-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }

          .architecture-card {
            padding: 20px;
            background: #06172a;
            border: 1px solid #143a5c;
          }

          .architecture-icon {
            color: #38bdf8;
            font-size: 18px;
            margin-bottom: 14px;
          }

          .architecture-name {
            color: #edf6fc;
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 6px;
          }

          .architecture-role {
            color: #6d8ba3;
            font-size: 10px;
            line-height: 1.6;
          }

          .architecture-status {
            margin-top: 14px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            color: #31e4b0;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.08em;
          }

          /* =====================================================
             CONTACT WORKSPACE
          ===================================================== */

          .workspace-grid {
            display: grid;
            grid-template-columns: 0.72fr 1.28fr;
            gap: 18px;
          }

          .info-panel,
          .form-panel {
            background: #06172a;
            border: 1px solid #163e60;
          }

          .info-panel {
            padding: 26px;
          }

          .form-panel {
            padding: 28px;
          }

          .panel-heading {
            display: flex;
            align-items: center;
            gap: 11px;
            padding-bottom: 17px;
            border-bottom: 1px solid #153650;
          }

          .panel-heading-icon {
            color: #2fb6f4;
            font-size: 15px;
          }

          .panel-heading h3 {
            margin: 0;
            color: #eff8fd;
            font-size: 16px;
          }

          .panel-heading span {
            display: block;
            margin-top: 3px;
            color: #66849d;
            font-size: 9px;
          }

          .issue-list {
            margin-top: 20px;
          }

          .issue-item {
            display: flex;
            align-items: flex-start;
            gap: 13px;
            padding: 14px 0;
            border-bottom: 1px solid #102e49;
          }

          .issue-item:last-child {
            border-bottom: 0;
          }

          .issue-icon {
            flex-shrink: 0;
            width: 31px;
            height: 31px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #1a496b;
            background: #09223a;
            color: #4dbef0;
            font-size: 12px;
          }

          .issue-item strong {
            display: block;
            color: #dceaf4;
            font-size: 11px;
            margin-bottom: 4px;
          }

          .issue-item p {
            margin: 0;
            color: #69869e;
            font-size: 9px;
            line-height: 1.6;
          }

          /* =====================================================
             FORM
          ===================================================== */

          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          .form-field {
            margin-bottom: 15px;
          }

          .form-field.full {
            grid-column: 1 / -1;
          }

          .form-label {
            display: block;
            margin-bottom: 7px;
            color: #6f8da5;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .form-input,
          .form-select,
          .form-textarea {
            width: 100%;
            border: 1px solid #1b4568;
            outline: none;
            background: #031323;
            color: #dce9f5;
            font-family: inherit;
            font-size: 11px;
            transition:
              border-color 0.2s ease,
              box-shadow 0.2s ease;
          }

          .form-input,
          .form-select {
            height: 43px;
            padding: 0 12px;
          }

          .form-textarea {
            min-height: 125px;
            resize: vertical;
            padding: 12px;
            line-height: 1.6;
          }

          .form-input:focus,
          .form-select:focus,
          .form-textarea:focus {
            border-color: #238ed1;
            box-shadow: 0 0 0 2px rgba(35, 142, 209, 0.08);
          }

          .form-input::placeholder,
          .form-textarea::placeholder {
            color: #405b71;
          }

          .submit-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            margin-top: 5px;
          }

          .submit-button {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            min-height: 45px;
            padding: 0 20px;
            border: 1px solid #278ed0;
            background: linear-gradient(
              135deg,
              #11649a,
              #087fbe
            );
            color: #ffffff;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.1em;
            cursor: pointer;
            box-shadow: 0 8px 22px rgba(0, 104, 171, 0.15);
          }

          .submit-button:hover {
            background: linear-gradient(
              135deg,
              #1477b1,
              #0794d7
            );
          }

          .submit-note {
            color: #52738e;
            font-size: 8px;
            line-height: 1.5;
            text-align: right;
          }

          .success-message {
            margin-top: 17px;
            padding: 13px 15px;
            border: 1px solid #176b59;
            background: rgba(16, 80, 67, 0.22);
            color: #52e3bc;
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 9px;
          }

          .error-message {
            margin-top: 17px;
            padding: 13px 15px;
            border: 1px solid #7f2632;
            background: rgba(127, 38, 50, 0.16);
            color: #ff8e9b;
            font-size: 10px;
            display: flex;
            align-items: center;
            gap: 9px;
            line-height: 1.6;
          }

          /* =====================================================
             SYSTEM STATUS
          ===================================================== */

          .status-panel {
            padding: 23px;
            background: #06172a;
            border: 1px solid #153d5f;
          }

          .status-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }

          .status-card {
            padding: 15px;
            border: 1px solid #133751;
            background: #041323;
          }

          .status-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 11px;
          }

          .status-name {
            color: #7795ac;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.09em;
            text-transform: uppercase;
          }

          .status-check {
            color: #31e4b0;
            font-size: 10px;
          }

          .status-value {
            color: #e5f3fa;
            font-family: "Courier New", monospace;
            font-size: 11px;
          }

          /* =====================================================
             TECHNICAL NOTE
          ===================================================== */

          .technical-note {
            margin-top: 18px;
            padding: 18px 20px;
            border-left: 3px solid #2089c8;
            background: #06182a;
            border-top: 1px solid #133a59;
            border-right: 1px solid #133a59;
            border-bottom: 1px solid #133a59;
          }

          .technical-note-title {
            display: flex;
            align-items: center;
            gap: 9px;
            color: #dbeaf4;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.07em;
          }

          .technical-note p {
            margin: 8px 0 0;
            color: #69879f;
            font-size: 9px;
            line-height: 1.7;
          }

          /* =====================================================
             FOOTER SYSTEM BAR
          ===================================================== */

          .system-bar {
            margin-top: 45px;
            padding-top: 17px;
            border-top: 1px solid #143650;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            color: #45647e;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.09em;
          }

          /* =====================================================
             RESPONSIVE
          ===================================================== */

          @media (max-width: 1050px) {
            .hero-grid {
              grid-template-columns: 1fr;
            }

            .control-panel {
              max-width: 650px;
            }

            .support-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .architecture-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .workspace-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 700px) {
            .contact-container {
              width: min(100% - 24px, 1380px);
            }

            .contact-hero {
              padding: 50px 0 40px;
            }

            .hero-title {
              font-size: 40px;
            }

            .hero-description {
              font-size: 13px;
            }

            .support-grid,
            .architecture-grid,
            .status-grid {
              grid-template-columns: 1fr;
            }

            .form-grid {
              grid-template-columns: 1fr;
            }

            .form-field.full {
              grid-column: auto;
            }

            .submit-row {
              align-items: flex-start;
              flex-direction: column;
            }

            .submit-note {
              text-align: left;
            }

            .system-bar {
              flex-direction: column;
            }
          }
        `}
      </style>

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="contact-hero">
        <div className="contact-container">
          <div className="hero-grid">

            <div>
              <div className="system-tag">
                <span className="system-dot"></span>
                Technical Support Control Desk
              </div>

              <h1 className="hero-title">
                Connect with the
                <br />
                <span>OR Solver Team.</span>
              </h1>

              <p className="hero-description">
                Need help with an optimization model, solver output,
                graphical analysis, simplex calculations, or one of the
                Operations Research modules? Use this technical workspace
                to report issues, ask academic questions, or provide
                system feedback.
              </p>

              <div className="hero-meta">
                <span className="meta-chip">
                  Solver Support
                </span>

                <span className="meta-chip">
                  Academic Queries
                </span>

                <span className="meta-chip">
                  Technical Feedback
                </span>
              </div>
            </div>

            {/* TERMINAL */}
            <div className="control-panel">
              <div className="panel-label">
                SYSTEM / CONTACT_INTERFACE
              </div>

              <div className="terminal-title">
                OR Smart Solver Console
              </div>

              <div className="terminal-line">
                <span className="terminal-prefix">
                  $
                </span>
                <span>
                  initialize_support_module
                </span>
              </div>

              <div className="terminal-line">
                <span className="terminal-prefix">
                  &gt;
                </span>
                <span className="terminal-success">
                  Support interface online
                </span>
              </div>

              <div className="terminal-line">
                <span className="terminal-prefix">
                  &gt;
                </span>
                <span>
                  Solver engine connection verified
                </span>
              </div>

              <div className="terminal-line">
                <span className="terminal-prefix">
                  &gt;
                </span>
                <span>
                  Academic assistance channel ready
                </span>
              </div>

              <div className="terminal-line">
                <span className="terminal-prefix">
                  &gt;
                </span>
                <span className="terminal-muted">
                  awaiting_user_request...
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="contact-container">

        {/* =========================================================
            SUPPORT CHANNELS
        ========================================================= */}

        <section className="section-block">

          <div className="section-header">
            <div>
              <div className="section-number">
                01 / SUPPORT CHANNELS
              </div>

              <h2 className="section-title">
                How can we help?
              </h2>
            </div>

            <p className="section-description">
              Select the type of assistance that matches your
              Operations Research problem or technical requirement.
            </p>
          </div>

          <div className="support-grid">

            <SupportCard
              icon={<FaBug />}
              title="Report a Technical Issue"
              text="Report solver errors, incorrect outputs, UI problems, graph rendering issues, or unexpected system behaviour."
            />

            <SupportCard
              icon={<FaChartLine />}
              title="Solver Assistance"
              text="Ask about Linear Programming, Graphical Method, Simplex Method, Transportation, or Assignment problems."
            />

            <SupportCard
              icon={<FaGraduationCap />}
              title="Academic Query"
              text="Get clarification about OR concepts, terminology, formulas, methods, and exam-oriented problem solving."
            />

          </div>
        </section>

        {/* =========================================================
            ARCHITECTURE
        ========================================================= */}

        <section className="section-block">

          <div className="section-header">
            <div>
              <div className="section-number">
                02 / TECHNICAL STACK
              </div>

              <h2 className="section-title">
                Solver Architecture
              </h2>
            </div>

            <p className="section-description">
              OR Smart Solver separates the user interface,
              optimization logic, API layer, and visualization
              components into a structured application workflow.
            </p>
          </div>

          <div className="architecture-grid">

            <ArchitectureCard
              icon={<FaReact />}
              name="React + Vite"
              role="Frontend interface, routing, forms and interactive solver screens."
            />

            <ArchitectureCard
              icon={<FaPython />}
              name="Python + Flask"
              role="Backend API layer responsible for processing optimization requests."
            />

            <ArchitectureCard
              icon={<FaCogs />}
              name="OR Algorithms"
              role="Optimization logic for LPP, Transportation and Assignment modules."
            />

            <ArchitectureCard
              icon={<FaChartLine />}
              name="Chart.js"
              role="Graphical visualization of constraints, feasible regions and solutions."
            />

          </div>
        </section>

        {/* =========================================================
            CONTACT WORKSPACE
        ========================================================= */}

        <section className="section-block">

          <div className="section-header">
            <div>
              <div className="section-number">
                03 / SUPPORT WORKSPACE
              </div>

              <h2 className="section-title">
                Submit a technical request
              </h2>
            </div>

            <p className="section-description">
              Provide enough information to make the problem
              reproducible and easier to analyse.
            </p>
          </div>

          <div className="workspace-grid">

            {/* LEFT INFO */}
            <div className="info-panel">

              <div className="panel-heading">
                <FaHeadset className="panel-heading-icon" />

                <div>
                  <h3>Technical Support Desk</h3>
                  <span>
                    Recommended information for troubleshooting
                  </span>
                </div>
              </div>

              <div className="issue-list">

                <IssueItem
                  icon={<FaCode />}
                  title="For solver errors"
                  text="Mention the module, method, objective function and constraints that produced the issue."
                />

                <IssueItem
                  icon={<FaTerminal />}
                  title="For calculation issues"
                  text="Include the expected result and the step or iteration where the calculation differs."
                />

                <IssueItem
                  icon={<FaChartLine />}
                  title="For graph issues"
                  text="Mention whether the problem occurs with constraints, feasible region, corner points or optimal point."
                />

                <IssueItem
                  icon={<FaBookOpen />}
                  title="For academic queries"
                  text="Mention the OR topic, method or numerical problem that requires explanation."
                />

              </div>

            </div>

            {/* FORM */}
            <div className="form-panel">

              <div className="panel-heading">
                <FaPaperPlane className="panel-heading-icon" />

                <div>
                  <h3>Request Information</h3>
                  <span>
                    Technical and academic support form
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>

                <div className="form-grid">

                  <div className="form-field">
                    <label className="form-label">
                      Your Name
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={(e) =>
                        handleChange("name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Email Address
                    </label>

                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Request Category
                    </label>

                    <select
                      className="form-select"
                      value={form.category}
                      onChange={(e) =>
                        handleChange("category", e.target.value)
                      }
                    >
                      <option>
                        Technical Issue
                      </option>

                      <option>
                        Solver Assistance
                      </option>

                      <option>
                        Academic Query
                      </option>

                      <option>
                        UI / UX Feedback
                      </option>

                      <option>
                        General Feedback
                      </option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Subject
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      placeholder="Briefly describe the issue"
                      value={form.subject}
                      onChange={(e) =>
                        handleChange("subject", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="form-field full">
                    <label className="form-label">
                      Technical Details / Message
                    </label>

                    <textarea
                      className="form-textarea"
                      placeholder="Describe the problem, OR question, calculation, expected result or feedback..."
                      value={form.message}
                      onChange={(e) =>
                        handleChange("message", e.target.value)
                      }
                      required
                    />
                  </div>

                </div>

                <div className="submit-row">

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={sending}
                    style={{
                      opacity: sending ? 0.65 : 1,
                      cursor: sending ? "not-allowed" : "pointer",
                    }}
                  >
                    {sending ? "SENDING..." : "SEND REQUEST"}
                    {!sending && <FaArrowRight />}
                  </button>

                  <div className="submit-note">
                    Include model details when reporting
                    <br />
                    solver or calculation issues.
                  </div>

                </div>

                {submitted && (
                  <div className="success-message">
                    <FaCheckCircle />
                    Request recorded successfully. Thank you for
                    providing technical feedback.
                  </div>
                )}

                {submitError && (
                  <div className="error-message">
                    <FaExclamationTriangle />
                    {submitError}
                  </div>
                )}

              </form>

            </div>

          </div>
        </section>

        {/* =========================================================
            SYSTEM STATUS
        ========================================================= */}

        <section className="section-block">

          <div className="section-header">
            <div>
              <div className="section-number">
                04 / SYSTEM MONITOR
              </div>

              <h2 className="section-title">
                Platform Status
              </h2>
            </div>

            <p className="section-description">
              Current application components available in the
              OR Smart Solver interface.
            </p>
          </div>

          <div className="status-panel">

            <div className="status-grid">

              <StatusCard
                name="Frontend"
                value="React / Vite"
              />

              <StatusCard
                name="Backend"
                value="Flask API"
              />

              <StatusCard
                name="Optimization"
                value="OR Engine"
              />

              <StatusCard
                name="Visualization"
                value="Chart.js"
              />

            </div>

            <div className="technical-note">

              <div className="technical-note-title">
                <FaNetworkWired />
                TECHNICAL INFORMATION
              </div>

              <p>
                The application follows a frontend-backend architecture.
                The React interface collects the optimization model,
                sends the required data to the Flask API, receives the
                solver response, and presents the result using tables,
                calculations and graphical visualizations.
              </p>

            </div>

          </div>

        </section>

        {/* =========================================================
            SYSTEM BAR
        ========================================================= */}

        <div className="system-bar">

          <span>
            OR SMART SOLVER / TECHNICAL SUPPORT
          </span>

          <span>
            OPTIMIZATION â€¢ ANALYSIS â€¢ LEARNING
          </span>

          <span>
            STATUS: OPERATIONAL
          </span>

        </div>

      </div>
    </div>
  );
}

/* ===============================================================
   SUPPORT CARD
=============================================================== */

function SupportCard({ icon, title, text }) {
  return (
    <div className="support-card">

      <div className="support-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <div className="support-arrow">
        <FaArrowRight />
      </div>

    </div>
  );
}

/* ===============================================================
   ARCHITECTURE CARD
=============================================================== */

function ArchitectureCard({ icon, name, role }) {
  return (
    <div className="architecture-card">

      <div className="architecture-icon">
        {icon}
      </div>

      <div className="architecture-name">
        {name}
      </div>

      <div className="architecture-role">
        {role}
      </div>

      <div className="architecture-status">
        <FaCheckCircle />
        ACTIVE COMPONENT
      </div>

    </div>
  );
}

/* ===============================================================
   ISSUE ITEM
=============================================================== */

function IssueItem({ icon, title, text }) {
  return (
    <div className="issue-item">

      <div className="issue-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

    </div>
  );
}

/* ===============================================================
   STATUS CARD
=============================================================== */

function StatusCard({ name, value }) {
  return (
    <div className="status-card">

      <div className="status-top">

        <span className="status-name">
          {name}
        </span>

        <FaCheckCircle className="status-check" />

      </div>

      <div className="status-value">
        {value}
      </div>

    </div>
  );
}

export default Contact;
