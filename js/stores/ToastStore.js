import { EventEmitter } from 'events';
import _ from 'lodash';

const DEFAULT_TIMEOUT = 5000;

class ToastStore extends EventEmitter {
  constructor() {
    super();
    this._toasts = {};
  }
  getAll() {
    return _.cloneDeep(this._toasts);
  }
  success(message, timeout = DEFAULT_TIMEOUT, dismissable = true) {
    this.makeToast({
      message,
      dismissable,
      timeout,
      type: 'SUCCESS',
    });
  }
  info(message, timeout = DEFAULT_TIMEOUT, dismissable = true) {
    this.makeToast({
      message,
      dismissable,
      timeout,
      type: 'INFO',
    });
  }
  error(message, timeout = DEFAULT_TIMEOUT, dismissable = true) {
    this.makeToast({
      message,
      dismissable,
      timeout,
      type: 'ERROR',
    });
  }
  removeToast(id) {
    delete this._toasts[id];
    this.emit('change');
  }
  addChangeListener(cb) {
    this.on('change', cb);
  }
  removeChangeListener(cb) {
    this.removeListener('change', cb);
  }
  makeToast(toast) {
    const toastId = _.uniqueId('toast');
    toast.id = toastId; // eslint-disable-line no-param-reassign
    toast.firedOn = new Date().getTime(); // eslint-disable-line no-param-reassign

    if (!(toast.timeout || toast.dismissable)) {
      // prevent completely sticky toasts
      toast.timeout = DEFAULT_TIMEOUT; // eslint-disable-line no-param-reassign
    }
    if (toast.timeout) {
      setTimeout(() => this.removeToast(toastId), toast.timeout);
    }
    this._toasts[toastId] = toast;
    this.emit('change');
  }
}

export default new ToastStore();
