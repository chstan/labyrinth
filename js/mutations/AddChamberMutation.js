import Relay from 'react-relay';

class AddChamberMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation { addChamber }`;
  }
  getVariables() {
    return this.props.chamber;
  }
  getFatQuery() {
    return Relay.QL`
    fragment on AddChamberPayload {
      viewer {
        curatedChambers,
      },
      newChamber,
    }`;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    },
    {
      type: 'REQUIRED_CHILDREN',
      children: [
        Relay.QL`
        fragment on AddChamberPayload {
          newChamber {
            dbId,
            name,
          },
        }`,
      ],
    }];
  }
}

export default AddChamberMutation;
