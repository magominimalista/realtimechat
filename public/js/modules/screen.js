import { elements } from "./elements.js";
import { state } from "./state.js";
import { formatDateTime } from "./messages.js";

export async function captureScreen() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      preferCurrentTab: true,
    });

    const track = stream.getVideoTracks()[0];
    const imageCapture = new ImageCapture(track);
    const bitmap = await imageCapture.grabFrame();

    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    context.drawImage(bitmap, 0, 0);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg")
    );
    const file = new File([blob], "screenshot.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    const messageData = {
      text: "Captura de tela",
      timestamp: formatDateTime(),
      nickname: state.nickname,
      color: state.selectedColor,
      fileUrl: data.url,
      fileName: data.filename,
      isImage: true,
    };

    state.socket.emit("chat message", messageData);

    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    console.error("Erro ao capturar tela:", error);
    alert("Erro ao capturar tela");
  }
}
