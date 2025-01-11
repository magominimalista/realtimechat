// Elementos do DOM e variáveis globais
export const elements = {
  form: document.getElementById("form"),
  input: document.getElementById("input"),
  nicknameModal: document.getElementById("nicknameModal"),
  nicknameForm: document.getElementById("nicknameForm"),
  nicknameInput: document.getElementById("nicknameInput"),
  chatContainer: document.getElementById("chatContainer"),
  emojiPicker: document.getElementById("emojiPicker"),
  emojiButton: document.getElementById("emojiButton"),
  fileInput: document.getElementById("fileInput"),
  screenButton: document.getElementById("screenButton"),
  webcamButton: document.getElementById("webcamButton"),
  audioButton: document.getElementById("audioButton"),
  gifButton: document.getElementById("gifButton"),
  gifPicker: document.getElementById("gifPicker"),
  gifSearch: document.getElementById("gifSearch"),
  gifSearchButton: document.getElementById("gifSearchButton"),
  gifResults: document.getElementById("gifResults"),
  messages: document.getElementById("messages"),
  loadMoreButton: document.getElementById("loadMoreButton"),
};

// Variáveis globais que precisam ser compartilhadas
export let mediaRecorder = null;
export let audioChunks = [];
