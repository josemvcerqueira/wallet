import React from 'react';

const Header = ({approvers, quorum}) => (
  <header>
    <ul>
      <li>Approvers: {approvers.join(', ')}</li>
      <li>Quorum: {quorum}</li>
    </ul>
  </header>
);

export default Header;
