import Relay from 'react-relay';

import UpdateSectionMutationBase from './UpdateSectionMutationBase';

class UpdateMarkdownSectionMutation extends UpdateSectionMutationBase {
  getSectionKeys() {
    return ['markdown'];
  }
  getMutation() {
    return Relay.QL`mutation { updateMarkdownSection }`;
  }
  getFatQuery() {
    return Relay.QL`
    fragment on UpdateMarkdownSectionPayload {
      section
    }`;
  }
}

export default UpdateMarkdownSectionMutation;
