import { loadFirebaseApp } from "./firebase.js";

const symbols = [
  { id: "sun", label: "해", art: sunArt },
  { id: "moon", label: "달", art: moonArt },
  { id: "star", label: "별", art: starArt },
  { id: "heart", label: "하트", art: heartArt },
  { id: "leaf", label: "잎", art: leafArt },
  { id: "bolt", label: "번개", art: boltArt }
];

let deck = [];
let openCards = [];
let matched = [];
let moves = 0;
let lockBoard = false;
let firebaseReady = false;

const root = document.querySelector("#root");

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createDeck() {
  return shuffle(
    symbols.flatMap((symbol) => [
      { ...symbol, cardId: `${symbol.id}-a` },
      { ...symbol, cardId: `${symbol.id}-b` }
    ])
  );
}

function message() {
  if (matched.length !== deck.length) return "같은 그림 두 장을 찾아보세요";
  if (moves <= 10) return "완벽해요. 엄청 빠른 성공!";
  if (moves <= 16) return "좋아요. 기억력이 반짝입니다";
  return "성공! 다시 섞어서 한 판 더 해볼까요?";
}

function render() {
  root.innerHTML = `
    <main class="app-shell">
      <section class="game-panel" aria-label="카드 짝맞추기 게임">
        <header class="game-header">
          <div>
            <p class="eyebrow">Firebase + Vercel 준비 완료</p>
            <h1>카드 짝맞추기</h1>
            <p class="status">${message()}</p>
          </div>
          <button class="icon-button" type="button" id="restart" aria-label="게임 다시 시작">
            <span aria-hidden="true">↻</span>
          </button>
        </header>

        <div class="score-row" aria-label="게임 점수">
          <span>시도 ${moves}</span>
          <span>성공 ${matched.length / 2} / ${symbols.length}</span>
          <span>${firebaseReady ? "Firebase 연결됨" : "로컬 모드"}</span>
        </div>

        <div class="card-grid">
          ${deck.map(cardMarkup).join("")}
        </div>
      </section>
    </main>
  `;

  document.querySelector("#restart").addEventListener("click", restart);
  document.querySelectorAll(".memory-card").forEach((button) => {
    button.addEventListener("click", () => selectCard(button.dataset.cardId));
  });
}

function cardMarkup(card) {
  const isOpen = openCards.some((item) => item.cardId === card.cardId);
  const isMatched = matched.includes(card.cardId);
  const revealed = isOpen || isMatched;

  return `
    <button
      class="memory-card ${revealed ? "is-open" : ""} ${isMatched ? "is-matched" : ""}"
      type="button"
      data-card-id="${card.cardId}"
      aria-label="${revealed ? `${card.label} 카드` : "뒤집힌 카드"}"
      aria-pressed="${revealed}"
    >
      <span class="card-face card-back">?</span>
      <span class="card-face card-front">${card.art()}</span>
    </button>
  `;
}

function selectCard(cardId) {
  const card = deck.find((item) => item.cardId === cardId);

  if (!card || lockBoard) return;
  if (matched.includes(card.cardId)) return;
  if (openCards.some((item) => item.cardId === card.cardId)) return;
  if (openCards.length >= 2) return;

  openCards = [...openCards, card];
  render();

  if (openCards.length === 2) {
    moves += 1;
    lockBoard = true;
    window.setTimeout(checkPair, openCards[0].id === openCards[1].id ? 450 : 800);
  }
}

function checkPair() {
  const [first, second] = openCards;

  if (first.id === second.id) {
    matched = [...matched, first.cardId, second.cardId];
  }

  openCards = [];
  lockBoard = false;
  render();
}

function restart() {
  deck = createDeck();
  openCards = [];
  matched = [];
  moves = 0;
  lockBoard = false;
  render();
}

function svg(content) {
  return `<svg class="card-art" viewBox="0 0 120 120" role="img" aria-hidden="true">${content}</svg>`;
}

function sunArt() {
  return svg(`
    <circle cx="60" cy="60" r="24" fill="#ffcb45" />
    <g stroke="#e98b22" stroke-width="8" stroke-linecap="round">
      <path d="M60 15v14" /><path d="M60 91v14" /><path d="M15 60h14" /><path d="M91 60h14" />
      <path d="M28 28l10 10" /><path d="M82 82l10 10" /><path d="M92 28L82 38" /><path d="M38 82L28 92" />
    </g>
  `);
}

function moonArt() {
  return svg(`<circle cx="64" cy="56" r="36" fill="#8ec5ff" /><circle cx="78" cy="44" r="36" fill="#fff" />`);
}

function starArt() {
  return svg(`<path d="M60 16l12 29 31 3-24 20 7 31-26-16-27 16 7-31-23-20 31-3z" fill="#f6b53f" />`);
}

function heartArt() {
  return svg(`<path d="M60 98S22 75 22 43c0-15 10-25 24-25 8 0 14 4 18 10 4-6 10-10 18-10 14 0 24 10 24 25 0 32-46 55-46 55z" fill="#f36f7b" />`);
}

function leafArt() {
  return svg(`<path d="M98 23C58 22 27 43 24 84c39 5 67-15 74-61z" fill="#63bf77" /><path d="M30 88c23-24 42-40 66-62" stroke="#2e7e4b" stroke-width="7" stroke-linecap="round" />`);
}

function boltArt() {
  return svg(`<path d="M68 10L28 67h28l-7 43 43-61H64z" fill="#7c74ff" />`);
}

async function boot() {
  deck = createDeck();
  render();

  try {
    firebaseReady = Boolean(await loadFirebaseApp());
  } catch {
    firebaseReady = false;
  }

  render();
}

boot();
