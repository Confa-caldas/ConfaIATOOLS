import React, { useRef, useState,useEffect } from "react";
import {
  Typography,
  Paper,
  Box,
  Button,
  Container,
  Divider,
  CircularProgress,
} from "@mui/material";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Webcam from "react-webcam";
import MemoryIcon from "@mui/icons-material/Memory";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

const GOOGLE_CLIENT_ID =process.env.REACT_APP_GOO_CLIENT_ID;

const Login = ({ setIsAuthenticated }) => {
  const webcamRef = useRef(null);
  const [imgTake, setImgTake] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [doc, setDoc] = useState(null); // Nuevo estado para el documento
  const navigate = useNavigate();
  
  

    // Limpia el localStorage y establece valores iniciales al cargar el componente
    useEffect(() => {
      const isLoggedIn = localStorage.getItem("logueado") === "true";
      const tipoVali = localStorage.getItem("tipo_vali");
    
      if (!isLoggedIn || !tipoVali) {
        console.log("Usuario no autenticado. Limpiando localStorage...");
        localStorage.clear();
        localStorage.setItem("tipo_vali", "");
        localStorage.setItem("logueado", "false");
      }
    }, []);


    const handleLoginSuccess = (credentialResponse) => {
      try {
        const token = credentialResponse.credential;
        if (!token) throw new Error("Token no recibido");
    
        localStorage.setItem("authToken", token);
        localStorage.setItem("tipo_vali", "google");
        localStorage.setItem("logueado", "true");
    
        // Decodificar token de forma segura
        const decoded = jwtDecode(token);
    
        // Guardar la imagen de perfil si existe
        if (decoded.picture) {
          localStorage.setItem("imgTake", decoded.picture);
        }
    
        console.log("Usuario autenticado con Google:", decoded);
        setIsAuthenticated(true);
        navigate("/AsistenteIA");
      } catch (error) {
        console.error("Error en la autenticación con Google:", error);
      }
    };

  const handleLoginFailure = () => {
    console.error("Error al iniciar sesión con Google");
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgTake(imageSrc);
      validateImage(imageSrc);
    }
  };

  const validateImage = async (imageSrc) => {
    setIsValidating(true);
    //console.log("API Key:", process.env.REACT_APP_XAPK_FACIAL);

    try {
      const response = await fetch("https://api-facial.confa.co/identificarvalidar", {
        method: "POST",
        headers: {
          "x-api-key": process.env.REACT_APP_XAPK_FACIAL,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imgdata: imageSrc.replace(/^data:image\/[^;]+;base64,/, ""),
          excepcion: "ojos-dimension-boca-caras-rostro-brillo-objetos",
          tipoValidacion: "validacion",
        }),
      });
  
      const data = await response.json();
     // console.log("Respuesta del servidor:", data);
  
     // if (data.est && data.doc && data.doc !== "No se identifico." && data.doc !== "Error") {
      if (data.doc !== "No se identifico." && data.doc !== "") {
        const cc = data.doc.replace("-C", "");
        setDoc(cc);
        setValidationResult(`Documento encontrado: ${cc}`);
      } else {
        setValidationResult("No se pudo reconocer el rostro.");
      }
    } catch (error) {
      console.error("Error en la validación:", error);
      setValidationResult("Error en la validación.");
    } finally {
      setIsValidating(false);
    }
  };

  const confirmarDocumento = () => {
    // Redirige a otra página tras confirmar
    //console.log("login Documento confirmado:", doc);
    localStorage.setItem("cclogin", doc);
    //console.log("Documento confirmado:", doc);
    localStorage.setItem("imgTake", imgTake);
    localStorage.setItem("tipo_vali", 'face');
    localStorage.setItem("logueado", true);
    setIsAuthenticated(true);
    setTimeout(() => {
      console.log("Redirigiendo a AsistenteIA...");
      navigate("/AsistenteIAConftalk", { replace: true });
    }, 200); // 🔹 Espera corta para permitir que React actualice el estado
  };

 /* const limpiar = () => {
    setImgTake(null);
    setValidationResult(null);
    setDoc(null); // Limpia el documento
    localStorage.setItem("cclogin", doc);
    console.log("Documento confirmado:", doc);
    localStorage.setItem("imgTake", imgTake);
    localStorage.setItem("tipo_vali", 'face');
    localStorage.setItem("logueado", true);
  };*/
  const limpiar = () => {
    setImgTake(null);
    setValidationResult(null);
    setDoc(null); // ✅ Limpia solo el estado sin tocar localStorage
  
    console.log("Formulario limpiado");
  };
  

  return (
    <Container maxWidth="sm" sx={{ mt: 5, textAlign: "center" }}>
    
      {/* Encabezado */}
      <Box sx={{ mb: 4, borderBottom: "2px solid #1976d2", pb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            color: "#1976d2",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          Asistente Conf{" "}
          <span style={{ color: "#f50057", display: "inline-flex" }}>
            iA
            <MemoryIcon sx={{ fontSize: "1.8rem", color: "#f50057" }} />
          </span>
        </Typography>
        <Typography variant="subtitle1" sx={{ color: "#555", mt: 1 }}>
          Siempre contigo, mejorando tu experiencia
        </Typography>
      </Box>

      {/* Contenedor principal */}
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, bgcolor: "#f9f9f9" }}>
        {/* Inicio de sesión con Google */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginFailure}
              text="signin_with"
            />
          </GoogleOAuthProvider>
          <Divider sx={{ mt: 3, mb: 3 }} />
        </Box>

        {/* Webcam y Captura Manual */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          {isValidating && <CircularProgress sx={{ color: "#1976d2", mt: 2 }} />}
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            width={280}
            style={{
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              marginBottom: "8px",
            }}
          />
          {imgTake && (
            <img
              src={imgTake}
              alt="Captura previa"
              style={{
                width: 150,
                height: 100,
                borderRadius: 8,
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            />
          )}
        </Box>

        {/* Resultado de la validación */}
        {validationResult && (
          <Typography variant="body2" sx={{ color: "blue", mt: 2 }}>
            {validationResult}
          </Typography>
        )}

        {/* Botones de Acción */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={capture}
            sx={{ textTransform: "none" }}
          >
            Capturar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={limpiar}
            sx={{ textTransform: "none" }}
          >
            Nuevo/limpiar
          </Button>
        </Box>

        {/* Botón de Confirmación */}
        {doc && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              variant="contained"
              color="success"
              onClick={confirmarDocumento}
              sx={{ textTransform: "none" }}
            >
              Confirmar Documento
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Login;
