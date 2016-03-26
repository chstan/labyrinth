import React from 'react';
import { autobind } from 'core-decorators';

class FormComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      formValid: false,
    };
  }
  @autobind
  onInvalid() {
    this.setState({ formValid: false });
  }
  @autobind
  onValid() {
    this.setState({ formValid: true });
  }
}

export default FormComponent;
