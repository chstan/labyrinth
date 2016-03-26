import Relay from 'react-relay';
import _ from 'lodash';

class UpdateSectionMutationBase extends Relay.Mutation {
  getSectionKeys() {
    return [];
  }
  static fragments = {
    section: () => Relay.QL`
    fragment on Section {
      id,
    }`,
  };
  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        section: this.props.section.id,
      },
    }];
  }
  getVariables() {
    const { section, data } = this.props;
    const base = { id: section.id, name: data.name };

    return {
      section: _.merge({}, base, _.pick(data.content, this.getSectionKeys())),
    };
  }
}

export default UpdateSectionMutationBase;
