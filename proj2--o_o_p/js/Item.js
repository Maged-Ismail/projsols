class Item extends Entity {
  constructor(value, rarity, type) {
    super(`items/${type}.png`);
    this.name = `${ITEM_RARITIES[rarity]} ${type}`;
    this.value = value;
    this.rarity = rarity;
    this.sound = new Audio(`sounds/${type}.wav`);
  }
}

class Potion extends Item {
  constructor(rarity) {
    const value = (rarity + 1) * 10;
    super(value, rarity, 'potion');
    this.potency = (rarity + 1) * 10;
  }
  use(target) {
    if (!(target instanceof Creature)) return;
    target.hp = Math.min(target.hp + this.potency, target.getMaxHp());
    this.sound.play();
  }
}

class Bomb extends Item {
  constructor(rarity) {
    const value = (rarity + 1) * 20;
    super(value, rarity, 'bomb');
    this.damage = (rarity + 1) * 30;
  }
  use(target) {
    if (!(target instanceof Creature)) return;
    target.hit(this.damage);
    this.sound.play();
  }
}

class Key extends Item {
  constructor() {
    super(100, 3, 'key');
  }
  use(target) {
    if (!(target instanceof Dungeon)) return;
    target.open();
    if (!target.hasPrincess) this.sound.play();
  }
}
