import React from 'react';
import Relay from 'react-relay';
import { autobind } from 'core-decorators';

import ReactMarkdown from 'react-markdown';

import svgs from './SVGs';
import SectionCompletedBanner from './SectionCompletedBanner';
import ToastStore from '../stores/ToastStore';

import AttemptNumericAnswerSectionMutation from
  './../mutations/AttemptNumericAnswerSectionMutation';

import './AttemptsNumericAnswerSection.scss';

class AttemptsNumericAnswerSection extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      currentAnswer: '',
    };
  }
  @autobind
  _handleAnswerUpdate(e) {
    this.setState({ currentAnswer: e.target.value });
  }
  @autobind
  _handleAttempt() {
    Relay.Store.commitUpdate(
      new AttemptNumericAnswerSectionMutation({
        section: this.props.section,
        answerAttempt: this.state.currentAnswer,
      }), {
        onSuccess: ({ attemptNumericAnswerSection: { section } }) => {
          if (section.status === 'COMPLETE') {
            this.props.onComplete();
          } else {
            ToastStore.error("Your answer wasn't correct");
            this.setState({ currentAnswer: '' });
          }
        },
        onFailure: () => {
          ToastStore.error('Unexpected failure mode');
          this.setState({ currentAnswer: '' });
        },
      }
    );
  }
  render() {
    const sectionCompleted = this.props.section.answers.some(a => a.valid);
    let controls;
    if (sectionCompleted) {
      controls = <SectionCompletedBanner />;
    } else {
      controls = (
        <div className="submit-answer">
          <input className="inline" type="number" value={ this.state.currentAnswer }
            onChange={ this._handleAnswerUpdate } placeholder="Your answer"
          />
          <button type="button" disabled={ !this.state.currentAnswer }
            onClick={this._handleAttempt}
          >
            { svgs.rightArrow }
          </button>
        </div>
      );
    }
    return (
      <article className="section numeric-answer-section attempts">
        <header className="section-header">
          <h1>{ this.props.section.name }</h1>
        </header>
        <div className="content">
          <ReactMarkdown source={this.props.section.exposition} />
        </div>
        <div className="controls">
          { controls }
        </div>
      </article>
    );
  }
}

export default Relay.createContainer(AttemptsNumericAnswerSection, {
  fragments: {
    section: () => Relay.QL`
    fragment on Section {
      ${ AttemptNumericAnswerSectionMutation.getFragment('section') },
      ... on NumericAnswerSection {
        name,
        exposition,
        status,
        answers {
          valid,
        },
      }
    }`,
  },
});
