import Relay from 'react-relay';

import UpdateSectionMutationBase from './UpdateSectionMutationBase';

class UpdateCuratorValidatedSectionMutation extends UpdateSectionMutationBase {
  getSectionKeys() {
    return ['exposition', 'question'];
  }
  getMutation() {
    return Relay.QL`mutation { updateCuratorValidatedAnswerSection }`;
  }
  getFatQuery() {
    return Relay.QL`
    fragment on UpdateCuratorValidatedAnswerSectionPayload {
      section
    }`;
  }
}

export default UpdateCuratorValidatedSectionMutation;
