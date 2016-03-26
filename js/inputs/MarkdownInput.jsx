import React from 'react';
import Formsy from 'formsy-react';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';

import './MarkdownInput.scss';

const MarkdownInput = React.createClass({ // eslint-disable-line react/prefer-es6-class
  propTypes: {
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    vertical: React.PropTypes.bool,
    preview: React.PropTypes.bool,
    value: React.PropTypes.string,
    className: React.PropTypes.string,
  },

  mixins: [Formsy.Mixin],

  changeValue(event) {
    this.setValue(event.currentTarget.value);
  },

  render() {
    let preview;
    if (this.props.preview) {
      preview = <ReactMarkdown className="markdown" source={ this.getValue() } />;
    }
    const classes = [
      'markdown-input',
      this.props.preview && this.props.vertical ? 'vertical' : '',
      this.props.preview && !this.props.vertical ? 'horizontal' : '',
      this.props.className || '',
    ];
    const className = _.join(classes, ' ');
    return (
      <div className={ className }>
        <textarea type="text" name={ this.props.name }
          onChange={ this.changeValue } value={ this.getValue() }
        />
        { preview }
      </div>
    );
  },
});

export default MarkdownInput;
