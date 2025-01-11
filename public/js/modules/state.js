// Estado global da aplicação
export const state = {
  socket: null,
  nickname: "",
  selectedColor: "",
  currentPage: 0,
  loadingMessages: false,
};

// Funções para manipular o estado
export function initializeSocket(io) {
  state.socket = io();
  return state.socket;
}

export function setNickname(name) {
  state.nickname = name;
  window.nickname = name; // Manter compatibilidade
}

export function setColor(color) {
  state.selectedColor = color;
}
