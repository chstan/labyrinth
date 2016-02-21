import React from 'react';

import svgs from './SVGs';

import './SectionCompletedBanner.scss';

class SectionCompletedBanner extends React.Component {
  render() {
    return (
      <span className="badge button-badge complete">
        <span className="icon">{ svgs.check }</span>
        <span className="content">Done</span>
      </span>
    );
  }
}

export default SectionCompletedBanner;
