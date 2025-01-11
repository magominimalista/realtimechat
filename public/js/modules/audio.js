import { elements } from "./elements.js";
import { state } from "./state.js";
import { formatDateTime } from "./messages.js";

export async function handleAudioRecording() {
  try {
    if (state.mediaRecorder && state.mediaRecorder.state === "recording") {
      state.mediaRecorder.stop();
      elements.audioButton.innerHTML =
        '<i class="fas fa-microphone text-xl"></i>';
      elements.audioButton.classList.remove("text-red-500");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
      },
      video: false,
    });

    elements.audioButton.innerHTML =
      '<i class="fas fa-microphone text-xl text-red-500"></i>';
    elements.audioButton.classList.add("text-red-500");

    // Criar modal de gravação
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const modalContent = document.createElement("div");
    modalContent.className =
      "bg-[#3E3D32] p-4 rounded-lg flex flex-col gap-4 items-center";

    const timer = document.createElement("div");
    timer.className = "text-monokai-text text-2xl font-mono";
    timer.textContent = "00:00";

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "flex gap-4";

    const stopButton = document.createElement("button");
    stopButton.className =
      "bg-monokai-primary text-monokai-bg px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors";
    stopButton.innerHTML = '<i class="fas fa-stop"></i> Parar';

    const cancelButton = document.createElement("button");
    cancelButton.className =
      "bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors";
    cancelButton.innerHTML = '<i class="fas fa-times"></i> Cancelar';

    // Montar modal
    buttonsDiv.appendChild(stopButton);
    buttonsDiv.appendChild(cancelButton);
    modalContent.appendChild(timer);
    modalContent.appendChild(buttonsDiv);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Iniciar contador
    let seconds = 0;
    const timerInterval = setInterval(() => {
      seconds++;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      timer.textContent = `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
      ).padStart(2, "0")}`;
    }, 1000);

    // Configurar gravação
    state.mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm;codecs=opus",
      audioBitsPerSecond: 128000,
    });

    state.audioChunks = [];

    state.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        state.audioChunks.push(event.data);
      }
    };

    state.mediaRecorder.onstop = async () => {
      clearInterval(timerInterval);
      const audioBlob = new Blob(state.audioChunks, { type: "audio/webm" });
      const file = new File([audioBlob], "audio_message.mp3", {
        type: "audio/mpeg",
      });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        const messageData = {
          text: "Mensagem de áudio",
          timestamp: formatDateTime(),
          nickname: state.nickname,
          color: state.selectedColor,
          fileUrl: data.url,
          fileName: data.filename,
          isAudio: true,
        };

        state.socket.emit("chat message", messageData);
      } catch (error) {
        console.error("Erro ao enviar áudio:", error);
        alert("Erro ao enviar áudio");
      } finally {
        elements.audioButton.innerHTML =
          '<i class="fas fa-microphone text-xl"></i>';
        elements.audioButton.classList.remove("text-red-500");
        modal.remove();
      }

      // Limpar recursos
      stream.getTracks().forEach((track) => track.stop());
    };

    // Eventos dos botões
    stopButton.onclick = () => {
      if (state.mediaRecorder.state === "recording") {
        state.mediaRecorder.stop();
      }
    };

    cancelButton.onclick = () => {
      clearInterval(timerInterval);
      if (state.mediaRecorder.state === "recording") {
        state.mediaRecorder.stop();
      }
      stream.getTracks().forEach((track) => track.stop());
      modal.remove();
      elements.audioButton.innerHTML =
        '<i class="fas fa-microphone text-xl"></i>';
      elements.audioButton.classList.remove("text-red-500");
    };

    // Iniciar gravação
    state.mediaRecorder.start(1000);
  } catch (error) {
    console.error("Erro ao acessar microfone:", error);
    alert("Erro ao acessar microfone");
    elements.audioButton.innerHTML =
      '<i class="fas fa-microphone text-xl"></i>';
    elements.audioButton.classList.remove("text-red-500");
  }
}
