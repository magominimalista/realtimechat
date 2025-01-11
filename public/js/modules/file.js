import { elements } from "./elements.js";
import { state } from "./state.js";
import { formatDateTime } from "./messages.js";

export function setupFileInput() {
  elements.fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      const messageData = {
        text: "Arquivo compartilhado",
        timestamp: formatDateTime(),
        nickname: state.nickname,
        color: state.selectedColor,
        fileUrl: data.url,
        fileName: data.filename,
        isImage: file.type.startsWith("image/"),
      };

      state.socket.emit("chat message", messageData);
      elements.fileInput.value = "";
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      alert("Erro ao enviar arquivo");
    }
  });
}
