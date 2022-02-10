import ArLocal from 'arlocal';
import Sweets from 'arlocal-sweets';
import Blockweave from 'blockweave';
import Ardb from 'ardb';
import ArdbTransaction from 'ardb/lib/models/transaction';

(async () => {
  const arLocal = new ArLocal();
  const blockweave = new Blockweave({
    url: 'http://localhost:1984'
  });

  const wallet = await blockweave.wallets.generate();

  const sweets = new Sweets(blockweave, wallet);
  const ardb = new Ardb(blockweave);

  // Start is a Promise, we need to start it inside an async function.
  await arLocal.start();

  // Your tests here...
  console.log(await blockweave.network.getInfo());

  // Add funds to wallet
  await sweets.fundWallet(1e12);

  // Create a new transaction
  const tx = await blockweave.createTransaction({
    data: 'Hello Arweave Community!'
  }, wallet);
  tx.addTag('App-Name', 'Testing');
  tx.addTag('App-Version', '1.0.0');

  // Sign the transaction
  const data = await tx.signAndPost();

  // Mine a new block
  await sweets.mine();

  // Get the transaction
  const result = await ardb.search('transactions').appName('Testing').findOne() as ArdbTransaction;
  console.log(result.id, tx.id, result.id === tx.id);


  // After we are done with our tests, let's close the connection.
  await arLocal.stop();
})();