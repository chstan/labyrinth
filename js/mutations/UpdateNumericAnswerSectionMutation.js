import Relay from 'react-relay';

import UpdateSectionMutationBase from './UpdateSectionMutationBase';

class UpdateNumericAnswerSectionMutation extends UpdateSectionMutationBase {
  getSectionKeys() {
    return ['exposition', 'question', 'answer'];
  }
  getMutation() {
    return Relay.QL`mutation { updateNumericAnswerSection }`;
  }
  getFatQuery() {
    return Relay.QL`
    fragment on UpdateNumericAnswerSectionPayload {
      section
    }`;
  }
}

export default UpdateNumericAnswerSectionMutation;
