import Relay from 'react-relay';

class AttemptNumericAnswerSectionMutation extends Relay.Mutation {
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
      mutation { attemptNumericAnswerSection }
    `;
  }
  getVariables() {
    return {
      id: this.props.section.id,
      answerAttempt: this.props.answerAttempt,
    };
  }
  getFatQuery() {
    return Relay.QL`
    fragment on AttemptNumericAnswerSectionPayload {
      chamber {
        status,
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

export default AttemptNumericAnswerSectionMutation;
