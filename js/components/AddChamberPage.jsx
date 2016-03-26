import React from 'react';
import Relay from 'react-relay';
import { autobind } from 'core-decorators';

import { Form } from 'formsy-react';

import AddChamberMutation from './../mutations/AddChamberMutation';

import FormComponent from './FormComponent';
import { SimpleInput, SimpleControls } from '../inputs/Inputs';

import routerUtils from '../utils/router';


class AddChamberPage extends FormComponent {
  @autobind
  _createChamber(data) {
    Relay.Store.commitUpdate(
      new AddChamberMutation({
        chamber: data,
        newChamber: null,
        viewer: this.props.viewer,
      }), {
        onSuccess: ({ addChamber: { newChamber } }) => {
          let pathname;
          if (newChamber) {
            // check if we created a chamber, and route to the associated
            // edit view to add sections etc.
            pathname = routerUtils.forEditChamber(newChamber);
          } else {
            // user did not have permissions for some reason or another
            pathname = '/';
          }
          this.context.router.push({ pathname });
        },
      }
    );
  }
  render() {
    return (
      <Form ref="form" onValidSubmit={this._createChamber}
        onValid={this.onValid} onInvalid={this.onInvalid}
      >
        <header><h1>Adding a chamber...</h1></header>
        <SimpleInput name="name" title="Chamber Name" type="text" required />
        <SimpleControls>
          <button type="submit" className="button"
            disabled={ !this.state.formValid }
          >
            Submit
          </button>
        </SimpleControls>
      </Form>
    );
  }
}

AddChamberPage.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default Relay.createContainer(AddChamberPage, {
  fragments: {
    viewer: () => Relay.QL`
    fragment on User {
      role,
    }`,
  },
});
