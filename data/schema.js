import {
  GraphQLInterfaceType,
  GraphQLList,
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
  nodeDefinitions,
} from 'graphql-relay';

import Db from './database';

/**
* Type declarations
*/
let userType; let chamberType; let sectionType;

// Section types
let markdownSectionType; // eslint-disable-line no-unused-vars
let curatorValidatedAnswerSectionType; // eslint-disable-line no-unused-vars
let numericAnswerSectionType; // eslint-disable-line no-unused-vars

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
        return sectionType;
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
    curatedChambers: {
      type: chamberConnection,
      description: 'All chambers, attached due to viewer pattern',
      args: connectionArgs,
      resolve: (user, args) => connectionFromPromisedArray(user.getCurated(), args),
    },
  }),
  interfaces: [nodeInterface],
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
    sections: {
      type: new GraphQLList(sectionType),
      decription: 'The sections for the chamber',
      resolve: chamber => chamber.getSections(),
    },
  }),
  interfaces: [nodeInterface],
});

sectionType = new GraphQLInterfaceType({
  name: 'Section',
  description: 'A section of a chamber, might contain description or a problem',
  fields: () => ({
    id: globalIdField(),
    kind: {
      type: GraphQLString,
      description: 'The kind of the section, used to support section polymorphism',
      resolve: section => section.kind,
    },
  }),
});

curatorValidatedAnswerSectionType = new GraphQLObjectType({
  name: 'CuratorValidatedAnswerSection',
  description: 'A section that contains a question validated by the chamber curator',
  interfaces: [sectionType],
  isTypeOf: section => section.kind === 'curatorValidatedSection',
  fields: () => ({
    id: globalIdField(),
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
  }),
});

numericAnswerSectionType = new GraphQLObjectType({
  name: 'NumericAnswerSection',
  description: 'A section that contains a question that has a numeric answer',
  interfaces: [sectionType],
  isTypeOf: section => section.kind === 'numericAnswerSection',
  fields: () => ({
    id: globalIdField(),
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
  }),
});

markdownSectionType = new GraphQLObjectType({
  name: 'MarkdownSection',
  description: 'A section of markdown content',
  interfaces: [sectionType], // make sure it exposes id and kind
  isTypeOf: section => section.kind === 'markdown',
  fields: () => ({
    id: globalIdField(),
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
  }),
});

/**
* This is the type that will be the root of our mutations,
* and the entry point into performing writes in our schema.
*/
// const mutationType = new GraphQLObjectType({
//   name: 'Mutation',
//   fields: () => ({
//     // Add your own mutations here
//   }),
// });

/**
* Finally, we construct our schema (whose starting query type is the query
* type we defined above) and export it.
*/
export const Schema = new GraphQLSchema({
  query: queryType,
  //mutation: mutationType,
});
