import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Gallery from "../components/Gallery";
import ShareLinks from "../components/ShareLinks";

export default function WorksPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <ShareLinks
          title="ผลงานทำเล็บจริงจากร้าน Nail & Salon ดูไอเดียลายเล็บได้เลย 💅"
          path="/works"
          className="pt-6"
        />
        <Gallery />
      </main>
      <Footer />
    </>
  );
}