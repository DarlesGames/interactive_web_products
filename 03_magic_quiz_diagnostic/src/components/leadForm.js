export function createLeadForm({ texts }) {
  const wrapper = document.createElement("section");
  wrapper.className = "lead-zone";

  const title = document.createElement("h2");
  title.textContent = texts.title;

  const text = document.createElement("p");
  text.textContent = texts.text;

  const notice = document.createElement("p");
  notice.className = "request-note";
  notice.textContent = texts.contactNotice;

  const submitButton = document.createElement("button");
  submitButton.className = "button button--primary";
  submitButton.type = "button";
  submitButton.textContent = texts.submitButton;

  const openNote = document.createElement("p");
  openNote.className = "form-note";
  openNote.textContent = texts.openNote;

  const fallback = createFallbackContacts(texts);

  if (texts.formUrl) {
    fallback.hidden = true;
  }

  submitButton.addEventListener("click", () => {
    if (!texts.formUrl) {
      fallback.hidden = false;
      return;
    }

    window.open(texts.formUrl, "_blank", "noopener,noreferrer");
  });

  wrapper.append(title, text, notice, submitButton, openNote, fallback);
  return wrapper;
}

function createFallbackContacts(texts) {
  const contacts = document.createElement("div");
  contacts.className = "fallback-contacts";

  const title = document.createElement("h3");
  title.textContent = texts.fallbackTitle;

  const list = document.createElement("ul");
  list.className = "fallback-list";

  [
    ["Telegram", texts.telegram],
    [texts.emailLabel, texts.email],
    ["VK", texts.vk],
  ].forEach(([label, value]) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = value === texts.email ? `mailto:${value}` : value;
    link.target = value === texts.email ? "_self" : "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${label}: ${value}`;
    item.append(link);
    list.append(item);
  });

  contacts.append(title, list);
  return contacts;
}
