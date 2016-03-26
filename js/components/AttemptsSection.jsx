import React from 'react';
import Relay from 'react-relay';

import AttemptsMarkdownSection from './AttemptsMarkdownSection';
import AttemptsNumericAnswerSection from './AttemptsNumericAnswerSection';

class AttemptsSection extends React.Component {
  get componentTypes() {
    return {
      markdown: AttemptsMarkdownSection,
      numericAnswer: AttemptsNumericAnswerSection,
    };
  }
  render() {
    const { id, kind } = this.props.section;
    const detailedSection = this.componentTypes[kind];
    return React.createElement(detailedSection, {
      key: id,
      section: this.props.section,
      onComplete: this.props.onComplete,
    });
  }
}

export default Relay.createContainer(AttemptsSection, {
  fragments: {
    section: () => Relay.QL`
    fragment on Section {
      id,
      name,
      kind,
      ${ AttemptsMarkdownSection.getFragment('section') },
      ${ AttemptsNumericAnswerSection.getFragment('section') },
    }`,
  },
});
