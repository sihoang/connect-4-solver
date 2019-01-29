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
const validateUserInput = input => {
  const node = {
    type: 'max', // always aim for first move winner
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

const leaf = node => {
  // TODO
  return !!node;
};

const evaluate = node => {
  // TODO
  return 1;
};

const getChildren = node => {
  const children = [];
  for (let i = 0; i < 7; i += 1) {
    const child = Object.assign({}, node);
    child.type = node.type === 'max' ? 'min' : 'max';
    child.board.currentPlayer = node.board.nextPlayer;
    child.board.nextPlayer = node.board.currentPlayer;

    if (node.board.coord[i].length < 7) {
      child.board.coord[i].push(child.board.currentPlayer);
      children.push(child);
    }
  }
  return children;
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
};

const nextMoves = input => {
  // TODO
  return input;
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
