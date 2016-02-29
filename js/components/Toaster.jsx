import React from 'react';
import { autobind } from 'core-decorators';
import _ from 'lodash';

import ToastStore from '../stores/ToastStore';
import Toast from './Toast';

import './Toaster.scss';

function getToastState() {
  return {
    toasts: ToastStore.getAll(),
  };
}

class Toaster extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = getToastState();
  }
  componentDidMount() {
    ToastStore.addChangeListener(this._onToast);
  }
  componentWillUnmount() {
    ToastStore.removeChangeListener(this._onToast);
  }
  @autobind
  _onToast() {
    this.setState(getToastState());
  }
  render() {
    const toasts = _(this.state.toasts)
      .values()
      .sortBy(({ firedOn }) => firedOn)
      .value();

    return (
      <div id="toaster">
        { toasts.map(toast =>
          <Toast toast={ toast } key={ toast.id }/>
        )}
      </div>
    );
  }
}

export default Toaster;
