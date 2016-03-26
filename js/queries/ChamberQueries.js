import Relay from 'react-relay';

export default {
  chamber: () => Relay.QL`
  query {
    chamber(id: $chamberId)
  }`,
};
