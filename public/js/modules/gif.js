import { elements } from "./elements.js";
import { state } from "./state.js";
import { formatDateTime } from "./messages.js";

// Adicionar verificação de socket
function ensureSocket() {
  if (!state.socket) {
    throw new Error("Socket não inicializado");
  }
  return state.socket;
}

// Funções relacionadas aos GIFs
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export async function searchGifs(query) {
  if (!query.trim()) {
    elements.gifResults.innerHTML = "";
    return;
  }

  try {
    elements.gifResults.innerHTML =
      '<div class="text-center text-monokai-text">Buscando...</div>';

    const response = await fetch(`/search-gifs?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Erro na busca");
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      elements.gifResults.innerHTML =
        '<div class="text-center text-monokai-text">Nenhum GIF encontrado</div>';
      return;
    }

    elements.gifResults.innerHTML = "";

    data.data.forEach((gif) => {
      const img = document.createElement("img");
      img.src = gif.images.fixed_height_small.url;
      img.className =
        "w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity";
      img.loading = "lazy";

      img.onclick = () => {
        try {
          const socket = ensureSocket();
          const messageData = {
            text: "GIF compartilhado",
            timestamp: formatDateTime(),
            nickname: state.nickname,
            color: state.selectedColor,
            fileUrl: gif.images.original.url,
            fileName: "giphy.gif",
            isGif: true,
          };

          socket.emit("chat message", messageData);
          elements.gifPicker.classList.add("hidden");
          elements.gifSearch.value = "";
        } catch (error) {
          console.error("Erro ao enviar GIF:", error);
          alert("Erro ao enviar GIF. Por favor, tente novamente.");
        }
      };

      elements.gifResults.appendChild(img);
    });
  } catch (error) {
    console.error("Erro ao buscar GIFs:", error);
    elements.gifResults.innerHTML =
      '<div class="text-center text-monokai-text text-red-500">Erro ao buscar GIFs</div>';
  }
}

export function setupGifListeners() {
  elements.gifSearch.addEventListener(
    "input",
    debounce(() => {
      if (elements.gifSearch.value.trim()) {
        searchGifs(elements.gifSearch.value);
      }
    }, 500)
  );

  elements.gifSearchButton.addEventListener("click", () => {
    if (elements.gifSearch.value.trim()) {
      searchGifs(elements.gifSearch.value);
    }
  });

  elements.gifButton.addEventListener("click", () => {
    elements.gifPicker.classList.toggle("hidden");
    elements.emojiPicker.classList.add("hidden");
  });
}
