import { NavLink } from "react-router-dom";
import {
  FaChartLine,
  FaMoon,
  FaSun,
  FaHome,
  FaBookOpen,
  FaCode,
  FaTruck,
  FaClipboardList,
  FaEnvelope,
} from "react-icons/fa";

function Navbar({ darkMode, setDarkMode }) {
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <FaHome />,
    },
    {
      name: "About",
      path: "/about",
      icon: <FaBookOpen />,
    },
    {
      name: "Learn",
      path: "/learn",
      icon: <FaBookOpen />,
    },
    {
      name: "Linear Programming",
      path: "/linear-programming",
      icon: <FaCode />,
    },
    {
      name: "Transportation",
      path: "/transportation",
      icon: <FaTruck />,
    },
    {
      name: "Assignment",
      path: "/assignment",
      icon: <FaClipboardList />,
    },
    {
      name: "Contact",
      path: "/contact",
      icon: <FaEnvelope />,
    },
  ];

  return (
    <>
      <style>
        {`
          .or-navbar {
            position: sticky;
            top: 0;
            z-index: 9999;
            width: 100%;
            background:
              linear-gradient(
                90deg,
                #031126 0%,
                #061a35 45%,
                #041329 100%
              );
            border-bottom: 1px solid rgba(56, 189, 248, 0.28);
            box-shadow:
              0 8px 30px rgba(0, 0, 0, 0.28),
              inset 0 -1px 0 rgba(56, 189, 248, 0.08);
          }

          .or-navbar::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: -1px;
            height: 1px;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(14, 165, 233, 0.65),
              transparent
            );
            pointer-events: none;
          }

          .or-nav-container {
            max-width: 1480px;
            min-height: 78px;
            margin: auto;
            padding: 0 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 25px;
          }

          /* ================= BRAND ================= */

          .or-brand {
            display: flex;
            align-items: center;
            gap: 13px;
            text-decoration: none;
            min-width: 245px;
          }

          .or-logo {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 22px;
            background:
              linear-gradient(
                135deg,
                #2563eb,
                #0ea5e9
              );
            border: 1px solid rgba(125, 211, 252, 0.45);
            box-shadow:
              0 0 22px rgba(14, 165, 233, 0.22),
              inset 0 1px 0 rgba(255,255,255,0.18);
          }

          .or-brand-content {
            display: flex;
            flex-direction: column;
            line-height: 1;
          }

          .or-brand-title {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.03em;
            color: #f8fafc;
            white-space: nowrap;
          }

          .or-brand-title span {
            color: #2196f3;
          }

          .or-brand-tagline {
            margin-top: 7px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #7894b2;
          }

          /* ================= NAVIGATION ================= */

          .or-nav-links {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 4px;
            flex: 1;
          }

          .or-nav-link {
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
            min-height: 43px;
            padding: 0 14px;
            border-radius: 22px;
            color: #c5d3e3;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
            transition:
              background 0.2s ease,
              color 0.2s ease,
              transform 0.2s ease;
          }

          .or-nav-link svg {
            font-size: 14px;
            color: #7ea4c7;
            transition: color 0.2s ease;
          }

          .or-nav-link:hover {
            color: #ffffff;
            background: rgba(37, 99, 235, 0.14);
            transform: translateY(-1px);
          }

          .or-nav-link:hover svg {
            color: #38bdf8;
          }

          /* ================= ACTIVE ================= */

          .or-nav-link.active {
            color: #ffffff;
            background:
              linear-gradient(
                135deg,
                rgba(37, 99, 235, 0.95),
                rgba(14, 165, 233, 0.85)
              );
            box-shadow:
              0 6px 20px rgba(14, 116, 214, 0.25),
              inset 0 1px 0 rgba(255,255,255,0.16);
          }

          .or-nav-link.active svg {
            color: #ffffff;
          }

          .or-nav-link.active::after {
            content: "";
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: -18px;
            width: 42px;
            height: 3px;
            border-radius: 4px;
            background: #22b8ff;
            box-shadow: 0 0 12px rgba(34, 184, 255, 0.8);
          }

          /* ================= THEME BUTTON ================= */

          .or-theme-button {
            width: 48px;
            height: 48px;
            flex-shrink: 0;
            margin-left: 8px;
            border: 1px solid rgba(148, 163, 184, 0.12);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.06);
            color: #f8fafc;
            font-size: 18px;
            cursor: pointer;
            transition:
              background 0.2s ease,
              border-color 0.2s ease,
              transform 0.2s ease;
          }

          .or-theme-button:hover {
            background: rgba(37, 99, 235, 0.2);
            border-color: rgba(56, 189, 248, 0.35);
            transform: rotate(8deg);
          }

          /* ================= MOBILE ================= */

          .or-mobile-toggle {
            display: none;
            width: 44px;
            height: 42px;
            border: 1px solid #24476c;
            border-radius: 7px;
            background: #071b34;
            color: #cfe5f7;
            font-size: 20px;
          }

          @media (max-width: 1250px) {
            .or-nav-container {
              padding: 0 18px;
            }

            .or-brand {
              min-width: 220px;
            }

            .or-brand-title {
              font-size: 20px;
            }

            .or-nav-link {
              padding: 0 9px;
              font-size: 11px;
            }

            .or-nav-link svg {
              font-size: 12px;
            }
          }

          @media (max-width: 1050px) {
            .or-brand-tagline {
              display: none;
            }

            .or-nav-link {
              padding: 0 7px;
            }

            .or-nav-link svg {
              display: none;
            }
          }

          @media (max-width: 900px) {
            .or-nav-container {
              min-height: 70px;
              flex-wrap: wrap;
            }

            .or-mobile-toggle {
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            }

            .or-nav-links {
              display: none;
              width: 100%;
              flex-direction: column;
              align-items: stretch;
              padding: 10px 0 16px;
              border-top: 1px solid rgba(56, 189, 248, 0.12);
            }

            .or-nav-links.open {
              display: flex;
            }

            .or-nav-link {
              min-height: 46px;
              border-radius: 7px;
              padding: 0 14px;
            }

            .or-nav-link.active::after {
              display: none;
            }

            .or-nav-link svg {
              display: block;
            }

            .or-theme-button {
              position: absolute;
              right: 68px;
              top: 13px;
              width: 43px;
              height: 43px;
            }
          }
        `}
      </style>

      <nav className="or-navbar">
        <div className="or-nav-container">

          {/* BRAND */}
          <NavLink to="/" className="or-brand">
            <div className="or-logo">
              <FaChartLine />
            </div>

            <div className="or-brand-content">
              <div className="or-brand-title">
                OR <span>Smart Solver</span>
              </div>

              <div className="or-brand-tagline">
                Solve&nbsp;&nbsp;•&nbsp;&nbsp;Analyze&nbsp;&nbsp;•&nbsp;&nbsp;Learn
              </div>
            </div>
          </NavLink>

          {/* MOBILE BUTTON */}
          <button
            className="or-mobile-toggle"
            type="button"
            onClick={() => {
              const menu = document.querySelector(".or-nav-links");
              menu?.classList.toggle("open");
            }}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          {/* NAVIGATION */}
          <div className="or-nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `or-nav-link ${isActive ? "active" : ""}`
                }
                end={item.path === "/"}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          {/* THEME */}
          <button
            className="or-theme-button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

        </div>
      </nav>
    </>
  );
}

export default Navbar;