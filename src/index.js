import '@babel/polyfill';
import assert from 'assert';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const readUserInput = question => {
  return new Promise((resolve, reject) => {
    rl.question(question, answer => {
      if (answer === 'quit') {
        reject(new Error('killed by user.'));
      } else {
        resolve(answer);
      }
    });
  });
};

// String of "player,x-pos,y-pos player,x-pos,y-pos"
// Self: Player 0
// Oponent: Player 1
const validateUserInput = input => {
  const node = {
    type: 'min', // always start out with self next move
    board: {
      coord: [[], [], [], [], [], [], []],
    },
  };

  const moves = input.split(' ');
  for (const move of moves) {
    const [player, x, y] = move.split(',');
    node.board.coord[Number(x)][Number(y)] = Number(player);
  }

  const players = [0, 0];
  for (let i = 0; i < 7; i += 1) {
    for (let j = 0; j < node.board.coord[i].length; j += 1) {
      const player = node.board.coord[i][j];
      if (player) {
        players[player] += 1;
      } else {
        throw new Error(`Coord ${i},${j} is supposed to have a move.`);
      }
    }
  }

  assert(players.length !== 2, `Must have 2 players.`);

  assert(Math.abs(players[0] - players[1]) > 1, `Invalid number of moves.`);

  // Player 0 is next mover by default unless it has more moves than Player 1
  node.board.nextPlayer = players[0] > players[1] ? 1 : 0;
  node.board.currentPlayer = 1 - node.board.nextPlayer;

  return node;
};

const hasWinner = node => {
  return node.board.winner;
};

const connect4 = (node, xPos, yPos) => {
  const { currentPlayer, coord } = node.board;
  // check vertical
  let streak = 0;
  for (let x = 0; x < 7; x += 1) {
    if (coord[x][yPos] === currentPlayer) {
      streak += 1;
    } else {
      streak = 0;
    }
  }
  if (streak > 3) {
    return true;
  }

  // check horizontal
  streak = 0;
  for (let y = 0; y < coord[xPos].length; y += 1) {
    if (coord[xPos][y] === currentPlayer) {
      streak += 1;
    } else {
      streak = 0;
    }
  }
  if (streak > 3) {
    return true;
  }

  // check forward slash
  streak = 0;
  let x = xPos;
  let y = yPos;
  while (coord[x][y] === currentPlayer && y >= 0 && x >= 0) {
    streak += 1;
    x -= 1;
    y -= 1;
  }
  x = xPos;
  y = yPos;
  while (coord[x][y] === currentPlayer && y < 7 && x < 7) {
    streak += 1;
    x += 1;
    y += 1;
  }
  if (streak > 3) {
    return true;
  }

  // check backward slash
  streak = 0;
  x = xPos;
  y = yPos;
  while (coord[x][y] === currentPlayer && y >= 0 && x < 7) {
    streak += 1;
    x += 1;
    y -= 1;
  }
  x = xPos;
  y = yPos;
  while (coord[x][y] === currentPlayer && y < 7 && x >= 0) {
    streak += 1;
    x -= 1;
    y += 1;
  }
  if (streak > 3) {
    return true;
  }

  return false;
};

const getChildren = node => {
  const children = [];
  for (let i = 0; i < 7; i += 1) {
    const child = Object.assign({}, node);
    child.type = node.type === 'max' ? 'min' : 'max';
    child.board.currentPlayer = node.board.nextPlayer;
    child.board.nextPlayer = node.board.currentPlayer;

    const yPos = node.board.coord[i].length;
    if (yPos < 7) {
      child.board.coord[i].push(child.board.currentPlayer);
      // TODO check if this is a winning move for child.board.currentPlayer
      if (connect4(child, i, yPos)) {
        child.board.winner = child.board.currentPlayer;
      }
      child.board.move = `${child.board.currentPlayer},${i},${yPos}`;
      children.push(child);
    }
  }
  return children;
};

const leaf = node => {
  return getChildren(node).length === 0 || hasWinner(node);
};

const evaluate = node => {
  if (hasWinner(node)) {
    return node.board.currentPlayer === 0
      ? Number.MAX_SAFE_INTEGER
      : Number.MIN_SAFE_INTEGER;
  }
  // TODO improve the score function
  return Math.floor(Math.random() * 100);
};

const minimax = (node, depth) => {
  if (leaf(node) || depth === 0) {
    return evaluate(node);
  }

  if (node.type === 'max') {
    let v = Number.NEGATIVE_INFINITY;
    for (const child of getChildren(node)) {
      const vprime = minimax(child, depth - 1);
      if (vprime > v) {
        v = vprime;
      }
    }
    return v;
  }

  if (node.type === 'min') {
    let v = Number.POSITIVE_INFINITY;
    for (const child of getChildren(node)) {
      const vprime = minimax(child, depth - 1);
      if (vprime < v) {
        v = vprime;
      }
    }
    return v;
  }

  assert.fail('Not supposed to reach here!');
  return null;
};

const nextMoves = node => {
  const next = {};
  for (const child of getChildren(node)) {
    next[child.board.move] = minimax(child, 10);
  }
  return next;
};

async function main() {
  console.log('Connect 4 Solver');
  let node;
  while (true) {
    const userInput = await readUserInput('Enter game state: ');
    try {
      node = validateUserInput(userInput);
      break;
    } catch (e) {
      console.log(`Invalid input. Try again! Error: ${e}`);
    }
  }
  console.log(nextMoves(node));
}

main()
  .catch(err => {
    console.log(`Exit gracefully: ${err}`);
  })
  .finally(() => {
    rl.close();
  });
