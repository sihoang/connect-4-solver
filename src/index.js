import '@babel/polyfill';
import assert from 'assert';
import readline from 'readline';
import _ from 'lodash';

import { DEFAULT_DEPTH, BOARD_WIDTH, BOARD_HEIGHT } from './configs';

import canConnect4 from './canConnect4';

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
    // height is dynamically growing
    // so that we can get the coord[xPos].length
    // use map because fill will copy the reference
    // and fill the array with references to that object
    coord: new Array(BOARD_WIDTH).fill([]).map(() => []),
    // Player 0 is next mover
    // Get player 0 to win
    nextPlayer: 0,
    type: 'max',
    currentPlayer: 1,
    winner: null,
  };

  const moves = input.split(' ');
  for (const move of moves) {
    const [player, x, y] = move.split(',');
    node.coord[Number(x)][Number(y)] = Number(player);
  }

  // Rotate 90 degree
  console.log(node.coord);

  // array of player's moves: [ <# of player 0's moves>, <# of player 1's moves> ]
  const moveCounts = [0, 0];
  for (let i = 0; i < BOARD_WIDTH; i += 1) {
    for (let j = 0; j < node.coord[i].length; j += 1) {
      const player = node.coord[i][j];
      if (player !== undefined) {
        moveCounts[player] += 1;
      } else {
        throw new Error(`Coord ${i},${j} is supposed to have a move.`);
      }
    }
  }

  assert(moveCounts.length === 2, `Must have 2 players.`);

  assert(
    moveCounts[1] === moveCounts[0] || moveCounts[1] - moveCounts[0] === 1,
    `Invalid number of moves. Play 1's moves must be equal or greater than Player 0's move by 1`,
  );

  return node;
};

const hasWinner = node => {
  return node.winner === 0 || node.winner === 1;
};

const getChildren = node => {
  const children = [];
  for (let i = 0; i < BOARD_WIDTH; i += 1) {
    const child = _.cloneDeep(node);
    child.type = node.type === 'max' ? 'min' : 'max';
    child.currentPlayer = node.nextPlayer;
    child.nextPlayer = node.currentPlayer;

    const yPos = node.coord[i].length;
    if (yPos < BOARD_HEIGHT) {
      child.coord[i].push(child.currentPlayer);
      if (canConnect4(child, i, yPos)) {
        child.winner = child.currentPlayer;
      }
      child.move = `${child.currentPlayer},${i},${yPos}`;
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
    return node.currentPlayer === 0 ? 200 : -200;
  }
  // TODO improve the score function
  return Math.floor(Math.random() * 100);
};

const minimax = (node, depth = DEFAULT_DEPTH) => {
  if (leaf(node) || depth === 0) {
    return evaluate(node);
  }

  if (node.type === 'max') {
    let v = Number.MIN_SAFE_INTEGER;
    for (const child of getChildren(node)) {
      const vprime = minimax(child, depth - 1);
      if (vprime > v) {
        v = vprime;
      }
    }
    return v;
  }

  if (node.type === 'min') {
    let v = Number.MAX_SAFE_INTEGER;
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
    next[child.move] = minimax(child);
  }
  return next;
};

async function main() {
  console.log('Connect 4 Solver');
  let moves = '';
  while (true) {
    const userInput = await readUserInput('Enter move(s): ');
    try {
      const currentMoves = `${moves} ${userInput}`.trim();
      console.log(`Current game state: ${currentMoves}`);

      const node = validateUserInput(currentMoves);
      console.log(nextMoves(node));
      moves = currentMoves;
    } catch (e) {
      console.log(`Invalid input. Try again! Error: ${e}`);
    }
  }
}

main().finally(() => {
  rl.close();
});
