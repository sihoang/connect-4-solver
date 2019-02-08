import { BOARD_WIDTH, BOARD_HEIGHT, WINNING_STREAK } from './configs';

export default (node, xPos, yPos) => {
  const { currentPlayer, coord } = node;

  // check horizontal
  let streak = 0;

  for (let x = 0; x < BOARD_WIDTH; x += 1) {
    if (coord[x] && coord[x][yPos] === currentPlayer) {
      streak += 1;
    } else {
      streak = 0;
    }
    if (streak === WINNING_STREAK) {
      return true;
    }
  }

  // check vertical
  streak = 0;
  for (let y = 0; y < coord[xPos].length; y += 1) {
    if (coord[xPos][y] === currentPlayer) {
      streak += 1;
    } else {
      streak = 0;
    }
    if (streak === WINNING_STREAK) {
      return true;
    }
  }

  // check forward slash
  streak = 0;
  let x = xPos;
  let y = yPos;
  while (coord[x] && coord[x][y] === currentPlayer && y >= 0 && x >= 0) {
    streak += 1;
    x -= 1;
    y -= 1;
  }

  x = xPos;
  y = yPos;
  while (
    coord[x] &&
    coord[x][y] === currentPlayer &&
    y < BOARD_HEIGHT &&
    x < BOARD_WIDTH
  ) {
    streak += 1;
    x += 1;
    y += 1;
  }
  if (streak > WINNING_STREAK) {
    return true;
  }

  // check backward slash
  streak = 0;
  x = xPos;
  y = yPos;
  while (
    coord[x] &&
    coord[x][y] === currentPlayer &&
    y >= 0 &&
    x < BOARD_WIDTH
  ) {
    streak += 1;
    x += 1;
    y -= 1;
  }

  x = xPos;
  y = yPos;
  while (
    coord[x] &&
    coord[x][y] === currentPlayer &&
    y < BOARD_HEIGHT &&
    x >= 0
  ) {
    streak += 1;
    x -= 1;
    y += 1;
  }
  if (streak > WINNING_STREAK) {
    return true;
  }

  return false;
};
