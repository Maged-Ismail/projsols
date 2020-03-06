class Position {
  constructor(row, column) {
    this.row = row;
    this.column = column;
  }
}

class Board {
  constructor(rows, columns) {
    this.rows = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        if (i === 0 || i === rows - 1 || j === 0 || j === columns - 1) {
          row.push(new Wall());
        } else row.push(new Grass());
      }
      this.rows.push(row);
    }
  }
  render(root) {
    this.root = root;
    this.rows.forEach((row) => {
      const rowElement = document.createElement('div');
      rowElement.className = 'row';
      row.forEach((entity) => {
        rowElement.appendChild(entity.element);
      });
      root.appendChild(rowElement);
    });
  }
  setEntity(entity, position) {
    this.rows[position.row][position.column] = entity;
    const oldChild = this.root.childNodes[position.row].childNodes[
      position.column
    ];
    this.root.childNodes[position.row].replaceChild(entity.element, oldChild);
  }
  getEntity(position) {
    return this.rows[position.row][position.column];
  }
}
