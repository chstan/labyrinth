import React from 'react';
import { autobind } from 'core-decorators';
import _ from 'lodash';

import ToastStore from '../stores/ToastStore';

import './Toast.scss';

class Toast extends React.Component {
  @autobind;
  _handleDismiss() {
    ToastStore.removeToast(this.props.toast.id);
  }
  render() {
    const toastClass = `toast ${ _.lowerCase(this.props.toast.type) }`;
    let toastDismiss;
    if (this.props.toast.dismissable) {
      toastDismiss = (
        <button className="action inline dismiss"
          onClick={ this._handleDismiss }
        >
          Done
        </button>
      );
    }
    return (
      <span className={ toastClass }>
        <span className="message">{ this.props.toast.message }</span>
        { toastDismiss }
      </span>
    );
  }
}

export default Toast;
