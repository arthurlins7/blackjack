document.addEventListener('DOMContentLoaded', () => {
  const btnSim = document.getElementById('btn-sim');
  const btnNao = document.getElementById('btn-nao');

  if (btnSim && btnNao) {
    btnSim.addEventListener('click', () => {
      document.getElementById('age-popup').style.display = 'none';
    });

    btnNao.addEventListener('click', () => {
      document.body.innerHTML = '<h2 style="color:white;text-align:center;margin-top:20%">Você deve ser maior de 18 anos para acessar este jogo.</h2>';
    });
  }
});

const form = document.getElementById('start-form');
const setup = document.getElementById('setup');
const game = document.getElementById('game');
const playersArea = document.getElementById('players-area');
const dealerCards = document.getElementById('dealer-cards');
const scoreboard = document.getElementById('scoreboard');
const playerNamesDiv = document.getElementById('player-names');
const numPlayersInput = document.getElementById('num-players');
const controls = document.getElementById('controls');

let players = [];
let scores = {};
let rounds = 3;
let currentRound = 1;
let timeout = 30;
let deck = [];
let hands = {};
let currentPlayerIndex = 0;

numPlayersInput.addEventListener('change', () => {
  const num = parseInt(numPlayersInput.value);
  playerNamesDiv.innerHTML = '';
  for (let i = 1; i <= num; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Nome do Jogador ${i}`;
    input.required = true;
    input.classList.add('player-name');
    playerNamesDiv.appendChild(input);
    playerNamesDiv.appendChild(document.createElement('br'));
  }
});

numPlayersInput.dispatchEvent(new Event('change'));

form.addEventListener('submit', e => {
  e.preventDefault();

  // evita que o jogo comece de novo sem querer
  if (game.style.display === 'block') return;

  const nameInputs = document.querySelectorAll('.player-name');
  players = Array.from(nameInputs).map(input => input.value.trim()).filter(name => name);
  if (players.length < 2 || players.length > 4) {
    alert('Informe entre 2 e 4 jogadores.');
    return;
  }

  players.push('Banca');
  players.forEach(p => scores[p] = 0);

  rounds = parseInt(document.getElementById('rounds').value);
  timeout = parseInt(document.getElementById('timeout').value);

  setup.style.display = 'none';
  game.style.display = 'block';
  startRound();
});

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  deck = [];
  for (let suit of suits) {
    for (let val of values) {
      deck.push(`${val}${suit}`);
    }
  }
  deck = deck.sort(() => Math.random() - 0.5);
}

function drawCard() {
  return deck.pop();
}

function cardValue(card) {
  const val = card.slice(0, -1);
  if (['J', 'Q', 'K'].includes(val)) return 10;
  if (val === 'A') return 11;
  return parseInt(val);
}

function calculateHandValue(cards) {
  let total = 0;
  let aces = 0;
  for (let card of cards) {
    const val = cardValue(card);
    total += val;
    if (card.startsWith('A')) aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function startRound() {
  createDeck();
  playersArea.innerHTML = '';
  dealerCards.innerHTML = '';
  hands = {};
  currentPlayerIndex = 0;

  for (let player of players) {
    hands[player] = [drawCard(), drawCard()];

    const playerIndex = players.indexOf(player);
    const imgSrc = player === 'Banca' ? 'img/dealer.png' : `img/player${playerIndex + 1}.png`;

    const div = document.createElement('div');
    div.classList.add('player');
    div.innerHTML = `
      <h3><img src="${imgSrc}" class="avatar"> ${player}</h3>
      <div class="cards" id="${player}-cards"></div>
    `;

    if (player === 'Banca') {
      // atualiza o conteúdo do container da banca
      const dealerContainer = document.getElementById('dealer-area');
      dealerContainer.innerHTML = div.innerHTML;
    } else {
      playersArea.appendChild(div);
    }
  }

  controls.innerHTML = '';
  renderHands();
  nextTurn();
}

function renderHands() {
  for (let player of players) {
    const container = document.getElementById(`${player}-cards`) || dealerCards;
    container.innerHTML = '';
    hands[player].forEach(card => {
      container.appendChild(createCardElement(card));
    });
  }
}

function nextTurn() {
  if (currentPlayerIndex >= players.length - 1) {
    playDealer();
    return;
  }

  const player = players[currentPlayerIndex];
  controls.innerHTML = `<h3>Vez de ${player}</h3>
    <button onclick="hit()">Pedir Carta</button>
    <button onclick="stand()">Parar</button>`;
}

function hit() {
  const player = players[currentPlayerIndex];
  hands[player].push(drawCard());
  renderHands();
  if (calculateHandValue(hands[player]) > 21) {
    stand();
  }
}

function stand() {
  currentPlayerIndex++;
  nextTurn();
}

function playDealer() {
  const dealer = 'Banca';
  while (calculateHandValue(hands[dealer]) < 17) {
    hands[dealer].push(drawCard());
  }
  renderHands();
  defineWinner();
}

function defineWinner() {
  const dealerScore = calculateHandValue(hands['Banca']);
  for (let player of players) {
    if (player === 'Banca') continue;
    const playerScore = calculateHandValue(hands[player]);
    if (playerScore > 21 || (dealerScore <= 21 && dealerScore >= playerScore)) {
      scores['Banca'] += 10;
    } else {
      scores[player] += 10;
    }
  }
  updateScoreboard();
  currentRound++;
  if (currentRound <= rounds) {
    setTimeout(startRound, 3000);
  } else {
    controls.innerHTML = '<h2>Partida encerrada!</h2>';
  }
}

function createCardElement(value) {
  const div = document.createElement('div');
  div.classList.add('card');
  div.innerText = value;
  return div;
}

function updateScoreboard() {
  scoreboard.innerHTML = `<h3>Placar (Rodada ${currentRound}/${rounds})</h3>` +
    players.map(p => `<p>${p}: ${scores[p]}</p>`).join('');
}
