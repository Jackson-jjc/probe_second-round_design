"use strict";

function stylePickerHTML(card) {
  const style = Object.hasOwn(postcardStyleNames, card.style) ? card.style : "classic";
  const choices = Object.entries(postcardStyleNames).map(([key, name]) =>
    '<label class="postcard-choice">' +
      '<input type="radio" name="postcard-style" bind="style" value="' + key + '"' +
      (key === style ? ' checked' : '') + '>' +
      '<span class="postcard-choice-visual" data-style-preview="' + key + '" aria-hidden="true"></span>' +
      '<span class="postcard-choice-name">' + esc(name) + '</span>' +
      '<span class="postcard-choice-finish">' + esc(editionFinish(key,card)) + '</span>' +
    '</label>'
  ).join("");
  return '<fieldset class="postcard-styles"><legend>Choose a postcard layout</legend>' +
    '<postcard-style-options data-card="' + esc(JSON.stringify(card)) + '">' + choices +
    '</postcard-style-options></fieldset>';
}

function refreshStylePicker(card) {
  const options = document.querySelector("postcard-style-options");
  if (options) options.setCard(card);
}

customElements.define("postcard-style-options", class extends HTMLElement {
  connectedCallback() {
    this.setCard(JSON.parse(this.dataset.card));
  }

  disconnectedCallback() {
    clearTimeout(this.timer);
    this.version++;
  }

  setCard(card) {
    // Selecting another layout changes the proof. Each thumbnail already shows its own layout.
    const {type, key, image, words, label, detail} = card;
    const content = {type, key, image, words, label, detail};
    const signature = JSON.stringify(content);
    if (signature === this.signature) return;
    this.signature = signature;
    const version = this.version = (this.version || 0) + 1;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.drawOptions(content, version), 140);
  }

  async drawOptions(content, version) {
    for (const view of this.querySelectorAll("[data-style-preview]")) {
      if (!this.isConnected || this.version !== version) return;
      const style = view.dataset.stylePreview;
      try {
        const canvas = await renderPostcard({...content, style}, {maxWidth: 360});
        if (!this.isConnected || this.version !== version) return;
        view.replaceChildren(canvas);
      } catch {
        if (!this.isConnected || this.version !== version) return;
        view.textContent = "Preview unavailable";
      }
    }
  }
});
