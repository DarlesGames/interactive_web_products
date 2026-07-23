const logoUrl = "./public/assets/images/DG_logo.png";
const logoLink = "https://vk.ru/darlesgames";
const typeSpeed = 14;

export function createMagicGuide({ heading = "", text, ariaLabel = "Сообщение" }) {
  const guide = document.createElement("div");
  guide.className = "magic-guide";

  if (heading) {
    const title = document.createElement("h2");
    title.className = "guide-heading";
    title.textContent = heading;
    guide.append(title);
  }

  const body = document.createElement("div");
  body.className = "magic-guide-body";

  const logo = document.createElement("a");
  logo.className = "guide-logo-link";
  logo.href = logoLink;
  logo.target = "_blank";
  logo.rel = "noopener noreferrer";
  logo.setAttribute("aria-label", "Darles Games во ВКонтакте");

  const image = document.createElement("img");
  image.className = "guide-logo";
  image.src = logoUrl;
  image.alt = "Darles Games";
  logo.append(image);

  const bubble = document.createElement("section");
  bubble.className = "speech-bubble";
  bubble.setAttribute("aria-label", ariaLabel);

  const typedText = document.createElement("p");
  typedText.className = "typed-text";
  bubble.append(typedText);

  body.append(logo, bubble);
  guide.append(body);
  typeText(typedText, text);

  return guide;
}

function typeText(element, text) {
  element.textContent = "";
  element.dataset.fullText = text;

  let index = 0;

  function tick() {
    if (element.dataset.fullText !== text) {
      return;
    }

    element.textContent = text.slice(0, index);
    index += 1;

    if (index <= text.length) {
      window.setTimeout(tick, typeSpeed);
      return;
    }

    element.classList.add("is-complete");
  }

  window.setTimeout(tick, 80);
}
