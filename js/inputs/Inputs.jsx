import React from 'react';
import Formsy from 'formsy-react';
import _ from 'lodash';

import './Inputs.scss';

class SimpleControls extends React.Component {
  render() {
    return (
      <div className="form-controls controls">
        { this.props.children }
      </div>
    );
  }
}

const SimpleInput = React.createClass({ // eslint-disable-line
  mixins: [Formsy.Mixin],

  changeValue(event) {
    this.setValue(event.currentTarget[this.props.type === 'checkbox' ? 'checked' : 'value']);
  },

  render() {
    const classes = [
      'input-group',
      this.props.className,
      this.showRequired() ? 'required' : '',
      this.showError() ? 'error' : '',
    ];
    const className = _.join(_.filter(classes), ' ');
    const errorMessage = this.getErrorMessage();

    return (
      <div className={className}>
        <label htmlFor={ this.props.name }>{ this.props.title }</label>
        <input
          type={ this.props.type || 'text' }
          name={ this.props.name }
          onChange={ this.changeValue }
          value={ this.getValue() }
          checked={ this.props.type === 'checkbox' && this.getValue() ? 'checked' : null }
        />
      <span className="validation-error">{ errorMessage }</span>
      </div>
    );
  },
});

export {
  SimpleInput,
  SimpleControls,
};
