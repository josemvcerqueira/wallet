import React, {useEffect, useState, useRef} from 'react';
import Header from './header.js';
import {getWallet, getWeb3} from './utils.js';

const App = () => {
  const web3Ref = useRef(null);
  const [accounts, setAccounts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [approvers, setApprovers] = useState(null);
  const [quorum, setQuorum] = useState(null);

  useEffect(() => {
    (async () => {
      const web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      const wallet = await getWallet(web3);
      const approvers = await wallet.methods.getApprovers().call();
      const quorum = await wallet.methods.quorum().call();
      web3Ref.current = web3;
      setAccounts(accounts);
      setWallet(wallet);
      setApprovers(approvers);
      setQuorum(quorum);
    })();
  }, []);

  if (!web3Ref.current || accounts.length === 0 || !wallet || !approvers || !quorum) {
    return <div>Loading ...</div>;
  }

  return (
    <div>Multisig Dapp

      <Header quorum={quorum} approvers={approvers}/>
    </div>
  );
};

export default App;
