class Entity {
  constructor(src) {
    this.element = document.createElement('img');
    this.setImg(src);
  }
  setImg(src) {
    this.element.src = `imgs/${src}`;
  }
}

class Wall extends Entity {
  constructor() {
    super('environment/wall.png');
  }
}

class Grass extends Entity {
  constructor() {
    super(`environment/grass${getRandom(1, 3)}.png`);
  }
}

class Gold extends Entity {
  constructor(value) {
    super('gold.gif');
    this.value = value;
  }
}

class Dungeon extends Entity {
  constructor(isOpen, hasPrincess = false, gold = 0, items = []) {
    super(`dungeon/${isOpen ? 'open' : 'closed'}.png`);
    this.isOpen = isOpen;
    this.hasPrincess = hasPrincess;
    this.gold = gold;
    this.items = items;
  }
  open() {
    this.isOpen = true;
    this.setImg('dungeon/open.png');
  }
}

class Tradesman extends Entity {
  constructor(items) {
    super('tradesman.gif');
    this.items = items;
  }
}
