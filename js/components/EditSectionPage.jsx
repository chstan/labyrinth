import React from 'react';
import Relay from 'react-relay';

import { autobind } from 'core-decorators';

import { Form } from 'formsy-react';

import FormComponent from './FormComponent';
import { SimpleInput, SimpleControls, Select } from '../inputs/Inputs';

import MarkdownSectionInput from '../inputs/MarkdownSectionInput';
import CuratorValidatedAnswerSectionInput
from '../inputs/CuratorValidatedAnswerSectionInput';
import NumericAnswerSectionInput from '../inputs/NumericAnswerSectionInput';

import { updateSectionMutationFactory, updateSectionMutationFactoryQuery, }
from '../mutations/updateSectionUtils';

import ToastStore from '../stores/ToastStore';

class EditSectionPage extends FormComponent {
  @autobind
  _updateSectionContent(data) {
    Relay.Store.commitUpdate(
      updateSectionMutationFactory(this.props.chamber.section, data),
      { onSuccess: () => ToastStore.info('Updated') },
    );
  }
  render() {
    const { kind, name } = this.props.chamber.section;
    const sectionKindOptions = [
      { value: 'markdown', label: 'Description' },
      { value: 'numericAnswer', label: 'Answer with number' },
      { value: 'curatorValidatedAnswer', label: 'Checked answer' },
    ];
    const inputClassesByKind = {
      markdown: MarkdownSectionInput,
      numericAnswer: NumericAnswerSectionInput,
      curatorValidatedAnswer: CuratorValidatedAnswerSectionInput,
    };

    let kindForForm;
    try {
      kindForForm = this.refs.form.getCurrentValues().kind;
    } catch (e) {
      kindForForm = kind;
    }
    const inputClassForKind = inputClassesByKind[kindForForm];
    const inputForSectionContent = React.createElement(inputClassForKind, {
      section: this.props.chamber.section,
      name: 'content',
    });

    return (
      <Form ref="form" onValidSubmit={ this._updateSectionContent }
        onValid={ this.onValid } onInvalid={ this.onInvalid }
      >
        <header><h1>Updating <strong>{ name }</strong></h1></header>
        <SimpleInput name="name" value={ name } title="Section Name" type="text" required />
        <Select name="kind" value={ kind } id="kind"
          title="Kind of section" options={ sectionKindOptions }
        />
        { inputForSectionContent }
        <SimpleControls>
          <button type="submit" className="button" disabled={ !this.state.formValid }>
            Submit
          </button>
        </SimpleControls>
      </Form>
    );
  }
}

EditSectionPage.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default Relay.createContainer(EditSectionPage, {
  initialVariables: {
    viewedSection: null,
  },
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      id,
      dbId,
      name,
      section(id: $viewedSection) {
        id,
        dbId,
        name,
        kind,
        ${ updateSectionMutationFactoryQuery },
        ... on MarkdownSection {
          markdown,
        },
        ... on NumericAnswerSection {
          exposition,
          question,
          answer,
        },
        ... on CuratorValidatedAnswerSection {
          exposition,
          question,
        },
      }
    }`,
    viewer: () => Relay.QL`
    fragment on User {
      role,
    }`,
  },
});
