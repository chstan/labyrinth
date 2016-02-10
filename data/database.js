const Sequelize = require('sequelize');
import bcrypt from 'bcrypt';
import secrets from '../secrets.json';

const sequelize = new Sequelize(
  secrets.database.database, secrets.database.user, secrets.database.password, {
    host: 'localhost',
    dialect: 'postgres',
    port: secrets.database.port,

    pool: {
      max: 1,
      min: 0,
      idle: 10000,
    },
  }
);

const User = sequelize.define('user', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    isUnique: true,
    validate: {
      isEmail: true,
    },
  },
  passwordHash: {
    type: Sequelize.STRING,
  },
}, {
  instanceMethods: {
    getSuggestedChambers() {
      const user = this;
      return sequelize.models.chamber.findAll({ where: {
        userId: { $ne: user.id },
      } });
    },
    validPassword(password) {
      return bcrypt.compareSync(password, this.passwordHash);
    },
    setPassword(password) {
      const user = this;
      const SALT_LENGTH = 8;
      bcrypt.hash(password, SALT_LENGTH, (err, hash) => {
        user.passwordHash = hash;
        user.save();
      });
    },
  },
});

const Chamber = sequelize.define('chamber', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const Section = sequelize.define('section', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  // called a kind to differentiate from that other kind of type
  kind: {
    type: Sequelize.STRING,
    validate: {
      isIn: [['markdown', 'curatorValidatedAnswer', 'numericAnswer']],
    },
  },
  content: {
    type: Sequelize.JSON,
    defaultValue: {},
  },
});

const AnswerSet = sequelize.define('answerSet', {
  valid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

const AnswerAttempt = sequelize.define('answer', { // eslint-disable-line no-unused-vars
  valid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  attempt: {
    type: Sequelize.JSON,
    defaultValue: {},
  },
});

User.hasMany(Chamber, { as: 'Curated' });
Chamber.belongsTo(User, { as: 'Curator' });

Chamber.hasMany(Section, { as: 'Sections' });
Section.belongsTo(Chamber, { as: 'Chamber' });

User.belongsToMany(Section, { as: 'AttemptedSections', through: 'AnswerSet' });
Section.belongsToMany(User, { as: 'Answerers', through: 'AnswerSet' });

AnswerSet.hasMany(AnswerAttempt);
AnswerAttempt.belongsTo(AnswerSet);

sequelize.sync({ force: true }).then(() => {
  User.create({
    name: 'Primary User',
    email: 'primary@email.com',
  }).then(primaryUser => {
    primaryUser.setPassword('password');
    primaryUser.createCurated({
      name: 'Primary Chamber',
    }).then(primaryChamber => {
      primaryChamber.createSection({
        kind: 'markdown',
        name: 'Some markdown content',
        content: {
          markdown: '# This is some test markdown\nAnd a *small* paragraph',
        },
      });
      primaryChamber.createSection({
        kind: 'markdown',
        name: 'Some additional markdown content',
        content: {
          markdown: '# A second section\nWith a second paragraph',
        },
      });
      primaryChamber.createSection({
        kind: 'curatorValidatedAnswer',
        name: 'Question that requires feedback and validation by the curator',
        content: {
          exposition: '# Some exposition here',
          question: 'What is the meaning of addition?',
        },
      });
      primaryChamber.createSection({
        kind: 'numericAnswer',
        name: 'Question that requires a numeric answer',
        content: {
          exposition: '# Some exposition here',
          question: 'What is 4 + 2?',
          answer: 6,
        },
      });
    });
  });

  // Make another user that acts as someone learning on the platform
  User.create({
    name: 'Secondary User',
    email: 'secondary@email.com',
  }).then(secondaryUser => {
    secondaryUser.setPassword('password');
  });
});

export default sequelize;
