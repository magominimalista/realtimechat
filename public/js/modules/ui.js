import { elements } from "./elements.js";

export function setupEmojiPicker(input) {
  const picker = new EmojiMart.Picker({
    onEmojiSelect: (emoji) => {
      const cursorPos = input.selectionStart;
      const text = input.value;
      const newText =
        text.slice(0, cursorPos) + emoji.native + text.slice(cursorPos);
      input.value = newText;
      input.setSelectionRange(
        cursorPos + emoji.native.length,
        cursorPos + emoji.native.length
      );
      input.focus();
      elements.emojiPicker.classList.add("hidden");
    },
    theme: "dark",
    showPreview: false,
    showSkinTones: false,
  });

  elements.emojiPicker.innerHTML = "";
  elements.emojiPicker.appendChild(picker);

  elements.emojiButton.addEventListener("click", () => {
    elements.emojiPicker.classList.toggle("hidden");
    elements.gifPicker.classList.add("hidden");
  });

  // Fechar ao clicar fora
  document.addEventListener("click", (e) => {
    if (
      !elements.emojiPicker.contains(e.target) &&
      !elements.emojiButton.contains(e.target)
    ) {
      elements.emojiPicker.classList.add("hidden");
    }
  });
}

export function setupColorPicker(callback) {
  document.querySelectorAll("[data-color]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-color]").forEach((btn) => {
        btn.classList.remove("border-white");
      });
      button.classList.add("border-white");
      callback(button.dataset.color);
    });
  });
}
