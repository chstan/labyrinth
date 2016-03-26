/* eslint-disable react/prefer-es6-class */
import React from 'react';
import Formsy from 'formsy-react';
import _ from 'lodash';

import MarkdownInput from './MarkdownInput';


const CuratorValidatedAnswerSectionInput = React.createClass({
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
          <label htmlFor="exposition">
            Exposition and explanation
          </label>
          <MarkdownInput name={ this.getNameFor(['exposition']) }
            id="exposition" value={ _.get(this, 'props.section.exposition', '') }
            preview required
          />
        </div>
        <div className="input-group -with-header">
          <label htmlFor="question">
            Question
          </label>
          <MarkdownInput name={ this.getNameFor(['question']) }
            id="question" value={ _.get(this, 'props.section.question', '') }
            preview required
          />
        </div>
      </div>
    );
  },
});

export default CuratorValidatedAnswerSectionInput;
