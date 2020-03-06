// selectors
const boardElement = document.getElementById('board');
const actioncam = document.getElementById('action-cam');

// sounds
const sounds = {
  bg: new Audio('sounds/bg.mp3'),
  loot: new Audio('sounds/loot.mp3'),
  trade: new Audio('sounds/trade.wav'),
  pattack: new Audio('sounds/pattack.wav'),
  mattack: new Audio('sounds/mattack.wav'),
  gold: new Audio('sounds/gold.wav'),
  levelup: new Audio('sounds/levelup.wav'),
  death: new Audio('sounds/death.wav'),
  battle: new Audio('sounds/battle.mp3'),
  win: new Audio('sounds/win.mp3'),
};

// game state
let GAME_STATE = 'PLAY';

// init board
const board = new Board(20, 25);
board.render(boardElement);

// init player
const centerPosition = new Position(
  Math.floor(board.rows.length / 2),
  Math.floor(board.rows[0].length / 2)
);
const player = new Player('Van', centerPosition, board, 1, [
  new Potion(0),
  new Bomb(0),
]);
player.render(boardElement);

updateActionCam();

// board entities

// monsters
for (let i = 0; i < MAX_MONSTERS; i++) {
  const randomName = MONSTER_NAMES[getRandom(0, MONSTER_NAMES.length - 1)];
  const monster = new Monster(
    randomName,
    getRandom(1, 3),
    [new Potion(getRandom(1, 3)), new Bomb(getRandom(1, 3))],
    getRandom(0, 50)
  );
  if (i === MAX_MONSTERS - 1) monster.items.push(new Key());
  board.setEntity(monster, getRandomPosition(board));
}

// items
const potion = new Potion(0);
board.setEntity(potion, getRandomPosition(board));
const bomb = new Bomb(0);
board.setEntity(bomb, getRandomPosition(board));

const gold = new Gold(20);
board.setEntity(gold, getRandomPosition(board));

// dungeons
const dungeonOpen = new Dungeon(true, false, 30, [new Potion(2), new Bomb(2)]);
board.setEntity(dungeonOpen, getRandomPosition(board));
const dungeonClosed = new Dungeon(false, false, 50, [new Bomb(3)]);
board.setEntity(dungeonClosed, getRandomPosition(board));
const dungeonPrincess = new Dungeon(false, true);
board.setEntity(dungeonPrincess, getRandomPosition(board));

// tradesman
const tradesman = new Tradesman([
  new Potion(0),
  new Potion(1),
  new Potion(2),
  new Potion(3),
  new Bomb(0),
  new Bomb(1),
  new Bomb(2),
  new Bomb(3),
  new Key(),
]);
board.setEntity(tradesman, getRandomPosition(board));

// event handlers

let monsterAttack;
document.addEventListener('keydown', (ev) => {
  if (!ev.key.includes('Arrow') || GAME_STATE === 'GAME_OVER') return;
  if (sounds.bg.paused) playMusic('bg');

  clearInterval(monsterAttack); // stop monster attack when player moves
  const direction = ev.key.replace('Arrow', '');
  player.move(direction);

  const entity = board.getEntity(player.position);
  if (entity instanceof Monster) encounterMonster(entity);
  updateActionCam();
});

// helper functions

function getRandomPosition(board) {
  let position;
  while (
    !position ||
    !(board.getEntity(position) instanceof Grass) ||
    (position.row === player.position.row &&
      position.column === player.position.column)
  ) {
    position = new Position(
      getRandom(1, board.rows.length - 2),
      getRandom(1, board.rows[0].length - 2)
    );
  }
  return position;
}

function encounterMonster(monster) {
  playMusic('battle');
  monsterAttack = setInterval(() => {
    monster.attack(player);
    if (player.hp <= 0) playerDeath();
    document.getElementById('Player-hp').textContent = `HP: ${player.hp}`;
  }, monster.attackSpeed);
}

function playerDeath() {
  clearInterval(monsterAttack);
  boardElement.innerHTML = '<h1>GAME OVER</h1>';
  document.getElementById('player-cam').src = 'imgs/player/dead.png';
  document.getElementById('action-menu').style.display = 'none';
  GAME_STATE = 'GAME_OVER';
  playMusic('death');
}

function defeatMonster(monster) {
  player.getExp(monster);
  player.loot(monster);
  clearInterval(monsterAttack);
  playMusic('bg');
  clearEntity(player.position);
  updateActionCam();
}

function clearEntity(position) {
  board.setEntity(new Grass(), position);
}

// DOM manipulation functions

function updateActionCam() {
  const entity = board.getEntity(player.position);
  actioncam.innerHTML = '';
  actioncam.appendChild(createActionView(entity));
  actioncam.appendChild(createActionView(player));
  actioncam.appendChild(createActionMenu(entity));
}

function createActionView(entity) {
  const actionView = document.createElement('div');
  actionView.className = 'action-view';
  const infoWrapper = document.createElement('div');

  // Add name
  const name = document.createElement('h3');
  name.textContent = entity.name || entity.constructor.name; // use constructor name as fallback
  infoWrapper.appendChild(name);

  // Adds level, hp and gold info
  if (entity instanceof Creature) createCreatureView(infoWrapper, entity);

  // Add value info
  if (entity.value) {
    const value = document.createElement('h4');
    value.textContent = `Value: ${entity.value}`;
    infoWrapper.appendChild(value);
  }

  // Add the entity image
  const img = document.createElement('img');
  img.id = entity instanceof Player ? 'player-cam' : 'entity-cam';
  img.src =
    entity instanceof Player ? 'imgs/player/attack.png' : entity.element.src;
  actionView.appendChild(infoWrapper);
  actionView.appendChild(img);

  return actionView;
}

function createCreatureView(root, creature) {
  const level = document.createElement('h4');
  level.textContent = `Level ${creature.level}`;
  const hp = document.createElement('h4');
  hp.id = creature.constructor.name + '-hp';
  hp.textContent = `HP: ${creature.hp}`;
  const gold = document.createElement('h4');
  gold.textContent = `Gold: ${creature.gold}`;
  root.appendChild(hp);
  root.appendChild(level);
  root.appendChild(gold);
}

function createActionMenu(entity) {
  const actionMenu = document.createElement('div');
  actionMenu.id = 'action-menu';

  if (entity instanceof Item || entity instanceof Gold) {
    createPickupMenu(actionMenu, entity);
  }
  if (entity instanceof Monster) createMonsterMenu(actionMenu, entity);
  if (entity instanceof Tradesman) createTradeMenu(actionMenu, entity);
  if (entity instanceof Dungeon) createDungeonMenu(actionMenu, entity);

  return actionMenu;
}

function createPickupMenu(root, entity) {
  const actions = document.createElement('div');
  actions.textContent = 'Actions';
  const pickupBtn = document.createElement('button');
  pickupBtn.textContent = 'Pickup';
  pickupBtn.addEventListener('click', () => {
    player.pickup(entity);
    clearEntity(player.position);
    updateActionCam();
  });
  actions.appendChild(pickupBtn);
  root.appendChild(actions);
}

function createMonsterMenu(root, monster) {
  const actions = document.createElement('div');
  actions.textContent = 'Actions';
  let attackBtn = document.createElement('button');
  attackBtn.textContent = 'Attack';
  attackBtn.addEventListener('click', () => {
    player.attack(monster);
    if (monster.hp <= 0) {
      defeatMonster(monster);
    } else {
      attackBtn.disabled = true;
      setTimeout(() => (attackBtn.disabled = false), player.attackSpeed);
      document.getElementById('Monster-hp').textContent = `HP: ${monster.hp}`;
    }
  });
  actions.appendChild(attackBtn);
  root.appendChild(actions);

  if (player.items.length > 0) createItemActions(root, monster);
}

function createItemActions(root, monster) {
  const items = document.createElement('div');
  items.textContent = 'Items';
  player.items.forEach((item) => {
    if (item instanceof Key) return;
    const itemBtn = document.createElement('button');
    itemBtn.textContent = item.name;
    itemBtn.addEventListener('click', () => {
      if (item instanceof Potion) player.useItem(item, player);
      if (item instanceof Bomb) player.useItem(item, monster);
      if (monster.hp <= 0) defeatMonster(monster);
      else {
        items.removeChild(itemBtn);
        document.getElementById('Player-hp').textContent = `HP: ${player.hp}`;
        document.getElementById('Monster-hp').textContent = `HP: ${monster.hp}`;
      }
    });
    items.appendChild(itemBtn);
  });
  root.appendChild(items);
}

function createTradeMenu(root, tradesman) {
  const buyAction = document.createElement('div');
  buyAction.textContent = 'Buy';
  tradesman.items.forEach((item) => {
    const itemBtn = document.createElement('button');
    itemBtn.textContent = `${item.name} - ${item.value}G`;
    itemBtn.disabled = player.gold < item.value;
    itemBtn.addEventListener('click', () => {
      player.buy(item, tradesman);
      updateActionCam();
    });
    buyAction.appendChild(itemBtn);
  });
  const sellAction = document.createElement('div');
  sellAction.textContent = 'Sell';
  player.items.forEach((item) => {
    const itemBtn = document.createElement('button');
    itemBtn.textContent = `${item.name} - ${item.value}G`;
    itemBtn.addEventListener('click', () => {
      player.sell(item, tradesman);
      updateActionCam();
    });
    sellAction.appendChild(itemBtn);
  });
  root.appendChild(buyAction);
  root.appendChild(sellAction);
}

function createDungeonMenu(root, dungeon) {
  const actions = document.createElement('div');
  actions.textContent = 'Actions';
  if (!dungeon.isOpen) {
    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open';
    const key = player.items.find((item) => item instanceof Key);
    if (!key) openBtn.disabled = true;
    openBtn.addEventListener('click', () => {
      player.useItem(key, dungeon);
      updateActionCam();
    });
    actions.appendChild(openBtn);
    root.appendChild(actions);
  } else {
    if (dungeon.hasPrincess) {
      boardElement.innerHTML =
        '<h1>You WIN!</h1><img src="imgs/dungeon/princess.png" width=500/>';
      actioncam.style.display = 'none';
      GAME_STATE = 'GAME_OVER';
      playMusic('win');
    } else {
      const lootBtn = document.createElement('button');
      lootBtn.textContent = 'Loot';
      if (dungeon.gold === 0 && dungeon.items.length === 0) {
        lootBtn.disabled = true;
      }
      lootBtn.addEventListener('click', () => {
        player.loot(dungeon);
        updateActionCam();
      });
      actions.appendChild(lootBtn);
      root.appendChild(actions);
    }
  }
}

// utility functions

// Plays a background music while ensuring no other music is playing at the same time
function playMusic(music) {
  sounds.bg.pause();
  sounds.battle.currentTime = 0;
  sounds.battle.pause();
  sounds[music].play();
}

// Play sound from the start
function playSound(sound) {
  sounds[sound].currentTime = 0;
  sounds[sound].play();
}

// Returns a random integer between min and max (max included)
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function remove(arr, element) {
  arr.splice(arr.indexOf(element), 1);
}
