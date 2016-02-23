import React from 'react';
import Relay from 'react-relay';
import ReactMarkdown from 'react-markdown';
import { autobind } from 'core-decorators';

import SectionCompletedBanner from './SectionCompletedBanner';

import AttemptMarkdownSectionMutation from './../mutations/AttemptMarkdownSectionMutation';

import './AttemptsMarkdownSection.scss';

class AttemptsMarkdownSection extends React.Component {
  @autobind
  _handleAttempt() {
    Relay.Store.commitUpdate(
      new AttemptMarkdownSectionMutation({
        section: this.props.section,
      }), {
        onSuccess: () => {
          this.props.onComplete();
        },
      }
    );
  }
  render() {
    const sectionCompleted = this.props.section.answers.some(a => a.valid);
    let controls;
    if (sectionCompleted) {
      controls = (
          <SectionCompletedBanner />
      );
    } else {
      controls = (
        <button className="button attempts-button"
          onClick={this._handleAttempt}
        >Sounds good</button>
      );
    }
    return (
      <article className="markdown-section attempts">
        <header className="section-header">
          <h1>{ this.props.section.name }</h1>
        </header>
        <div className="content">
          <ReactMarkdown source={this.props.section.markdown} />
        </div>
        <div className="controls">
          { controls }
        </div>
      </article>
    );
  }
}

export default Relay.createContainer(AttemptsMarkdownSection, {
  fragments: {
    section: () => Relay.QL`
    fragment on Section {
      ${ AttemptMarkdownSectionMutation.getFragment('section') },
      ... on MarkdownSection {
        name,
        markdown,
        answers {
          valid,
        },
      }
    }`,
  },
});
