import React, { useState, useRef, useEffect } from "react";
import { Container, Box, Button, Typography, TextField, IconButton ,Tooltip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SendIcon from "@mui/icons-material/Send";
import {  Api,PictureAsPdf } from "@mui/icons-material";
import axios from "axios";
import recordingAnimation from "../assets/recording.json"; // Un JSON de animación de ondas de audio
import Lottie from "lottie-react";
import StopIcon from "@mui/icons-material/Stop";
import { Mic, Stop, VolumeUp, ContentCopy, Email, Send, Article, Delete } from "@mui/icons-material";
import { jsPDF } from "jspdf";   // <-- Importación de jsPDF


const API_KEY = process.env.REACT_APP_API_OPEN;
const REACT_APP_X_API_KEY_LAMB = process.env.REACT_APP_X_API_KEY_LAMB
const API_TTS_URL_SPEECH = "https://api.openai.com/v1/audio/speech";
const API_TRANSCRIPTION_URL = "https://api.openai.com/v1/audio/transcriptions";
const ANALYSIS_API_URL = "https://api-utilitarios.confa.co/IA/analizarTextoOrtogRedac";
const ANALYSIS_API_URL_RESUMEN = "https://api-utilitarios.confa.co/IA/analizarTextoOrtogRedacResumido";



export default function AsistenteIAConftalk() {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [analysisResponse, setAnalysisResponse] = useState("");
  const [audioUrl, setAudioUrl] = useState(null); // Estado para almacenar la URL de la grabación
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [telefono, setTelefono] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());
  const [audioFile, setAudioFile] = useState(null);

  useEffect(() => {
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(analysisResponse);
  };

  const handleStartRecording = async () => {
    setRecording(true);
    setTranscription("");
    setAnalysisResponse("");
    setAudioFile("");
    setAudioUrl(null); // Reiniciar la URL de la grabación
    audioChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl); // Establecer la URL de la grabación

      const formData = new FormData();
      formData.append("file", audioBlob, "recording.wav");
      formData.append("model", "whisper-1");

      setLoading(true);
      try {
        const response = await fetch(API_TRANSCRIPTION_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${API_KEY}` },
          body: formData,
        });

        const data = await response.json();
        setTranscription(data.text);
      } catch (error) {
        console.error("Error en la transcripción:", error);
      } finally {
        setLoading(false);
      }
    };

    mediaRecorder.start();
  };

  const handleStopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  const analyzeText = async () => {
    //console.log("REACT_APP_X_API_KEY_LAMB >"+REACT_APP_X_API_KEY_LAMB)
    setLoading(true);
    //X_API_KEY_LAMB
    try {
      const response = await fetch(ANALYSIS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":REACT_APP_X_API_KEY_LAMB
        },
        body: JSON.stringify({ mensaje: transcription })
      });
      
    
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
       console.log("Respuesta de la respuesta:", result.body);
       
       const parsedBody = JSON.parse(result.body);
      const parsedRespuesta = JSON.parse(parsedBody.respuesta);
      console.log("Respuesta de la texto_corregido>:", parsedRespuesta.texto_corregido);
      setAnalysisResponse(parsedRespuesta.texto_corregido || "No se recibió corrección");

    } catch (error) {
      console.error("Error al analizar el texto:", error);
      setAnalysisResponse("Error al analizar el texto");
    } finally {
      setLoading(false);
    }
  };
  const resumirText = async () => {
    setLoading(true);
    try {
      const response = await fetch(ANALYSIS_API_URL_RESUMEN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key":REACT_APP_X_API_KEY_LAMB
        },
        body: JSON.stringify({ mensaje: transcription })
      });
      
    
      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      const bodyParseado = JSON.parse(result.body);

      // 2️⃣ Convertir el valor de "respuesta" en objeto JavaScript
      const respuestaParseada = JSON.parse(bodyParseado.respuesta);
      
      // 3️⃣ Extraer el `texto_corregido`
      const textoCorregido = respuestaParseada.texto_corregido;
      
      console.log(textoCorregido);
     setAnalysisResponse(textoCorregido|| "No se recibió corrección");

    } catch (error) {
      console.error("Error al analizar el texto:", error);
      setAnalysisResponse("Error al analizar el texto");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (event) => {
    setTranscription(event.target.value); // Actualiza el estado con el nuevo valor
  };
  const handleChangemejorado = (event) => {
    setAnalysisResponse(event.target.value); // Actualiza el estado con el nuevo valor
  };

    const abrirGmail = () => {
      const destinatario = "xxxxxx@confa.co"; // Cambia esto si deseas un destinatario predefinido
      const asunto = "Asunto del correo";  
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(destinatario)}&su=${encodeURIComponent(asunto)}&body=${encodeURIComponent(analysisResponse)}`;
  
      window.open(url, "_blank"); // Abre Gmail en una nueva pestaña

  };
  const abrirGoogleDocs = async () => {
    const url = "https://docs.google.com/document/create"; // URL para crear un nuevo documento en Google Docs

    try {
      // Copiar el texto al portapapeles antes de abrir la nueva pestaña
       await navigator.clipboard.writeText(analysisResponse);
      alert("Texto copiado al portapapeles. Ábrelo en Google Docs y pega con Ctrl + V.");

      // Abrir Google Docs en una nueva pestaña
      window.open("https://docs.google.com/document/create", "_blank");
  } catch (err) {
      console.error("Error al copiar el texto:", err);
      alert("Error al copiar el texto. Intenta copiarlo manualmente.");
  }


  };

  // 📌 Método para invocar una API REST

   /**--------------------------- */
   const reproducirTexto = async () => {
    console.log("reproducirTexto--" + analysisResponse);
    if (!analysisResponse.trim()) {
      alert("El texto está vacío.");
      return;
    }
    const instrucciones = `Identidad: Un asistente virtual con acento colombiano, específicamente del Eje Cafetero (paisa). Amable, claro y enfocado en ayudar.
    Afecto: Cercano y cálido, reflejando la amabilidad característica de la región. Habla con naturalidad, pero sin exagerar el acento.
    Tono: Conversacional y respetuoso, con un ritmo tranquilo y seguro. Brinda confianza y orientación sin sonar robótico ni distante.
    Emoción: Empático y positivo, manteniendo una actitud calmada. Muestra interés genuino por ayudar al usuario, especialmente cuando se trata de salud o bienestar.
    Pausas: Breves y naturales, como si conversara con alguien frente a frente. Hace pequeñas pausas para asegurar que la información sea entendida.
    Pronunciación: Clara y con modismos sutiles del habla paisa. Evita tecnicismos innecesarios y utiliza un lenguaje simple y cercano, como: “claro que sí”, “con mucho gusto”, “ya mismo te ayudo”.
    Contexto: Estas instrucciones están diseñadas para un asistente que agenda citas médicas en un entorno virtual. Su enfoque principal es facilitar la interacción con los usuarios de forma cálida, eficiente y culturalmente familiar. velocidad rapido`;
    

    try {
      setIsPlaying(true);
      const response = await axios.post(API_TTS_URL_SPEECH,
        {
          model: "gpt-4o-mini-tts",//"tts-1",
          input: analysisResponse,
          instructions: instrucciones,
          voice: "alloy"
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          },
          responseType: "blob"
        }
      );
  
      console.log("response.status:", response.status);
      console.log("response.headers['content-type']:", response.headers["content-type"]);
  
      // Crear URL del Blob
      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("Audio URL:", audioUrl);
  
      // Usar el objeto Audio en lugar de audioRef.current
      const audio = new Audio(audioUrl);
      audio.play();
  
      audio.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Error en la conversión de texto a voz:", error);
      setIsPlaying(false);
    }
  };

  const detenerReproduccion = () => {
    console.log("detenerReproduccion>>")
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reinicia el audio
      setIsPlaying(false);
    }
  };

   // 1) FUNCIÓN PARA GUARDAR EN PDF
   const handleSavePDF = () => {
    if (!analysisResponse.trim()) {
      alert("No hay texto para guardar en PDF.");
      return;
    }

    // Crea el objeto jsPDF
    const doc = new jsPDF({
      orientation: "p",  // “portrait”
      unit: "pt",        // puntos
      format: "a4"
    });

    // Divide el texto en líneas para no cortar bordes
    const lines = doc.splitTextToSize(analysisResponse, 500);

    // Agrega el texto en el PDF (coordenadas x=40, y=60 a modo de ejemplo)
    doc.text(lines, 40, 60);

    // Descarga el archivo con nombre "texto_mejorado.pdf"
    doc.save("texto_mejorado.pdf");
  };

  const handleTranscribeAudioFile = async () => {
    if (!audioFile) return alert("Por favor, selecciona un archivo de audio.");
    
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-1");
  
    setLoading(true);
    try {
      const response = await fetch(API_TRANSCRIPTION_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`
        },
        body: formData
      });
  
      const data = await response.json();
      if (data?.text) {
        setTranscription(data.text);
       //<<< setAnalysisResponse(""); // limpia texto mejorado
      } else {
        alert("No se pudo transcribir el audio.");
      }
    } catch (error) {
      console.error("Error al transcribir el archivo:", error);
      alert("Error al procesar el archivo de audio.");
    } finally {
      setLoading(false);
    }
  };
  const handleClearAll = () => {
    setRecording(false);
    setTranscription("");
    setAnalysisResponse("");
    setAudioUrl(null);
    setAudioFile(null);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };
  const generarInformeEstructurado = async () => {
    const prompt = `
      Te voy a dar una transcripción de voz. Por favor, genera un informe estructurado que incluya:
      1) Título
      2) Idea central
      3) Participantes (si se mencionan)
      4) Lista de puntos importantes
      5) Conclusión.
      Usa formato con títulos y subtítulos.
  
      Texto: ${transcription}
    `;
  
    try {
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      }, {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_API_OPEN}`,
          "Content-Type": "application/json"
        }
      });
  
      const informe = response.data.choices[0].message.content;
      console.log("Informe estructurado:", informe);
      setAnalysisResponse(informe); // o guárdalo como informePDF
    } catch (err) {
      console.error("Error al generar el informe:", err);
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 5, p: 4,  backgroundColor: "#F5F7FA",  borderRadius: "12px", boxShadow: 3      
    }}>
    <Box sx={{ borderBottom: "1px solid #1976d2", pb: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <Typography variant="h6" sx={{ color: '#1976d2', fontFamily: "'Roboto', sans-serif" }}>
        🎙️ ConfaTalk...
        </Typography>
    </Box>   
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2 }}>    
      {/* Botón de Grabación */}
      
      <Button
        variant="contained"
        startIcon={recording ? <StopIcon /> : <MicIcon />}
        onClick={recording ? handleStopRecording : handleStartRecording}
        color={recording ? "secondary" : "primary"}
        sx={{ backgroundColor: recording ? "#bf1650" : "#516391", color: "#fff", borderRadius: "40px" }}
      >
        {recording ? "Detener" : "Grabación"}
      </Button>

      {/* Animación de Grabación (Solo cuando `recording` es true) */}
      {recording && (<Lottie animationData={recordingAnimation} loop style={{ width: 60, height: 60 }} />)}
      
          {audioUrl && (
            <Box sx={{ mt: 2 }}>
              <audio controls src={audioUrl} />
            </Box>
          )}
  </Box>
  <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 2 }}>
  <input
    type="file"
    accept="audio/*"
    onChange={(e) => setAudioFile(e.target.files[0])}
    style={{ display: "none" }}
    id="upload-audio-file"
  />
  <label htmlFor="upload-audio-file">
    <Button variant="contained" component="span" sx={{   backgroundColor: "#516391",
    color: "#fff",
    borderRadius: "40px",
    padding: "12px 20px",
    fontSize: "12px",
    
    "&:hover": { backgroundColor: "#bf1650" } }}>
      Subir Audio
    </Button>
</label>
      <Button variant="contained" startIcon={<Article />} onClick={handleTranscribeAudioFile} disabled={!audioFile} sx={{   backgroundColor: "#516391",
    color: "#fff",
    borderRadius: "40px",
    padding: "12px 20px",
    fontSize: "12px",
    
    "&:hover": { backgroundColor: "#bf1650" } }}>
    Transcribir Audio
  </Button>


  
  {audioFile && (
        <Box sx={{ mb: 2, backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <Typography variant="subtitle2">🎧 Archivo seleccionado:</Typography>
          <Typography variant="body2">Nombre: {audioFile.name}</Typography>
          <Typography variant="body2">Tamaño: {(audioFile.size / 1024).toFixed(2)} KB</Typography>
          <Typography variant="body2">Tipo: {audioFile.type}</Typography>
        </Box>
      )}
</Box>

    <Box>
      <TextField
        fullWidth
        multiline
        rows={5}
        variant="outlined"
        label="Transcripción"
        value={transcription}
        onChange={handleChange} // Permite editar el campo
        sx={{  mt: 4, backgroundColor: "#fff", borderRadius: "8px" }}

      />
    </Box>

       {/* Botones de Acción */}
       <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 3 }}>
        <Button variant="contained" startIcon={<Send />} onClick={analyzeText} sx={{   backgroundColor: "#516391",
          color: "#fff",
          borderRadius: "40px",
          padding: "12px 20px",
          fontSize: "12px",
          "&:hover": { backgroundColor: "#bf1650" } }}>
          Mejorar Texto
        </Button>
        <Button
        variant="contained" startIcon={<Send />} onClick={generarInformeEstructurado} sx={{   backgroundColor: "#516391",
          color: "#fff",
          borderRadius: "40px",
          padding: "12px 20px",
          fontSize: "12px",
          "&:hover": { backgroundColor: "#bf1650" } }}
        >
          Estructurar Texto
        </Button>
          

        <Button variant="contained" startIcon={<Article />} onClick={resumirText} sx={{   backgroundColor: "#516391",
          color: "#fff",
          borderRadius: "40px",
          padding: "12px 20px",
          fontSize: "12px",
          "&:hover": { backgroundColor: "#bf1650" } }}>
          Resumir Texto
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
      {/* Campo de Texto */}
      <TextField
        fullWidth
        multiline
        rows={5}
        variant="outlined"
        label="Texto Mejorado"
        value={analysisResponse}
        onChange={handleChangemejorado}
        sx={{ mt: 3, backgroundColor: "#fff", borderRadius: "8px" }}
      />

    </Box>
   
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
    <Tooltip title={isPlaying ? "Detener" : "Reproducir"}>
          <IconButton  variant="contained" sx={{ ml: 1 ,textTransform: "none", fontSize: "8px", padding: "10px 20px"}}
        color="primary" onClick={isPlaying ? detenerReproduccion : reproducirTexto}>
            {isPlaying ? <Stop /> : <VolumeUp />}Reproducir
          </IconButton>
        </Tooltip>
    <Button onClick={handleCopyToClipboard} sx={{ ml: 1 ,textTransform: "none", fontSize: "8px", padding: "10px 20px"}} >
        <ContentCopyIcon />Copiar
      </Button>
  <Button
      startIcon={<Email />} // Agrega el ícono a la izquierda del texto
      onClick={abrirGmail}
      sx={{ ml: 1 ,textTransform: "none", fontSize: "8px", padding: "10px 20px" }} // Estilos personalizados
    >
      Email
    </Button>
        <Button
        startIcon={<Api />}
        onClick={abrirGoogleDocs}
        sx={{ ml: 1, textTransform: "none", fontSize: "8px", padding: "10px 20px"  }}
      >
        GoogleDocs
      </Button> 
           {/* BOTÓN PARA GUARDAR EN PDF */}
           <Button
            startIcon={<PictureAsPdf />}
          onClick={handleSavePDF}
          sx={{ ml: 1, textTransform: "none", fontSize: "8px", padding: "10px 20px" }}
        >
          PDF
        </Button>
           {/* BOTÓN generarInformeEstructurado */}
         
        <Button  color="error" onClick={handleClearAll} startIcon={<Delete />}>
          
        </Button>
    </Box>


    </Container>
  );
}
