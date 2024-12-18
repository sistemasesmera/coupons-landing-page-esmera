import React, { useState, useEffect } from "react";
import axios from "axios";
import cuponesmera100 from "../assets/cuponesmera100.png";
import cuponesmera150 from "../assets/cuponesmera150.png";
import cuponesmera200 from "../assets/cuponesmera200.png";
import { AiOutlineDownload } from "react-icons/ai";
import { jsPDF } from "jspdf"; // Importar jsPDF

// Definir los tipos para las campañas y la respuesta de la API
interface Campaign {
  campaignCode: string;
  courseName: string;
}

interface CouponResponse {
  couponCode: string;
  email: string;
  name: string;
  phone: string;
  campaign: {
    id: string;
    campaignCode: string;
    courseName: string;
    discountAmount: number;
    expirationDate: string;
  };
}

const CouponForm: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCampaignLoading, setIsCampaignLoading] = useState<boolean>(true);
  const [couponData, setCouponData] = useState<CouponResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<any>({});

  // Obtener campañas desde la API
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get<Campaign[]>(
          "https://esmera-manager-backend.onrender.com/coupons/campaigns"
        );
        setCampaigns(response.data);
      } catch (error: any) {
        setErrorMessage("Hubo un problema al cargar las campañas.");
      } finally {
        setIsCampaignLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  // Validaciones de los campos
  const validateForm = () => {
    console.log(isCampaignLoading);
    const errors: any = {};
    if (!name.trim()) {
      errors.name = "El nombre es obligatorio";
    }

    if (!email.trim()) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "El correo electrónico no es válido";
    }

    if (!phone.trim()) {
      errors.phone = "El teléfono es obligatorio";
    } else if (!/^\d+$/.test(phone)) {
      errors.phone = "El teléfono debe contener solo números";
    }

    if (!selectedCampaign) {
      errors.campaign = "Selecciona un curso";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambios en los campos de entrada y eliminar errores
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Limpiar el error del campo que está siendo modificado
    setValidationErrors((prevErrors: any) => {
      const newErrors = { ...prevErrors };
      delete newErrors[name]; // Eliminar el error del campo modificado
      return newErrors;
    });

    // Actualizar el valor del campo correspondiente
    if (name === "name") setName(value);
    if (name === "email") setEmail(value);
    if (name === "phone") setPhone(value);
    if (name === "campaign") setSelectedCampaign(value);
  };

  // Enviar formulario para la creación del cupón
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // Limpiar el mensaje de error

    // Validar formulario antes de enviar
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post<CouponResponse>(
        "https://esmera-manager-backend.onrender.com/coupons/generate",
        {
          name,
          email,
          phone,
          campaignCode: selectedCampaign,
        }
      );

      if (response.status === 201) {
        setCouponData(response.data); // Almacenar los datos del cupón generado
      } else {
        setErrorMessage("No se pudo generar el cupón. Intenta nuevamente.");
      }
    } catch (error) {
      // Aquí tipamos el error como AxiosError
      if (axios.isAxiosError(error)) {
        // Ahora podemos acceder a error.response y otras propiedades de AxiosError
        console.log(error.response?.data.message);

        if (
          error.response?.data.message ===
          "Coupon with this email already exists"
        ) {
          setErrorMessage(
            "Ya has generado un cupón con este correo electrónico."
          );
          return;
        }
        setErrorMessage("Hubo un error al generar el cupón.");
      } else {
        // En caso de que el error no sea un AxiosError
        setErrorMessage("Ocurrió un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Generar PDF con los datos del cupón y la imagen
  const generatePDF = () => {
    if (!couponData) return;

    const doc = new jsPDF();

    // Título del cupón
    doc.setFontSize(20);
    doc.text(`CUPON DE ${couponData.name.toLocaleUpperCase()}`, 10, 20);

    // Detalles del cupón
    doc.setFontSize(12);
    doc.text(`Nombre: ${couponData.name}`, 10, 30);
    doc.text(`Correo: ${couponData.email}`, 10, 35);
    doc.text(`Teléfono: ${couponData.phone}`, 10, 40);
    doc.text(`Curso de interes: ${couponData.campaign.courseName}`, 10, 45);
    doc.text(`Valor del CUPON: ${couponData.campaign.discountAmount}€`, 10, 50);

    // Código del cupón
    doc.setFontSize(14);
    doc.text("Código de Cupón:", 10, 60);
    doc.setFontSize(20);
    doc.setTextColor(75, 0, 130); // Color para el código
    doc.text(couponData.couponCode, 10, 70);

    // Fecha de expiración
    const expirationDate = new Date(couponData.campaign.expirationDate);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Restaurar color
    doc.text(`Válido hasta: ${expirationDate.toLocaleDateString()}`, 10, 80);

    // Seleccionar la imagen correcta según el descuento
    const imageSrc =
      couponData.campaign.discountAmount === 200
        ? cuponesmera200
        : couponData.campaign.discountAmount === 150
        ? cuponesmera150
        : cuponesmera100;

    // Crear una nueva imagen para cargar y convertirla a base64
    const image = new Image();
    image.src = imageSrc;

    // Esperar a que la imagen cargue antes de agregarla al PDF
    image.onload = () => {
      // Dibujar la imagen en el PDF
      doc.addImage(image, "PNG", 10, 90, 180, 100); // Ajustar tamaño y posición de la imagen
      // Guardar el PDF con el nombre del cupón
      doc.save(`${couponData.couponCode}_cupon.pdf`);
    };

    // Manejar errores en la carga de la imagen
    image.onerror = () => {
      console.error("Error al cargar la imagen. No se incluirá en el PDF.");
      // Guardar el PDF incluso si la imagen falla
      doc.save(`${couponData.couponCode}_cupon.pdf`);
    };
  };

  // Cerrar el modal
  const handleCloseModal = () => {
    setCouponData(null); // Resetear el estado del cupón
    setName("");
    setEmail("");
    setPhone("");
    setSelectedCampaign("");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {validationErrors.name && (
            <p className="text-red-500 text-xs">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Correo
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {validationErrors.email && (
            <p className="text-red-500 text-xs">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <input
            type="text"
            name="phone"
            value={phone}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-xs">{validationErrors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Curso
          </label>
          <select
            name="campaign"
            value={selectedCampaign}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="">Seleccionar un curso</option>
            {campaigns.map((campaign) => (
              <option key={campaign.campaignCode} value={campaign.campaignCode}>
                {campaign.courseName}
              </option>
            ))}
          </select>
          {validationErrors.campaign && (
            <p className="text-red-500 text-xs">{validationErrors.campaign}</p>
          )}
        </div>

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            <p className="text-center text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="mt-4 flex items-center">
          <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
            Al enviar este formulario, usted acepta nuestra{" "}
            <a
              target="_blank"
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Política de Términos de Servicio
            </a>{" "}
            y{" "}
            <a
              target="_blank"
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Política de Privacidad
            </a>
            .
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? "Generando..." : "Generar Cupón"}
        </button>
      </form>

      {/* Modal de éxito */}
      {couponData && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-lg mx-auto relative">
            {/* Botón de cierre */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition duration-300 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
              🎉 ¡Felicidades, {couponData.name.toUpperCase()}!
            </h2>

            {/* Cupón Details */}
            <div className="text-center">
              <p className="text-lg text-gray-700">
                Tienes un cupón de{" "}
                <span className="text-green-500 font-bold text-xl">
                  {couponData.campaign.discountAmount}€
                </span>
              </p>
            </div>

            {/* Código del Cupón */}
            <div className="text-center">
              <p className="text-base font-semibold text-gray-800">
                Tu Código de Cupón es:{" "}
                <span className="text-indigo-600 font-extrabold text-xl">
                  {couponData.couponCode}
                </span>
              </p>
            </div>

            {/* Fecha de Validez */}
            <div className="mt-2 text-center text-sm text-gray-500">
              <p>
                Válido hasta el{" "}
                <span className="font-semibold">
                  {new Date(
                    couponData.campaign.expirationDate
                  ).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>

            {/* Información del correo electrónico */}
            <div className="mt-4 text-center text-gray-600">
              <p className="text-sm">
                Hemos enviado los detalles a tu correo electrónico:{" "}
                <span className="font-medium">{couponData.email}</span>.
              </p>
            </div>

            {/* Imagen del Cupón */}
            <div className="mt-4 flex justify-center relative">
              <img
                src={
                  couponData.campaign.discountAmount === 200
                    ? cuponesmera200
                    : couponData.campaign.discountAmount === 150
                    ? cuponesmera150
                    : couponData.campaign.discountAmount === 100
                    ? cuponesmera100
                    : cuponesmera100
                }
                alt="Cupón generado"
                className="w-full max-w-xs shadow-2xl"
                onContextMenu={(e) => e.preventDefault()} // Prevenir clic derecho
                style={{ pointerEvents: "none" }} // Deshabilitar interacciones de la imagen
              />
            </div>

            {/* Botones */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={generatePDF}
                className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 flex items-center justify-center"
              >
                <AiOutlineDownload className="mr-2" /> Descargar Cupón
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponForm;
