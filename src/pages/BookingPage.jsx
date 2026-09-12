import Navbar from "../components/Navbar";
import Booking from "../components/Booking";
import Footer from "../components/Footer";

export default function BookingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Booking />
      </main>
      <Footer />
    </>
  );
}