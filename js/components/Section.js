import React from 'react';
import Relay from 'react-relay';
import MarkdownSection from './MarkdownSection';

class Section extends React.Component {
  get componentTypes() {
    return {
      markdown: MarkdownSection,
    };
  }
  render() {
    const kind = this.props.section.kind;
    const id = this.props.section.id;
    const detailedSection = this.componentTypes[kind];
    return React.createElement(detailedSection, { key: id, section: this.props.section });
  }
}

export default Relay.createContainer(Section, {
  fragments: {
    section: () => Relay.QL`
    fragment on Section {
      id,
      kind,
      ${ MarkdownSection.getFragment('section') },
    }`,
  },
});
