import React from 'react';
import Relay from 'react-relay';
import ReactMarkdown from 'react-markdown';

class MarkdownSection extends React.Component {
  render() {
    return (
      <section>
      <ReactMarkdown source={ this.props.section.markdown }/>
      </section>
    );
  }
}

export default Relay.createContainer(MarkdownSection, {
  fragments: {
    section: () => Relay.QL`
    fragment on MarkdownSection {
      markdown,
    }`,
  },
});
