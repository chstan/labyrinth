/* This file contains a utility function that creates a mutation of the appropriate
 * type keyed on the kind of the section that is to be updated.
 */
import Relay from 'react-relay';
import _ from 'lodash';

import UpdateMarkdownSectionMutation from './UpdateMarkdownSectionMutation';
import UpdateNumericAnswerSectionMutation from './UpdateNumericAnswerSectionMutation';
import UpdateCuratorValidatedAnswerSectionMutation
from './UpdateCuratorValidatedAnswerSectionMutation';

const mutationsByKind = {
  markdown: UpdateMarkdownSectionMutation,
  curatorValidatedAnswer: UpdateCuratorValidatedAnswerSectionMutation,
  numericAnswer: UpdateNumericAnswerSectionMutation,
};

function updateSectionMutationFactory(section, data) {
  if (!mutationsByKind.hasOwnProperty(section.kind)) {
    throw new Error(`Could not find mutation for kind: ${section.kind}.`);
  }
  const MutationClass = _.get(mutationsByKind, section.kind);
  return new MutationClass({ section, data });
}

// left off thinking about query composition
const updateSectionMutationFactoryQuery = Relay.QL`
  fragment on Section {
    ${ UpdateMarkdownSectionMutation.getFragment('section') },
    ${ UpdateNumericAnswerSectionMutation.getFragment('section') },
    ${ UpdateCuratorValidatedAnswerSectionMutation.getFragment('section') },
  }
`;

export {
  updateSectionMutationFactory,
  updateSectionMutationFactoryQuery,
};
