import Relay from 'react-relay';

class UpdateViewerEmailMutation extends Relay.Mutation {
  static fragments = {
    viewer: () => Relay.QL`
    fragment on User {
      id,
    }`,
  };
  getMutation() {
    return Relay.QL`
      mutation { updateViewerEmail },
    `;
  }
  getVariables() {
    return {
      id: this.props.viewer.id,
      email: this.props.email,
    };
  }
  getFatQuery() {
    return Relay.QL`
    fragment on UpdateViewerEmailPayload {
      viewer {
        id,
        email,
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

export default UpdateViewerEmailMutation;
