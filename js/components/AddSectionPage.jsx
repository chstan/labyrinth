import React from 'react';
import Relay from 'react-relay';
import { autobind } from 'core-decorators';

import { Form } from 'formsy-react';

import AddSectionMutation from './../mutations/AddSectionMutation';

import FormComponent from './FormComponent';
import { SimpleInput, SimpleControls, Select } from '../inputs/Inputs';

import routerUtils from '../utils/router';


class AddSectionPage extends FormComponent {
  @autobind
  _createSection(data) {
    Relay.Store.commitUpdate(
      new AddSectionMutation({
        chamber: this.props.chamber,
        section: data,
      }), {
        onSuccess: ({ addSection: { newSection } }) => {
          let pathname;
          if (newSection) {
            // if we created the section then route
            pathname = routerUtils.forEditSection(this.props.chamber, newSection);
          } else {
            pathname = '/';
          }
          this.context.router.push({ pathname });
        },
      }
    );
  }
  render() {
    const sectionKindOptions = [
      { value: 'markdown', label: 'Description' },
      { value: 'numericAnswer', label: 'Answer with number' },
      { value: 'curatorValidatedAnswer', label: 'Checked answer' },
    ];
    return (
      <Form ref="form" onValidSubmit={this._createSection}
        onValid={this.onValid} onInvalid={this.onInvalid}
      >
        <header>
          <h1>
            Adding a section to
            <strong>{this.props.chamber.name}</strong>
          </h1>
        </header>
        <SimpleInput name="name" title="Section Name" type="text" required />
        <Select name="kind" value="markdown" id="kind" title="Kind of section"
          options={sectionKindOptions}
        />
        <SimpleControls>
          <button type="submit" className="button"
            disabled={ !this.state.formValid }
          >
            Submit
          </button>
        </SimpleControls>
      </Form>
    );
  }
}

AddSectionPage.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default Relay.createContainer(AddSectionPage, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      dbId,
      name,
      ${ AddSectionMutation.getFragment('chamber') },
    }`,
    viewer: () => Relay.QL`
    fragment on User {
      role,
    }`,
  },
});
