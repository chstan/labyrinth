import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLInt,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromPromisedArray,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import _ from 'lodash';

import Db from './database';

/**
* Type declarations
*/
let userType; let chamberType; let sectionInterface;

let chamberStatusType;
let userRoleType;

// Section types
let markdownSectionType; // eslint-disable-line no-unused-vars
let curatorValidatedAnswerSectionType; // eslint-disable-line no-unused-vars
let numericAnswerSectionType; // eslint-disable-line no-unused-vars

let answerInterface; // eslint-disable-line no-unused-vars
let tokenAnswerType; // eslint-disable-line no-unused-vars
let numericAnswerType; // eslint-disable-line no-unused-vars

let sectionStatusType; // eslint-disable-line no-unused-vars

let chamberConnection;

/**
* We get the node interface and field from the Relay library.
*
* The first method defines the way we resolve an ID to its object.
* The second defines the way we resolve an object to its GraphQL type.
*/
const { nodeInterface, nodeField } = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    const whereArgs = { id };
    if (type === 'User') {
      return Db.models.user.findAll({ where: whereArgs });
    } else if (type === 'Chamber') {
      return Db.models.chamber.findAll({ where: whereArgs });
    } else if (type === 'Section') {
      return Db.models.section.findAll({ where: whereArgs });
    } else if (type === 'Answer') {
      return Db.models.answer.findAll({ where: whereArgs });
    }
    return null;
  },
  (obj) => {
    try {
      const modelName = obj.Model().name; // eslint-disable-line new-cap
      if (modelName === 'User') {
        return userType;
      } else if (modelName === 'Chamber') {
        return chamberType;
      } else if (modelName === 'Section') {
        return sectionInterface;
      } else if (modelName === 'Answer') {
        return answerInterface;
      }
    } catch (e) {
      return null;
    }
    return null;
  }
);

/**
* Type definitions
*/

userRoleType = new GraphQLEnumType({
  name: 'UserRoleType',
  values: {
    STUDENT: { value: 'STUDENT' },
    CURATOR: { value: 'CURATOR' },
    ADMIN: { value: 'ADMIN' },
  },
});

userType = new GraphQLObjectType({
  name: 'User',
  description: 'A person who uses our app',
  fields: () => ({
    id: globalIdField('User'),
    name: {
      type: GraphQLString,
      description: "The User's name as it appears on the site.",
      resolve: user => user.name,
    },
    accountCreatedOn: {
      type: GraphQLString,
      resolve: user => user.accountCreatedOn.toISOString(),
    },
    email: {
      type: GraphQLString,
      description: "The User's email",
      resolve: user => user.email,
    },
    role: {
      type: userRoleType,
      description: "The User's role on the site.",
      resolve: user => user.role,
    },
    suggestedChambers: {
      type: chamberConnection,
      description: 'Chambers that might be of interest to the viewer',
      args: connectionArgs,
      resolve: (user, args) => connectionFromPromisedArray(user.getSuggestedChambers(), args),
    },
    curatedChambers: {
      type: chamberConnection,
      description: 'Chambers that the viewer curates',
      args: connectionArgs,
      resolve: (user, args) => connectionFromPromisedArray(user.getCurated(), args),
    },
  }),
  interfaces: [nodeInterface],
});

chamberStatusType = new GraphQLObjectType({
  name: 'ChamberStatus',
  description: `A chamber's status for a particular user`,
  fields: () => ({
    solvedCount: {
      type: GraphQLInt,
      description: 'The number of sections which have been completed',
      resolve: status => status.solvedCount,
    },
    sectionCount: {
      type: GraphQLInt,
      description: 'The total number of sections for the corresponding chamber',
      resolve: status => status.sectionCount,
    },
  }),
});

chamberType = new GraphQLObjectType({
  name: 'Chamber',
  description: 'A chamber',
  fields: () => ({
    id: globalIdField('Chamber'),
    dbId: {
      type: GraphQLInt,
      description: 'The database ID for the chamber, used for URLs',
      resolve: chamber => chamber.id,
    },
    name: {
      type: GraphQLString,
      description: 'The name of the chamber',
      resolve: chamber => chamber.name,
    },
    status: {
      type: chamberStatusType,
      description: `The status of a student's efforts on a chamber`,
      resolve: (chamber, __, { rootValue: { currentUser } }) =>
        chamber.getSections().then(sections =>
          Promise.all(sections.map(section =>
            section.isCompletedFor(currentUser)
          ))
        ).then(completeds => ({
          solvedCount: completeds.filter(x => x).length,
          sectionCount: completeds.length,
        })),
    },
    section: {
      type: sectionInterface,
      description: 'A particular section',
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (chamber, args) => Db.models.section.findOne({
        where: {
          id: args.id,
          chamberId: chamber.id,
        },
      }),
    },
    sections: {
      type: new GraphQLList(sectionInterface),
      decription: 'The sections for the chamber',
      resolve: chamber => chamber.getSections(),
    },
  }),
  interfaces: [nodeInterface],
});

answerInterface = new GraphQLInterfaceType({
  name: 'Answer',
  description: 'An answer attempt on an chamber',
  interfaces: [nodeInterface],
  resolveType: answer => {
    const kindToType = {
      token: tokenAnswerType,
      numeric: numericAnswerType,
    };
    return kindToType[answer.kind];
  },
  fields: () => ({
    id: globalIdField(),
    valid: {
      type: GraphQLBoolean,
      description: 'Whether the answer is a valid resolution to the section',
    },
    section: {
      type: sectionInterface,
      description: 'The section the answer belongs to',
    },
    user: {
      type: userType,
      description: 'The section the answer belongs to',
    },
  }),
});

tokenAnswerType = new GraphQLObjectType({
  name: 'TokenAnswer',
  description: `An answer indicating that the student has marked the section
                as complete, requiring no real work.`,
  interfaces: [answerInterface],
  fields: () => ({
    id: globalIdField(),
    valid: {
      type: GraphQLBoolean,
      description: 'Whether the answer is a valid resolution to the section',
      resolve: answer => answer.valid,
    },
    section: {
      type: sectionInterface,
      description: 'The section the answer belongs to',
      resolve: answer => answer.getSection(),
    },
    user: {
      type: userType,
      description: 'The section the answer belongs to',
      resolve: answer => answer.getUser(),
    },
  }),
});

numericAnswerType = new GraphQLObjectType({
  name: 'NumericAnswer',
  description: `An answer that is validated numerically against the proper value
                for a given section.`,
  interfaces: [answerInterface],
  fields: () => ({
    id: globalIdField(),
    valid: {
      type: GraphQLBoolean,
      description: 'Whether the answer is a valid resolution to the section',
      resolve: answer => answer.valid,
    },
    section: {
      type: sectionInterface,
      description: 'The section the answer belongs to',
      resolve: answer => answer.getSection(),
    },
    user: {
      type: userType,
      description: 'The section the answer belongs to',
      resolve: answer => answer.getUser(),
    },
    attempt: {
      type: GraphQLFloat,
      description: 'The answer that was given',
      resolve: answer => answer.content.attempt,
    },
  }),
});

sectionInterface = new GraphQLInterfaceType({
  name: 'Section',
  description: 'A section of a chamber, might contain description or a problem',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField(),
    dbId: {
      type: GraphQLInt,
      description: 'The database ID of the section, used for URLs',
    },
    kind: {
      type: GraphQLString,
      description: 'The kind of the section, used to support section polymorphism',
    },
    chamber: {
      type: chamberType,
      description: 'The chamber this section belongs to',
    },
    name: {
      type: GraphQLString,
      description: 'The name of the section',
    },
    status: {
      type: sectionStatusType,
      description: 'The status of the section for the viewer',
    },
    answers: {
      type: new GraphQLList(answerInterface),
      description: 'The answers on the section',
    },
  }),
});

curatorValidatedAnswerSectionType = new GraphQLObjectType({
  name: 'CuratorValidatedAnswerSection',
  description: 'A section that contains a question validated by the chamber curator',
  interfaces: [sectionInterface],
  isTypeOf: section => section.kind === 'curatorValidatedAnswer',
  fields: () => ({
    id: globalIdField(),
    dbId: {
      type: GraphQLInt,
      description: 'The database ID of the section, used for URLs',
      resolve: section => section.id,
    },
    chamber: {
      type: chamberType,
      description: 'The chamber this section belongs to',
      resolve: section => Db.models.chamber.findOne({
        where: { id: section.chamberId },
      }),
    },
    name: {
      type: GraphQLString,
      description: 'The name of the section',
      resolve: section => section.name,
    },
    status: {
      type: sectionStatusType,
      description: 'The status of the section for the viewer',
      resolve: (section, __, { rootValue: { currentUser } }) =>
        section.getAnswersFor(currentUser).then(answers => {
          // TODO determine what the status of an individual
          // section is here, render icon inline for nav
          if (answers.some(a => a.valid)) return 'COMPLETE';
          return 'FRONTIER';
        }),
    },
    kind: {
      type: GraphQLString,
      description: 'The kind of the section, used to support section polymorphism',
      resolve: section => section.kind,
    },
    exposition: {
      type: GraphQLString,
      description: 'Some expository lead up information to the question itself',
      resolve: section => section.content.exposition,
    },
    question: {
      type: GraphQLString,
      description: 'The question contained in the section',
      resolve: section => section.content.question,
    },
    answers: {
      type: new GraphQLList(answerInterface),
      description: 'The answers on the section',
      resolve: (section, __, { rootValue: { currentUser } }) =>
        section.getAnswersFor(currentUser),
    },
  }),
});

numericAnswerSectionType = new GraphQLObjectType({
  name: 'NumericAnswerSection',
  description: 'A section that contains a question that has a numeric answer',
  interfaces: [sectionInterface],
  isTypeOf: section => section.kind === 'numericAnswer',
  fields: () => ({
    id: globalIdField(),
    dbId: {
      type: GraphQLInt,
      description: 'The database ID of the section, used for URLs',
      resolve: section => section.id,
    },
    chamber: {
      type: chamberType,
      description: 'The chamber this section belongs to',
      resolve: section => Db.models.chamber.findOne({
        where: { id: section.chamberId },
      }),
    },
    name: {
      type: GraphQLString,
      description: 'The name of the section',
      resolve: section => section.name,
    },
    status: {
      type: sectionStatusType,
      description: 'The status of the section for the viewer',
      resolve: (section, __, { rootValue: { currentUser } }) =>
        section.getAnswersFor(currentUser).then(answers => {
          // TODO determine what the status of an individual
          // section is here, render icon inline for nav
          if (answers.some(a => a.valid)) return 'COMPLETE';
          return 'FRONTIER';
        }),
    },
    kind: {
      type: GraphQLString,
      description: 'The kind of the section, used to support section polymorphism',
      resolve: section => section.kind,
    },
    exposition: {
      type: GraphQLString,
      description: 'Some expository lead up information to the question itself',
      resolve: section => section.content.exposition,
    },
    question: {
      type: GraphQLString,
      description: 'The question contained in the section',
      resolve: section => section.content.question,
    },
    answer: {
      type: GraphQLString,
      description: 'The answer to the question contained in the section',
      resolve: section => section.content.answer,
    },
    answers: {
      type: new GraphQLList(answerInterface),
      description: 'The answers on the section',
      resolve: (section, __, { rootValue: { currentUser } }) =>
        section.getAnswersFor(currentUser),
    },
  }),
});

sectionStatusType = new GraphQLEnumType({
  name: 'SectionStatusType',
  values: {
    COMPLETE: { value: 'COMPLETE' },
    FRONTIER: { value: 'FRONTIER' },
    LOCKED: { value: 'LOCKED' },
  },
});

markdownSectionType = new GraphQLObjectType({
  name: 'MarkdownSection',
  description: 'A section of markdown content',
  interfaces: [sectionInterface], // make sure it exposes id and kind
  isTypeOf: section => section.kind === 'markdown',
  fields: () => ({
    id: globalIdField(),
    dbId: {
      type: GraphQLInt,
      description: 'The database ID of the section, used for URLs',
      resolve: section => section.id,
    },
    status: {
      type: sectionStatusType,
      description: 'The status of the section for the viewer',
      resolve: (section, __, { rootValue: { currentUser } }) =>
        section.getAnswersFor(currentUser).then(answers => {
          // TODO determine what the status of an individual
          // section is here, render icon inline for nav
          if (answers.some(a => a.valid)) return 'COMPLETE';
          return 'FRONTIER';
        }),
    },
    chamber: {
      type: chamberType,
      description: 'The chamber this section belongs to',
      resolve: section => Db.models.chamber.findOne({
        where: { id: section.chamberId },
      }),
    },
    name: {
      type: GraphQLString,
      description: 'The name of the section',
      resolve: section => section.name,
    },
    kind: {
      type: GraphQLString,
      description: 'The kind of the section, used to support section polymorphism',
      resolve: section => section.kind,
    },
    markdown: {
      type: GraphQLString,
      description: 'The content of this section',
      resolve: section => section.content.markdown,
    },
    answers: {
      type: new GraphQLList(answerInterface),
      description: 'The answers on the section',
      resolve: (section, __, { rootValue: { currentUser } }) =>
        section.getAnswersFor(currentUser),
    },
  }),
});

chamberConnection = connectionDefinitions(
  { name: 'Chamber', nodeType: chamberType }
).connectionType;

/**
* This is the type that will be the root of our query,
* and the entry point into our schema.
*/
const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    node: nodeField,
    // Add your own root fields here
    viewer: {
      type: userType,
      resolve: rootValue => {
        if (!rootValue.currentUser) {
          throw new Error('403 - Authorization required');
        }
        return rootValue.currentUser;
      },
    },
    chamber: {
      type: chamberType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (rootValue, args) => {
        if (!rootValue.currentUser) {
          throw new Error('403 - Authorization required');
        }
        const id = parseInt(args.id, 10);
        return Db.models.chamber.findOne({ where: { id } });
      },
    },
  }),
});

// ================ MUTATIONS ==================

// GraphQL currently supports no input type/mutation polymorphism
// which is a bit unfortunate, but is probably something that will
// clear up at some point in the future, for now, we just have to
// define a whole bunch of input types or concede on typing entirely.
// I'm planning on relying quite a bit on being able to define the
// types and mutations largely via helpers, depending on any incident
// complexity
const markdownSectionInputType = new GraphQLInputObjectType({
  name: 'MarkdownSectionInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    markdown: { type: GraphQLString },
  },
});

const curatorValidatedAnswerSectionInputType = new GraphQLInputObjectType({
  name: 'CuratorValidatedAnswerSectionInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    exposition: { type: GraphQLString },
    question: { type: GraphQLString },
  },
});

const numericAnswerSectionInputType = new GraphQLInputObjectType({
  name: 'NumericAnswerSectionInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    exposition: { type: GraphQLString },
    question: { type: GraphQLString },
    answer: { type: GraphQLString },
  },
});

// factory for update section mutations
function updateSectionMutation(inputType, mutationName, kind) {
  return mutationWithClientMutationId({
    name: mutationName,
    inputFields: {
      section: { type: inputType },
    },
    outputFields: {
      section: {
        type: sectionInterface,
        resolve: ({ section }) => section,
      },
    },
    mutateAndGetPayload: ({ section }, { rootValue }) => {
      if (!rootValue.currentUser) {
        throw new Error('403 - Authorization required');
      }

      const { id, name } = section;
      const sectionDbId = parseInt(fromGlobalId(id).id, 10);
      const content = _.omit(section, ['id', 'name']);
      const dbSection = Db.models.section.findOne({ where: { id: sectionDbId } });
      return rootValue.currentUser.canEditSection(dbSection).then(isAllowed => {
        if (isAllowed) {
          return {
            section: dbSection.then(s => s.update({
              kind,
              name,
              content,
            })),
          };
        }
        return { section: null };
      });
    },
  });
}

const updateSectionMutations = _.mapValues({
  updateMarkdownSection: [markdownSectionInputType, 'UpdateMarkdownSection', 'markdown'],
  updateCuratorValidatedAnswerSection: [
    curatorValidatedAnswerSectionInputType, 'UpdateCuratorValidatedAnswerSection',
    'curatorValidatedAnswer',
  ],
  updateNumericAnswerSection: [
    numericAnswerSectionInputType, 'UpdateNumericAnswerSection', 'numericAnswer',
  ],
}, s => updateSectionMutation(...s));

const AttemptMarkdownSectionMutation = mutationWithClientMutationId({
  name: 'AttemptMarkdownSection',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    section: {
      type: sectionInterface,
      resolve: ({ section }) => section,
    },
    chamber: {
      type: chamberType,
      resolve: ({ chamber }) => chamber,
    },
  },
  mutateAndGetPayload: ({ id }, { rootValue }) => {
    if (!rootValue.currentUser) {
      throw new Error('403 - Authorization required');
    }
    const localSectionId = fromGlobalId(id).id;

    Db.models.answerSet.findOrCreate({
      where: {
        userId: rootValue.currentUser.id,
        sectionId: localSectionId,
      },
      defaults: {
        userId: rootValue.currentUser.id,
        sectionId: localSectionId,
      },
    }).then(([answerSet]) => {
      Db.models.answer.findOrCreate({
        where: {
          answerSetId: answerSet.id,
        },
        defaults: {
          answerSetId: answerSet.id,
          valid: true,
          kind: 'token',
        },
      }).then(([answer]) => {
        answer.update({ valid: true, kind: 'token' });
      });
    });

    const section = Db.models.section.findOne({
      where: { id: localSectionId },
    });

    return {
      section,
      chamber: section.then(sec => sec.getChamber()),
    };
  },
});

const AttemptNumericAnswerSectionMutation = mutationWithClientMutationId({
  name: 'AttemptNumericAnswerSection',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    answerAttempt: { type: GraphQLString },
  },
  outputFields: {
    section: {
      type: sectionInterface,
      resolve: ({ section }) => section,
    },
    chamber: {
      type: chamberType,
      resolve: ({ chamber }) => chamber,
    },
  },
  mutateAndGetPayload: ({ id, answerAttempt }, { rootValue }) => {
    if (!rootValue.currentUser) {
      throw new Error('403 - Authorization required');
    }
    const localSectionId = fromGlobalId(id).id;
    const badAnswerError = new Error(`Make sure your answer is a number!`);
    const PRECISION = 0.1;

    const attempt = parseFloat(answerAttempt);
    if (isNaN(attempt)) {
      throw badAnswerError;
    }

    return Promise.all([
      // find or create an answer set
      Db.models.answerSet.findOrCreate({
        where: {
          userId: rootValue.currentUser.id,
          sectionId: localSectionId,
        },
        defaults: {
          userId: rootValue.currentUser.id,
          sectionId: localSectionId,
        },
      }),
      // get the appropriate answer for the section
      Db.models.section.findOne({ where: { id: localSectionId } }).then(section => {
        if (section.kind !== 'numericAnswer') {
          throw new Error('Attempted mutation on the wrong section type');
        }
        return section.content.answer;
      }),
    ]).then(([[answerSet], answer]) =>
      answerSet.createAnswer({
        attempt: { attempt },
        valid: Boolean(Math.abs(attempt - answer) < PRECISION),
        kind: 'numeric',
      })
    ).then(() => {
      const section = Db.models.section.findOne({ where: { id: localSectionId } });
      return {
        section,
        chamber: section.then(sec => sec.getChamber()),
      };
    });
  },
});

const UpdateViewerEmailMutation = mutationWithClientMutationId({
  name: 'UpdateViewerEmail',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: GraphQLString },
  },
  outputFields: {
    viewer: {
      type: userType,
      resolve: viewer => viewer,
    },
  },
  mutateAndGetPayload: ({ id, email }, { rootValue }) => {
    const localUserId = parseInt(fromGlobalId(id).id, 10);
    if (!rootValue.currentUser || rootValue.currentUser.id !== localUserId) {
      throw new Error('403 - Authorization required');
    }

    rootValue.currentUser.email = email; // eslint-disable-line no-param-reassign
    return rootValue.currentUser.save().then(() => rootValue.currentUser);
  },
});

const UpdateViewerNameMutation = mutationWithClientMutationId({
  name: 'UpdateViewerName',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
  },
  outputFields: {
    viewer: {
      type: userType,
      resolve: viewer => viewer,
    },
  },
  mutateAndGetPayload: ({ id, name }, { rootValue }) => {
    const localUserId = parseInt(fromGlobalId(id).id, 10);
    if (!rootValue.currentUser || rootValue.currentUser.id !== localUserId) {
      throw new Error('403 - Authorization required');
    }

    rootValue.currentUser.name = name; // eslint-disable-line no-param-reassign
    return rootValue.currentUser.save().then(() => rootValue.currentUser);
  },
});

const AddSectionMutation = mutationWithClientMutationId({
  name: 'AddSection',
  inputFields: {
    chamberId: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: GraphQLString },
    kind: { type: GraphQLString },
  },
  outputFields: {
    newSection: {
      type: sectionInterface,
      resolve: ({ newSection }) => newSection,
    },
    chamber: {
      type: chamberType,
      resolve: ({ chamber }) => chamber,
    },
  },
  mutateAndGetPayload: ({ chamberId, name, kind }, { rootValue }) => {
    if (!rootValue.currentUser) {
      throw new Error('403 - Authorization required');
    }

    const id = parseInt(fromGlobalId(chamberId).id, 10);
    const chamber = Db.models.chamber.findOne({ where: { id } });

    return rootValue.currentUser.canCreateSection({ id }).then(allowed => {
      if (allowed) {
        return chamber.then(c => c.createSection({
          kind,
          name,
        }));
      }
      return Promise.resolve(null);
    }).then(s => ({
      chamber,
      newSection: s,
    }));
  },
});

const AddChamberMutation = mutationWithClientMutationId({
  name: 'AddChamber',
  inputFields: {
    name: { type: GraphQLString },
  },
  outputFields: {
    viewer: {
      type: userType,
      resolve: ({ viewer }) => viewer,
    },
    newChamber: {
      type: chamberType,
      resolve: ({ newChamber }) => newChamber,
    },
  },
  mutateAndGetPayload: ({ name }, { rootValue }) => {
    if (!rootValue.currentUser) {
      throw new Error('403 - Authorizataion required');
    }
    return rootValue.currentUser.canCreateChamber().then(allowed => {
      if (allowed) {
        return rootValue.currentUser.createCurated({ name });
      }
      return Promise.resolve(null);
    }).then(newChamber => ({
      viewer: rootValue.currentUser,
      newChamber,
    }));
  },
});

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => _.merge({
    attemptMarkdownSection: AttemptMarkdownSectionMutation,
    attemptNumericAnswerSection: AttemptNumericAnswerSectionMutation,

    // user settings, these are here so that they can be recomposed easily
    updateViewerEmail: UpdateViewerEmailMutation,
    updateViewerName: UpdateViewerNameMutation,

    // chamber related
    addChamber: AddChamberMutation,
    addSection: AddSectionMutation,

    // update sections: currently have no input polymorphism,
    // so we inject a bunch of different mutations
  }, updateSectionMutations),
});

/**
* Finally, we construct our schema (whose starting query type is the query
* type we defined above) and export it.
*/
export const Schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});
