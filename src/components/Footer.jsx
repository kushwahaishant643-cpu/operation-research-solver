import React from "react";

const Footer = () => {
  return (
    <footer className="or-footer">
      <div className="footer-glow"></div>

      <div className="footer-main">

        {/* ================= BRAND ================= */}
        <div className="footer-brand">
          <div className="footer-brand-title">
            <div className="footer-logo">
              <span>OR</span>
            </div>

            <div className="footer-brand-name">
              <span>OR</span> Smart Solver
            </div>
          </div>

          <p className="footer-description">
            A smart learning and solving platform designed to help
            B.Sc. IT students understand and solve Operation Research
            problems with clarity and confidence.
          </p>

          <div className="footer-accent-line"></div>
        </div>

        {/* ================= QUICK LINKS ================= */}
        <div className="footer-column">
          <div className="footer-heading">
            <span className="heading-icon">↗</span>
            <span>Quick Links</span>
          </div>

          <div className="footer-links">
            <a href="/" className="footer-link">
              <span>Home</span>
              <span className="arrow">›</span>
            </a>

            <a href="/about" className="footer-link">
              <span>About</span>
              <span className="arrow">›</span>
            </a>

            <a href="/contact" className="footer-link">
              <span>Contact</span>
              <span className="arrow">›</span>
            </a>
          </div>
        </div>

        {/* ================= OR MODULES ================= */}
        <div className="footer-column">
          <div className="footer-heading">
            <span className="heading-icon">⚙</span>
            <span>OR Modules</span>
          </div>

          <div className="footer-links">

            <a
              href="/linear-programming"
              className="footer-link"
            >
              <span>Linear Programming</span>
              <span className="arrow">›</span>
            </a>

            <a
              href="/transportation"
              className="footer-link"
            >
              <span>Transportation Problem</span>
              <span className="arrow">›</span>
            </a>

            <a
              href="/assignment"
              className="footer-link"
            >
              <span>Assignment Problem</span>
              <span className="arrow">›</span>
            </a>

          </div>
        </div>

        {/* ================= CONNECT ================= */}
        <div className="footer-column footer-connect">
          <div className="footer-heading">
            <span className="heading-icon">➤</span>
            <span>Connect</span>
          </div>

          <div className="social-buttons">

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-button"
              aria-label="GitHub"
            >
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.01c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.72-1.53-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.04.77 2.1v3.11c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-button"
              aria-label="LinkedIn"
            >
              <svg
                width="27"
                height="27"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5Z" />
                <path d="M.5 8h4V23h-4V8Z" />
                <path d="M8 8h3.83v2.05h.05c.53-1.01 1.83-2.55 3.77-2.55 4.03 0 4.77 2.65 4.77 6.1V23h-4v-8.3c0-1.98-.04-4.52-2.75-4.52-2.75 0-3.17 2.15-3.17 4.37V23H8V8Z" />
              </svg>
            </a>

          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="footer-bottom">

        <div className="footer-bottom-left">
          <span className="copyright-icon">©</span>
          <span>
            2026 OR Smart Solver. All rights reserved.
          </span>
        </div>

        <div className="footer-bottom-right">
          <span>B.Sc. IT</span>
          <span className="footer-dot">•</span>
          <span>Operation Research</span>
        </div>

      </div>

      {/* ================= DECORATIVE CIRCUITS ================= */}
      <div className="circuit circuit-left">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="circuit circuit-right">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* ================= STYLES ================= */}
      <style>{`

        /* =========================================
           MAIN FOOTER
        ========================================= */

        .or-footer {
          position: relative;
          width: 100%;
          overflow: hidden;

          background:
            radial-gradient(
              circle at 12% 20%,
              rgba(0, 183, 255, 0.10),
              transparent 28%
            ),
            radial-gradient(
              circle at 88% 20%,
              rgba(0, 214, 255, 0.07),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #03152d 0%,
              #061c38 50%,
              #03152d 100%
            );

          color: #dbeafe;

          font-family:
            Inter,
            "Segoe UI",
            Arial,
            sans-serif;
        }


        /* =========================================
           BACKGROUND GLOW
        ========================================= */

        .footer-glow {
          position: absolute;

          top: -120px;
          left: 50%;

          transform: translateX(-50%);

          width: 700px;
          height: 250px;

          background:
            rgba(0, 183, 255, 0.08);

          filter: blur(80px);

          pointer-events: none;
        }


        /* =========================================
           MAIN GRID
        ========================================= */

        .footer-main {
          position: relative;
          z-index: 2;

          max-width: 1500px;

          margin: 0 auto;

          padding:
            72px
            70px
            66px;

          display: grid;

          grid-template-columns:
            1.45fr
            0.9fr
            1.05fr
            0.75fr;
        }


        /* =========================================
           BRAND
        ========================================= */

        .footer-brand {
          padding-right: 65px;
        }


        .footer-brand-title {
          display: flex;

          align-items: center;

          gap: 22px;

          margin-bottom: 28px;
        }


        .footer-logo {
          width: 62px;
          height: 62px;

          border-radius: 13px;

          display: flex;

          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              145deg,
              #147cff,
              #08bde9
            );

          box-shadow:
            0 0 24px
            rgba(0, 174, 255, 0.28),

            inset 0 1px 0
            rgba(255,255,255,0.2);
        }


        .footer-logo span {
          color: white;

          font-size: 20px;

          font-weight: 900;

          letter-spacing: 1px;
        }


        .footer-brand-name {
          font-size: 32px;

          font-weight: 800;

          letter-spacing: -0.8px;

          color: #f1f7ff;
        }


        .footer-brand-name span {
          color: #2583ff;
        }


        .footer-description {
          max-width: 535px;

          margin: 0;

          color: #b9cde3;

          font-size: 17px;

          line-height: 1.75;
        }


        .footer-accent-line {
          width: 122px;
          height: 7px;

          margin-top: 28px;

          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #1688ff,
              #08d9e9
            );

          box-shadow:
            0 0 15px
            rgba(0, 201, 255, 0.45);
        }


        /* =========================================
           COLUMNS
        ========================================= */

        .footer-column {
          padding: 0 38px;

          border-left:
            1px solid
            rgba(83, 137, 190, 0.32);
        }


        /* =========================================
           HEADINGS
        ========================================= */

        .footer-heading {
          display: flex;

          align-items: center;

          gap: 14px;

          margin-bottom: 30px;

          font-size: 22px;

          font-weight: 750;

          color: #f4f8ff;
        }


        .heading-icon {
          color: #169bff;

          font-size: 25px;

          font-weight: 800;

          filter:
            drop-shadow(
              0 0 7px
              rgba(0, 174, 255, 0.35)
            );
        }


        /* =========================================
           LINKS
        ========================================= */

        .footer-links {
          display: flex;

          flex-direction: column;

          gap: 5px;
        }


        .footer-link {
          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 10px 0;

          color: #b9cde3;

          text-decoration: none;

          font-size: 17px;

          transition:
            color 0.25s ease,
            padding-left 0.25s ease;
        }


        .footer-link .arrow {
          color: #119cff;

          font-size: 29px;

          line-height: 0;

          opacity: 0;

          transform:
            translateX(-8px);

          transition:
            opacity 0.25s ease,
            transform 0.25s ease;
        }


        .footer-link:hover {
          color: #ffffff;

          padding-left: 7px;
        }


        .footer-link:hover .arrow {
          opacity: 1;

          transform:
            translateX(0);
        }


        /* =========================================
           CONNECT
        ========================================= */

        .footer-connect {
          padding-left: 55px;
        }


        .social-buttons {
          display: flex;

          gap: 22px;
        }


        .social-button {
          width: 74px;
          height: 74px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          color: #e9f7ff;

          border:
            1.5px solid
            #169cff;

          background:
            radial-gradient(
              circle,
              rgba(16, 151, 255, 0.14),
              rgba(0, 35, 65, 0.5)
            );

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            background 0.3s ease;
        }


        .social-button:hover {
          transform:
            translateY(-5px);

          background:
            radial-gradient(
              circle,
              rgba(16, 151, 255, 0.28),
              rgba(0, 45, 80, 0.8)
            );

          box-shadow:
            0 0 24px
            rgba(0, 180, 255, 0.35);
        }


        /* =========================================
           BOTTOM BAR
        ========================================= */

        .footer-bottom {
          position: relative;

          z-index: 3;

          min-height: 78px;

          padding:
            0 8%;

          display: flex;

          align-items: center;

          justify-content: space-between;

          border-top:
            1px solid
            rgba(0, 174, 255, 0.65);

          background:
            linear-gradient(
              90deg,
              rgba(0, 15, 35, 0.55),
              rgba(0, 30, 60, 0.42),
              rgba(0, 15, 35, 0.55)
            );

          color: #b8cce1;

          font-size: 16px;
        }


        .footer-bottom-left,
        .footer-bottom-right {
          display: flex;

          align-items: center;

          gap: 11px;
        }


        .copyright-icon {
          width: 30px;
          height: 30px;

          display: flex;

          align-items: center;
          justify-content: center;

          border:
            1px solid
            #129fff;

          border-radius: 50%;

          color: #129fff;

          font-size: 16px;

          font-weight: 700;
        }


        .footer-dot {
          color: #12c9ed;

          font-size: 21px;
        }


        /* =========================================
           CIRCUIT DECORATION
        ========================================= */

        .circuit {
          position: absolute;

          bottom: 0;

          width: 145px;
          height: 70px;

          opacity: 0.6;

          pointer-events: none;
        }


        .circuit-left {
          left: 0;
        }


        .circuit-right {
          right: 0;

          transform:
            scaleX(-1);
        }


        .circuit span {
          position: absolute;

          display: block;

          border-top:
            2px solid
            rgba(0, 159, 255, 0.5);

          border-right:
            2px solid
            rgba(0, 159, 255, 0.5);
        }


        .circuit span:nth-child(1) {
          width: 90px;
          height: 40px;

          left: -10px;
          bottom: 0;
        }


        .circuit span:nth-child(2) {
          width: 55px;
          height: 22px;

          left: 28px;
          bottom: 0;
        }


        .circuit span:nth-child(3) {
          width: 20px;
          height: 8px;

          left: 74px;
          bottom: 0;
        }


        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 1050px) {

          .footer-main {
            grid-template-columns:
              1fr 1fr;

            row-gap: 50px;
          }


          .footer-brand {
            padding-right: 30px;
          }


          .footer-column:nth-child(3) {
            border-left: none;
          }
        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 700px) {

          .footer-main {
            grid-template-columns: 1fr;

            padding:
              50px
              25px;

            gap: 40px;
          }


          .footer-brand {
            padding-right: 0;
          }


          .footer-column,
          .footer-connect {
            padding:
              25px 0 0;

            border-left: none;

            border-top:
              1px solid
              rgba(83, 137, 190, 0.32);
          }


          .footer-bottom {
            padding:
              22px 25px;

            flex-direction: column;

            gap: 14px;

            text-align: center;
          }


          .footer-brand-name {
            font-size: 26px;
          }


          .footer-description {
            font-size: 15px;
          }
        }

      `}</style>
    </footer>
  );
};

export default Footer;