// src/App.tsx
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Form from "./components/CouponForm";

const App = () => {
  return (
    <div>
      <Navbar /> {/* Navbar con el logo */}
      <main className="py-10 px-4 ">
        {/* Sección principal de la landing page */}
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Genera tu cupón de descuento ahora!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Ingresa tus datos en el formulario y obtén un cupón exclusivo para
            acceder a increíbles descuentos en nuestros cursos. ¡No te lo
            pierdas!
          </p>
        </div>

        {/* Formulario */}
        <Form />
      </main>
      <Footer />
    </div>
  );
};

export default App;
