import '@babel/polyfill';
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

const validateUserInput = input => {
  return !!input;
};

const nextMoves = input => {
  return input;
};

async function main() {
  console.log('Connect 4 Solver');
  let input = '';
  while (true) {
    input = await readUserInput('Enter game state: ');
    if (validateUserInput(input)) {
      break;
    } else {
      console.log('Invalid input. Try again!');
    }
  }
  console.log(nextMoves(input));
}

main()
  .catch(err => {
    console.log(`Exit gracefully: ${err}`);
  })
  .finally(() => {
    rl.close();
  });
