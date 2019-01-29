import '@babel/polyfill';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const readUserInput = (question) => {
  return new Promise((resolve, reject) => {
    rl.question(question, answer => {
      if (answer === 'quit') {
        reject('exiting');
      } else {
        resolve(answer)
      }
    });
  })
};
async function main() {
  console.log('Connect 4 Solver');
}

main().finally(() => {
  rl.close();
});
