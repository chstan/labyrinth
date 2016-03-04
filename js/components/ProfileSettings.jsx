import React from 'react';
import Relay from 'react-relay';
import { autobind } from 'core-decorators';

import { Form } from 'formsy-react';

import { SimpleInput, SimpleControls } from '../inputs/Inputs.jsx';
import ToastStore from '../stores/ToastStore';

import UpdateViewerEmailMutation from '../mutations/UpdateViewerEmailMutation';
import UpdateViewerNameMutation from '../mutations/UpdateViewerNameMutation';

import './ProfileSettings.scss';

class ProfileSettings extends React.Component {
  constructor() {
    super();

    this.state = {
      isValid: false,
    };
  }
  @autobind
  onValid() {
    this.setState({
      isValid: true,
    });
  }
  @autobind
  onInvalid() {
    this.setState({
      isValid: false,
    });
  }
  @autobind
  submit(data) {
    Relay.Store.commitUpdate(
      new UpdateViewerEmailMutation({
        viewer: this.props.viewer,
        email: data.email,
      }), {
        onSuccess: () => ToastStore.info('Updated your email'),
      }
    );
    Relay.Store.commitUpdate(
      new UpdateViewerNameMutation({
        viewer: this.props.viewer,
        name: data.name,
      }), {
        onSuccess: () => ToastStore.info('Updated your name'),
      }
    );
  }
  render() {
    const formClasses = this.state.isValid ? 'valid' : '';

    return (
      <div className="row">
        <div className="card">
          <Form ref="form" onValidSubmit={this.submit} onValid={this.onValid}
            onInvalid={this.onInvalid} className={ formClasses }
          >
            <SimpleInput name="email" title="Email" validations="isEmail"
              value={ this.props.viewer.email }
              validationError="Valid email required"
            />
            <SimpleInput name="name" title="Name" value={ this.props.viewer.name } required />
            <SimpleControls>
              <button type="submit" className="button">Submit</button>
            </SimpleControls>
          </Form>
          <div className="input-group">{ this.props.viewer.email }</div>
          <div className="controls">controls</div>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(ProfileSettings, {
  fragments: {
    viewer: () => Relay.QL`
    fragment on User {
      ${ UpdateViewerEmailMutation.getFragment('viewer') },
      ${ UpdateViewerNameMutation.getFragment('viewer') },
      name,
      email,
    }`,
  },
});
