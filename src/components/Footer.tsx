import React from "react";
import { FaFacebook, FaInstagram } from "react-icons/fa"; // Icono de Instagram

const Footer: React.FC = () => {
  return (
    <div className="bg-[#182033] text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center">
          {/* Sección central: Información de derechos reservados */}
          <div className="mb-4 text-center">
            <p className="text-sm">
              &copy; 2024 Esmera School. Todos los derechos reservados.
            </p>
          </div>

          {/* Información de contacto */}
          <div className="mb-4 text-center">
            <p className="text-sm">
              Teléfono:{" "}
              <a href="tel:+34637208352" className="hover:text-gray-300">
                +34 637 208 352
              </a>
            </p>
            <p className="text-sm">
              Email:{" "}
              <a
                href="mailto:admin@esmeraschool.com"
                className="hover:text-gray-300"
              >
                admin@esmeraschool.com
              </a>
            </p>
          </div>

          {/* Sección de redes sociales */}
          <div className="flex justify-center gap-6">
            <a
              href="https://instagram.com/esmeraformacion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-3xl text-[#C13584] hover:text-[#E1306C]"
            >
              <FaInstagram />
            </a>
            <a
            href="https://facebook.com/esmeraschoolOficial"
            target="_blank"
            rel="noopener noreferrer"
            className="text-3xl text-[#1877F2] hover:text-[#3b5998]"
          >
            <FaFacebook />
          </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
