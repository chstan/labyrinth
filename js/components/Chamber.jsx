import React from 'react';
import Relay from 'react-relay';
import Section from './Section';

class Chamber extends React.Component {
  render() {
    return (
      <article>
      <header><h1>{ this.props.chamber.name }</h1></header>
      { this.props.chamber.sections.map(section =>
        <Section key={ section.id } section={ section } />
      )}
      </article>
    );
  }
}


export default Relay.createContainer(Chamber, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      name,
      sections {
        id,
        ${ Section.getFragment('section') },
      },
    }`,
  },
});
