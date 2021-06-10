import React, {useState} from 'react';

const NewTransfer = ({createTransfer}) => {
  const [transfer, setTransfer] = useState(null);

  const updateTransfer = (event, key) => {
    const value = event.target.value;
    setTransfer(previousState => ({...previousState, [key]: value}));
  };

  const submit = event => {
    event.preventDefault();
    if (!transfer) {
      return;
    }

    createTransfer(transfer);
  };

  return (
    <div>
      <h2>Create Transfer</h2>
      <form onSubmit={submit}>
        <label htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="text"
          onChange={event => updateTransfer(event, 'amount')}
        />
        <label htmlFor="to">To</label>
        <input
          id="to"
          type="text"
          onChange={event => updateTransfer(event, 'to')}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default NewTransfer;
