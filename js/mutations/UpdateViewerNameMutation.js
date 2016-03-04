import Relay from 'react-relay';

class UpdateViewerNameMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
    fragment on User {
      id,
    }`,
  };
  getMutation() {
    return Relay.QL`
      mutation { updateViewerName },
    `;
  }
  getVariables() {
    return {
      id: this.props.viewer.id,
      name: this.props.name,
    };
  }
  getFatQuery() {
    return Relay.QL`
    fragment on UpdateViewerNamePayload {
      viewer {
        id,
        name,
      },
    }`;
  }
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
      },
    }];
  }
}

export default UpdateViewerNameMutation;
