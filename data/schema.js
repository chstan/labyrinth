import {
  GraphQLBoolean,
  GraphQLInt,
  GraphQLID,
  GraphQLInterfaceType,
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

import Db from './database';

/**
* Type declarations
*/
let userType; let chamberType; let sectionInterface;

let chamberStatusType;

// Section types
let markdownSectionType; // eslint-disable-line no-unused-vars
let curatorValidatedAnswerSectionType; // eslint-disable-line no-unused-vars
let numericAnswerSectionType; // eslint-disable-line no-unused-vars

let answerInterface; // eslint-disable-line no-unused-vars
let tokenAnswerType; // eslint-disable-line no-unused-vars


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

userType = new GraphQLObjectType({
  name: 'User',
  description: 'A person who uses our app',
  fields: () => ({
    id: globalIdField('User'),
    name: {
      type: GraphQLString,
      description: "The User's name as it appears on the site.",
      resolve: (user) => user.name,
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
    name: {
      type: GraphQLString,
      description: 'The name of the chamber',
      resolve: chamber => chamber.name,
    },
    status: {
      type: chamberStatusType,
      description: `The status of a learner's efforts on a chamber`,
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
    };
    // use the kind of the section to infer what the proper
    // type of the answer should be
    // TODO: this is inefficient because it might involve more queries
    // depending on Sequlize's caching strategy
    // return answer.getSection().then(section =>
    //   sectionKindsToType[section.kind]
    // );
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
  description: `An answer indicating that the learner has marked the section
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

sectionInterface = new GraphQLInterfaceType({
  name: 'Section',
  description: 'A section of a chamber, might contain description or a problem',
  interfaces: [nodeInterface],
  fields: () => ({
    id: globalIdField(),
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
  isTypeOf: section => section.kind === 'curatorValidatedSection',
  fields: () => ({
    id: globalIdField(),
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
  isTypeOf: section => section.kind === 'numericAnswerSection',
  fields: () => ({
    id: globalIdField(),
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

markdownSectionType = new GraphQLObjectType({
  name: 'MarkdownSection',
  description: 'A section of markdown content',
  interfaces: [sectionInterface], // make sure it exposes id and kind
  isTypeOf: section => section.kind === 'markdown',
  fields: () => ({
    id: globalIdField(),
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

/**
* This is the type that will be the root of our mutations,
* and the entry point into performing writes in our schema.
*/
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

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    attemptMarkdownSection: AttemptMarkdownSectionMutation,
  }),
});

/**
* Finally, we construct our schema (whose starting query type is the query
* type we defined above) and export it.
*/
export const Schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});
