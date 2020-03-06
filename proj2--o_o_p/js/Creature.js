class Creature extends Entity {
  constructor(name, img, level, items, gold) {
    super(img);
    this.name = name;
    this.level = level;
    this.items = items;
    this.gold = gold;
    this.hp = level * 100;
    this.strength = level * 10;
    this.attackSpeed = 3000 / level;
  }
  getMaxHp() {
    return this.level * 100;
  }
  hit(val) {
    this.hp = Math.max(0, this.hp - val);
  }
  attack(entity) {
    entity.hit(this.strength);
  }
}

class Monster extends Creature {
  constructor(name, level = 1, items = [], gold = 0) {
    super(name, `monsters/${name.split(' ').join('')}.gif`, level, items, gold);
  }
  attack(entity) {
    super.attack(entity);
    playSound('mattack');
  }
}
