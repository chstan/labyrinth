/* eslint-disable react/no-multi-comp */

import React from 'react';
import Formsy from 'formsy-react';
import ReactSelect from 'react-select';
import ReactUXPassword from 'react-ux-password-field';
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

const PasswordInput = React.createClass({ // eslint-disable-line react/prefer-es6-class
  propTypes: {
    strengthBar: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
  },

  mixins: [Formsy.Mixin],

  getDefaultProps() {
    return {
      strengthBar: true,
    };
  },

  changeValue(value) {
    this.setValue(value);
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
        <label htmlFor={this.props.id}>{this.props.title}</label>
        <ReactUXPassword id={this.props.id} unMaskTime={800} onChange={this.changeValue}
          value={this.getValue()} name={this.props.name} infoBar={this.props.strengthBar}
        />
        <span className="validation-error">{ errorMessage }</span>
      </div>
    );
  },
});

const Select = React.createClass({ // eslint-disable-line react/prefer-es6-class
  propTypes: {
    id: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    multiple: React.PropTypes.bool,
    options: React.PropTypes.array.isRequired,
  },

  mixins: [Formsy.Mixin],

  changeValue(value, selectedOptions) {
    if (this.props.multiple) {
      this.setValue(selectedOptions.map(o => o.value));
    } else {
      this.setValue(value);
    }
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
        <label htmlFor={this.props.id}>{this.props.title}</label>
        <ReactSelect ref="select" id={this.props.id}
          name={this.props.name} multi={this.props.multiple}
          onChange={this.changeValue} value={this.getValue()}
          options={this.props.options}
        />
        <span className="validation-error">{errorMessage}</span>
      </div>
    );
  },
});

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
  PasswordInput,
  SimpleInput,
  SimpleControls,
  Select,
};
