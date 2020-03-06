class Player extends Creature {
  constructor(name, position, board, level = 1, items = [], gold = 0) {
    super(name, 'player/front.png', level, items, gold);
    this.attackSpeed = 2000 / level;
    this.exp = 0;
    this.position = position;
    this.board = board;
  }
  render(root) {
    this.element.style.position = 'absolute';
    root.appendChild(this.element);
    this.update();
  }
  update() {
    this.element.style.top = `${this.position.row * ENTITY_SIZE}px`;
    this.element.style.left = `${this.position.column * ENTITY_SIZE}px`;
  }
  moveToPosition(position) {
    const entity = this.board.getEntity(position);
    if (entity instanceof Wall) return;
    this.position = position;
    this.update();
  }
  move(direction) {
    switch (direction) {
      case 'Up': {
        this.setImg('player/back.png');
        this.moveToPosition(
          new Position(this.position.row - 1, this.position.column)
        );
        break;
      }
      case 'Down': {
        this.setImg('player/front.png');
        this.moveToPosition(
          new Position(this.position.row + 1, this.position.column)
        );
        break;
      }
      case 'Left':
        this.setImg('player/left.png');
        this.moveToPosition(
          new Position(this.position.row, this.position.column - 1)
        );
        break;
      case 'Right':
        this.setImg('player/right.png');
        this.moveToPosition(
          new Position(this.position.row, this.position.column + 1)
        );
        break;
    }
  }
  pickup(entity) {
    if (entity instanceof Item) {
      this.items.push(entity);
      playSound('loot');
    }
    if (entity instanceof Gold) {
      this.gold += entity.value;
      playSound('gold');
    }
  }
  attack(entity) {
    super.attack(entity);
    playSound('pattack');
  }
  buy(item, tradesman) {
    if (!(item instanceof Item) || this.gold < item.value) return false;
    this.gold -= item.value;
    this.items.push(item);
    remove(tradesman.items, item);
    playSound('trade');
    return true;
  }
  sell(item, tradesman) {
    if (!(item instanceof Item)) return false;
    this.gold += item.value;
    remove(this.items, item);
    tradesman.items = tradesman.items.concat(item);
    playSound('trade');
    return true;
  }
  useItem(item, target) {
    item.use(target);
    remove(this.items, item);
  }
  loot(entity) {
    if (entity.items.length === 0 && entity.gold === 0) return;
    this.items = this.items.concat(entity.items);
    this.gold += entity.gold;
    entity.items = [];
    entity.gold = 0;
    playSound('loot');
  }
  getExpToLevel() {
    return this.level * 10;
  }
  getExp(entity) {
    this.exp += entity.level * 10;
    while (this.exp >= this.getExpToLevel()) {
      this.exp = this.exp - this.getExpToLevel();
      this.levelUp();
    }
  }
  levelUp() {
    this.level++;
    this.hp = this.getMaxHp();
    this.strength = this.level * 10;
    this.attackSpeed = 3000 / this.level;
    playSound('levelup');
  }
}
