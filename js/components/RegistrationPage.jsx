import axios from 'axios';
import React from 'react';
import { autobind } from 'core-decorators';

import { Form } from 'formsy-react';

import ToastStore from './../stores/ToastStore';

import {
  PasswordInput, SimpleInput,
  SimpleControls,
} from '../inputs/Inputs.jsx';
import FormComponent from './FormComponent';

class RegistrationPage extends FormComponent {
  @autobind
  submit(data) {
    const formData = data;
    delete formData['password-confirmation'];
    axios({
      method: 'post',
      url: '/register',
      data: formData,
    }).then(() => {
      this.context.router.push({ pathname: '/profile' });
    }).catch(() => {
      ToastStore.error('That email is already taken');
    });
  }
  render() {
    const formClasses = this.state.isValid ? 'valid' : '';
    return (
      <div className="row">
        <div className="card">
          <Form ref="form" onValidSubmit={this.submit} onValid={this.onValid}
            onInvalid={this.onInvalid} className={ formClasses }
          >
            <SimpleInput name="name" title="Name" required id="name"
              value="" placholder="email"
              validationError="You must provide a name"
            />
            <SimpleInput name="email" title="Email" validations="isEmail" id="email"
              value="" placholder="email"
              validationError="You must provide an email"
            />
            <PasswordInput name="password" title="Password" required id="password"
              placeholder="password" value=""
            />
            <PasswordInput name="password-confirmation" title="Password Confirmation"
              placeholder="password" value="" id="password-confirmation"
              validations="equalsField:password" required strengthBar={false}
            />
          <SimpleControls>
            <button type="submit" className="button" disabled={ !this.state.formValid}>
              Signup
            </button>
          </SimpleControls>
          </Form>
        </div>
      </div>
    );
  }
}

RegistrationPage.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default RegistrationPage;
