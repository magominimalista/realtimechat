import { elements } from "./elements.js";
import { state } from "./state.js";
import { formatDateTime } from "./messages.js";

export async function captureWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    // Criar preview da webcam
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    const modalContent = document.createElement("div");
    modalContent.className = "bg-[#3E3D32] p-4 rounded-lg flex flex-col gap-4";

    const video = document.createElement("video");
    video.className = "rounded-lg";
    video.autoplay = true;
    video.srcObject = stream;

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "flex justify-center gap-4";

    const captureButton = document.createElement("button");
    captureButton.className =
      "bg-monokai-primary text-monokai-bg px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors";
    captureButton.textContent = "Capturar";

    const cancelButton = document.createElement("button");
    cancelButton.className =
      "bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors";
    cancelButton.textContent = "Cancelar";

    buttonsDiv.appendChild(captureButton);
    buttonsDiv.appendChild(cancelButton);
    modalContent.appendChild(video);
    modalContent.appendChild(buttonsDiv);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    captureButton.onclick = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg")
      );
      const file = new File([blob], "webcam.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        const messageData = {
          text: "Foto da webcam",
          timestamp: formatDateTime(),
          nickname: state.nickname,
          color: state.selectedColor,
          fileUrl: data.url,
          fileName: data.filename,
          isImage: true,
        };

        state.socket.emit("chat message", messageData);
      } catch (error) {
        console.error("Erro ao enviar foto:", error);
        alert("Erro ao enviar foto");
      }

      stream.getTracks().forEach((track) => track.stop());
      modal.remove();
    };

    cancelButton.onclick = () => {
      stream.getTracks().forEach((track) => track.stop());
      modal.remove();
    };
  } catch (error) {
    console.error("Erro ao acessar webcam:", error);
    alert("Erro ao acessar webcam");
  }
}
