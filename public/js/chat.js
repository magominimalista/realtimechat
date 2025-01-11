import { elements } from "./modules/elements.js";
import { handleAudioRecording } from "./modules/audio.js";
import { setupGifListeners } from "./modules/gif.js";
import { captureScreen } from "./modules/screen.js";
import {
  createMessageElement,
  formatDateTime,
  loadMessages,
  setupLoadMoreButtons,
} from "./modules/messages.js";
import { setupEmojiPicker, setupColorPicker } from "./modules/ui.js";
import {
  state,
  initializeSocket,
  setNickname,
  setColor,
} from "./modules/state.js";
import { setupFileInput } from "./modules/file.js";
import { captureWebcam } from "./modules/webcam.js";

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Adicionar inicialização do socket aqui
  const socket = initializeSocket(io);

  // Setup inicial
  setupEmojiPicker(elements.input);
  setupColorPicker((color) => setColor(color));
  setupGifListeners();
  setupFileInput();

  // Event listeners
  elements.audioButton.addEventListener("click", handleAudioRecording);
  elements.screenButton.addEventListener("click", () =>
    captureScreen(socket, state.nickname, state.selectedColor, formatDateTime)
  );
  elements.webcamButton.addEventListener("click", captureWebcam);

  // Form submit
  elements.form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (elements.input.value) {
      const messageData = {
        text: elements.input.value,
        timestamp: formatDateTime(),
        nickname: state.nickname,
        color: state.selectedColor,
      };
      socket.emit("chat message", messageData);
      elements.input.value = "";
    }
  });

  // Nickname form
  elements.nicknameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    setNickname(elements.nicknameInput.value);
    elements.nicknameModal.classList.add("hidden");
    elements.chatContainer.classList.remove("hidden");
    socket.emit("user joined", state.nickname);
    loadMessages();
  });

  // Socket events
  state.socket.on("chat message", (msg) => {
    createMessageElement(msg);
    window.scrollTo(0, document.body.scrollHeight);
  });

  // Load more messages
  elements.loadMoreButton?.addEventListener("click", () => {
    loadMessages(state.currentPage + 1);
  });

  // Adicionar setup dos botões de carregar mais
  setupLoadMoreButtons();
});

// ... (código específico que não se encaixa nos módulos)
