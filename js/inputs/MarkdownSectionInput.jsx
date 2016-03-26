import React from 'react';
import Formsy from 'formsy-react';
import _ from 'lodash';

import MarkdownInput from './MarkdownInput';


const MarkdownSectionInput = React.createClass({ // eslint-disable-line react/prefer-es6-class
  propTypes: {
    name: React.PropTypes.string.isRequired,
  },

  mixins: [Formsy.Mixin],

  getNameFor(path) {
    return _.join([this.props.name, ...path], '.');
  },

  render() {
    return (
      <div>
        <div className="input-group -with-header">
          <label htmlFor="markdown">
            Content
          </label>
          <MarkdownInput name={ this.getNameFor(['markdown'])}
            id="markdown" value={ _.get(this, 'props.section.markdown', '') }
            preview required
          />
        </div>
      </div>
    );
  },
});

export default MarkdownSectionInput;
