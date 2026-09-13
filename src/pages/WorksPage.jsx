import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Gallery from "../components/Gallery";

export default function WorksPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <Gallery />
      </main>
      <Footer />
    </>
  );
}