import Relay from 'react-relay';
import _ from 'lodash';

class AddSectionMutation extends Relay.Mutation {
  static fragments = {
    chamber: () => Relay.QL`
    fragment on Chamber {
      id,
    }`,
  };
  getMutation() {
    return Relay.QL`mutation { addSection }`;
  }
  getVariables() {
    return _.merge(
      { chamberId: this.props.chamber.id },
      this.props.section,
    );
  }
  getFatQuery() {
    return Relay.QL`
    fragment on AddSectionPayload {
      chamber {
        sections,
        status,
      },
      newSection
    }`;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        chamber: this.props.chamber.id,
      },
    },
    {
      type: 'REQUIRED_CHILDREN',
      children: [
        Relay.QL`
        fragment on AddSectionPayload {
          newSection {
            dbId,
            name,
          },
        }`,
      ],
    }];
  }
}

export default AddSectionMutation;
