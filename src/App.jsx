import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import LinearProgramming from "./pages/LinearProgramming";
import Transportation from "./pages/Transportation";
import Assignment from "./pages/Assignment";
import Result from "./pages/Result";
import Contact from "./pages/Contact";
import Learn from "./pages/Learn";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <BrowserRouter>
      <div className={darkMode ? "dark-mode" : ""}>
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />

            <Route
              path="/linear-programming"
              element={<LinearProgramming />}
            />

            <Route
              path="/transportation"
              element={<Transportation />}
            />

            <Route
              path="/assignment"
              element={<Assignment />}
            />

            <Route path="/result" element={<Result />} />
            <Route path="/contact" element={<Contact />} />

            {/* Learning Hub */}
            <Route path="/learn" element={<Learn />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;