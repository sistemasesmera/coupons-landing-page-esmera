// src/components/Navbar.tsx
import logo from "../assets/esmeralogo.png";

const Navbar = () => {
  return (
    <div className="bg-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Logo centrado y responsivo */}
        <a href="https://www.esmeraschool.com/">
          <img src={logo} alt="Logo Esmera" className="w-32 sm:w-40 md:w-48" />
        </a>
      </div>
    </div>
  );
};

export default Navbar;
