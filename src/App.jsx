import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Gallery from "./components/Gallery";
import Reviews from "./components/Reviews";
import About from "./components/About";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Admin from "./pages/Admin";
import BookingPage from "./pages/BookingPage";

function HomePage() {
  const location = useLocation();
  const scrollTo = location.state?.scrollTo;

  useEffect(() => {
    if (scrollTo) {
      setTimeout(
        () => document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" }),
        0
      );
    }
  }, [scrollTo]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Gallery />
        <Reviews />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;