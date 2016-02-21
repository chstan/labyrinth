import Relay from 'react-relay';

class AttemptMarkdownSectionMutation extends Relay.Mutation {
  static fragments = {
    section: () => Relay.QL`
    fragment on Section {
      id,
      chamber {
        id
      }
    }`,
  };
  getMutation() {
    return Relay.QL`
      mutation {attemptMarkdownSection}
    `;
  }
  getVariables() {
    return { id: this.props.section.id };
  }
  getFatQuery() {
    return Relay.QL`
    fragment on AttemptMarkdownSectionPayload {
      chamber {
        status
      },
      section
    }`;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        chamber: this.props.section.chamber.id,
        section: this.props.section.id,
      },
    }];
  }
}

export default AttemptMarkdownSectionMutation;
