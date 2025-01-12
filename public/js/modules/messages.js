import { elements } from "./elements.js";
import { state } from "./state.js";

// Variáveis compartilhadas
let currentPage = 0;
let loadingMessages = false;

export function createMessageElement(msgData, prepend = false) {
  // Log para debug
  console.log("Criando elemento de mensagem:", msgData);

  const item = document.createElement("li");
  item.className = `p-3 mr-4 rounded-lg ${
    msgData.nickname === state.nickname ? "own-message" : "bg-[#3E3D32]"
  }`;
  item.dataset.messageId = msgData.id;

  if (msgData.nickname === state.nickname) {
    item.style.backgroundColor = msgData.color;
    item.style.position = "relative";

    const deleteButton = document.createElement("button");
    deleteButton.className =
      "absolute bottom-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black bg-opacity-30 text-white/50 hover:text-white/90 hover:bg-opacity-50 transition-all";
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';

    deleteButton.onclick = async () => {
      if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;

      try {
        const response = await fetch(
          `/message/${msgData.id}?nickname=${encodeURIComponent(
            state.nickname
          )}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao deletar mensagem");
        }

        item.classList.add("message-removing");
        setTimeout(() => {
          item.remove();
        }, 300);
      } catch (error) {
        console.error("Erro ao deletar mensagem:", error);
        alert("Erro ao deletar mensagem");
      }
    };

    item.appendChild(deleteButton);
  } else if (msgData.color) {
    item.style.backgroundColor = msgData.color;
  }

  const header = document.createElement("div");
  header.className = "flex justify-between items-center mb-1";

  const nickname = document.createElement("strong");
  nickname.textContent = msgData.nickname;
  nickname.className = "text-monokai-primary";

  const timestamp = document.createElement("span");
  timestamp.textContent = msgData.timestamp;
  timestamp.className = "text-monokai-secondary text-sm";

  header.appendChild(nickname);
  header.appendChild(timestamp);
  item.appendChild(header);

  // Verificar tanto text quanto message
  const messageText = msgData.text || msgData.message;

  if (msgData.fileUrl) {
    const fileLink = createFileLink(msgData);
    item.appendChild(fileLink);
  }

  if (messageText) {
    const text = document.createElement("p");
    text.textContent = messageText;
    text.className = "text-monokai-text break-words";
    item.appendChild(text);
  }

  if (prepend) {
    elements.messages.prepend(item);
  } else {
    elements.messages.appendChild(item);
  }

  return item;
}

export function setupLoadMoreButtons() {
  // Criar botão de carregar mais antigas (topo)
  const loadOlderButton = document.createElement("button");
  loadOlderButton.className =
    "w-full bg-[#3E3D32] text-monokai-text py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors mb-4 flex items-center justify-center gap-2";
  loadOlderButton.innerHTML = `
    <i class="fas fa-history"></i>
    Carregar mensagens antigas
  `;
  loadOlderButton.id = "loadOlderButton";

  // Adicionar o botão no início da lista de mensagens
  elements.messages.parentNode.insertBefore(loadOlderButton, elements.messages);

  loadOlderButton.addEventListener("click", () => {
    loadMessages(currentPage + 1);
  });
}

export async function loadMessages(page = 0) {
  if (loadingMessages) return;
  loadingMessages = true;

  try {
    const response = await fetch(`/messages?page=${page}`);
    const data = await response.json();

    // Limpar mensagens se for a primeira página
    if (page === 0) {
      elements.messages.innerHTML = "";
      // Processar mensagens normalmente para a primeira página
      data.messages.forEach((msg) => {
        if (msg.fileName?.endsWith(".mp3")) {
          msg.isAudio = true;
        } else if (msg.fileName === "giphy.gif") {
          msg.isGif = true;
        } else if (msg.fileUrl && /\.(jpg|jpeg|png|gif)$/i.test(msg.fileUrl)) {
          msg.isImage = true;
        }
        createMessageElement(msg, false);
      });
    } else {
      // Inverter a ordem das mensagens antigas e adicionar no topo
      [...data.messages].reverse().forEach((msg) => {
        if (msg.fileName?.endsWith(".mp3")) {
          msg.isAudio = true;
        } else if (msg.fileName === "giphy.gif") {
          msg.isGif = true;
        } else if (msg.fileUrl && /\.(jpg|jpeg|png|gif)$/i.test(msg.fileUrl)) {
          msg.isImage = true;
        }
        createMessageElement(msg, true);
      });
    }

    // Mostrar/ocultar botão de carregar mais
    const loadOlderButton = document.getElementById("loadOlderButton");
    if (loadOlderButton) {
      loadOlderButton.style.display = data.hasMore ? "flex" : "none";
    }

    currentPage = page;

    // Se for a primeira página, rolar para o final
    if (page === 0) {
      elements.messages.scrollTop = elements.messages.scrollHeight;
    }
  } catch (error) {
    console.error("Erro ao carregar mensagens:", error);
  } finally {
    loadingMessages = false;
  }
}

export function createFileLink(msgData) {
  if (msgData.isGif || msgData.isImage) {
    const container = document.createElement("div");
    container.className = "message-image-container relative";

    const img = document.createElement("img");
    img.src = msgData.fileUrl;
    img.className =
      "max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity relative z-0";
    img.loading = "lazy";

    // Adicionar lightbox para imagens
    if (msgData.isImage) {
      const link = document.createElement("a");
      link.href = msgData.fileUrl;
      link.setAttribute("data-lightbox", "chat-images");
      link.appendChild(img);
      container.appendChild(link);
    } else {
      container.appendChild(img);
      // Adicionar atribuição apenas para GIFs do GIPHY
      if (msgData.isGif) {
        const attribution = document.createElement("div");
        attribution.className = "text-xs text-monokai-secondary mt-1";
        attribution.innerHTML =
          'via <a href="https://giphy.com" target="_blank" class="hover:text-monokai-accent">GIPHY</a>';
        container.appendChild(attribution);
      }
    }

    return container;
  }

  if (msgData.isAudio) {
    const audioContainer = document.createElement("div");
    audioContainer.className = "flex items-center gap-3 max-w-sm w-full";

    const playerWrapper = document.createElement("div");
    playerWrapper.className = "flex-1 bg-[#272822] rounded-lg overflow-hidden";

    const audio = document.createElement("audio");
    audio.className = "plyr-audio";
    audio.src = msgData.fileUrl;

    playerWrapper.appendChild(audio);
    audioContainer.appendChild(playerWrapper);

    // Adicionar botão de download para áudio
    const downloadButton = document.createElement("a");
    downloadButton.href = msgData.fileUrl;
    downloadButton.download = msgData.fileName;
    downloadButton.className =
      "text-monokai-accent hover:text-monokai-primary transition-colors tooltip-container";
    downloadButton.innerHTML = '<i class="fas fa-download text-lg"></i>';

    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.textContent = "Baixar áudio";
    downloadButton.appendChild(tooltip);

    audioContainer.appendChild(downloadButton);

    // Inicializar player de áudio
    setTimeout(() => {
      new Plyr(audio, {
        controls: [
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
        ],
        i18n: {
          play: "Reproduzir",
          pause: "Pausar",
          mute: "Silenciar",
          unmute: "Ativar som",
        },
      });
    }, 0);

    return audioContainer;
  }

  // Para outros tipos de arquivo
  const link = document.createElement("a");
  link.href = msgData.fileUrl;
  link.textContent = msgData.fileName;
  link.className =
    "text-monokai-secondary hover:text-monokai-accent flex items-center gap-2";
  link.target = "_blank";
  link.download = msgData.fileName;

  const icon = document.createElement("i");
  icon.className = "fas fa-file";
  link.insertBefore(icon, link.firstChild);

  return link;
}

export function formatDateTime() {
  const options = {
    timeZone: "America/Fortaleza",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date().toLocaleString("pt-BR", options);
}
