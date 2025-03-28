// components/ElevenLabsWidget.js
import { useEffect } from "react";

const Eleven = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://elevenlabs.io/convai-widget/index.js";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <elevenlabs-convai agent-id="ntoIvhAOyoAxMR91hI4Q"></elevenlabs-convai>
  );
};

export default Eleven;
