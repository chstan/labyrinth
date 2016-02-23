import React from 'react';
import Relay from 'react-relay';

import AttemptsMarkdownSection from './AttemptsMarkdownSection';

class AttemptsSection extends React.Component {
  get componentTypes() {
    return {
      markdown: AttemptsMarkdownSection,
    };
  }
  render() {
    const kind = this.props.section.kind;
    const id = this.props.section.id;
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
    }`,
  },
});
