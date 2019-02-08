# connect-4-solver
[WIP] Help you beat your friends in Connect 4

### Instructions
```
yarn

yarn start
```

- The input has this format: `player0,xPos0,yPos0 player1,xPos1,yPos1 ...`  For example: 0,1,1 1,1,2 0,2,1 1,2,2
- Position index starts with 1 instead of 0. Human friendly!
- It will keep appending move(s) at every prompt.
- By default, the player 0 is self and player 1 is opponent.  Next move is optimized for player 0.
- Default depth for minimax search is 6.


### License
[MIT](https://raw.githubusercontent.com/sihoang/connect-4-solver/master/LICENSE) Copyright (c) 2019 Hoang Nguyen
