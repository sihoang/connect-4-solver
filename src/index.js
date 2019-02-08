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

const printCoord = coord => {
  for (let y = BOARD_HEIGHT - 1; y >= 0; y -= 1) {
    const line = [];
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const value = coord[x][y] === undefined ? '-' : coord[x][y].toString();
      line.push(value);
    }
    console.log(line);
  }
};

// String of "player,x-pos,y-pos player,x-pos,y-pos"
// Position starts with (1,1)
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
    // Human's index starts with 1 instead of 0
    assert(x > 0 && y > 0, 'Position index starts with 1 instead of 0');
    node.coord[Number(x) - 1][Number(y) - 1] = Number(player);
  }

  // Rotate 90 degree
  printCoord(node.coord);

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
    `Play 1's moves must be equal or greater than Player 0's move by 1. Move counts ${moveCounts}`,
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
      // Human readable
      child.move = `${child.currentPlayer},${i + 1},${yPos + 1}`;

      children.push(child);
    }
  }
  return children;
};

const leaf = node => {
  if (hasWinner(node)) {
    return true;
  }

  // check if there're still slot
  for (let i = 0; i < BOARD_WIDTH; i += 1) {
    if (node.coord[i].length < BOARD_HEIGHT) {
      return false;
    }
  }
  // no more slot
  return true;
};

const evaluate = node => {
  if (hasWinner(node)) {
    return node.winner === 0 ? 1000 : -1000;
  }
  // TODO improve the score function
  return Math.floor(Math.random() * 100);
};

const minimax = (node, depth = DEFAULT_DEPTH) => {
  if (depth === 0 || leaf(node)) {
    return evaluate(node);
  }

  if (node.type === 'max') {
    let vMin = Number.MIN_SAFE_INTEGER;
    for (const child of getChildren(node)) {
      const vPrime = minimax(child, depth - 1);
      if (vPrime > vMin) {
        vMin = vPrime;
      }
    }
    return vMin;
  }

  if (node.type === 'min') {
    let vMax = Number.MAX_SAFE_INTEGER;
    for (const child of getChildren(node)) {
      const vPrime = minimax(child, depth - 1);
      if (vPrime < vMax) {
        vMax = vPrime;
      }
    }
    return vMax;
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
