import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import About from "./components/About";
import Gallery from "./components/Gallery";
import CtaBanner from "./components/CtaBanner";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import FloatingBookButton from "./components/FloatingBookButton";
import Admin from "./pages/Admin";
import BookingPage from "./pages/BookingPage";
import PriceListPage from "./pages/PriceListPage";
import WorksPage from "./pages/WorksPage";

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
        <HowItWorks />
        <About />
        <Gallery preview />
        <CtaBanner />
        <Contact />
      </main>
      <Footer />
      <FloatingBookButton />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/price" element={<PriceListPage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;