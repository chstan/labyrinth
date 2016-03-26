const Sequelize = require('sequelize');
import bcrypt from 'bcrypt';
import secrets from '../secrets.json';
import q from 'q'; // promise wrapping

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
  accountCreatedOn: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'STUDENT',
    validate: {
      isIn: [['STUDENT', 'CURATOR', 'ADMIN']],
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
      // lift bcrypt.hash so we can continue computation with a promise
      return q.nfcall(bcrypt.hash, password, SALT_LENGTH).then(hash => {
        user.passwordHash = hash;
        return user.save();
      });
    },
    canCreateChamber() {
      return Promise.resolve(['CURATOR', 'ADMIN'].find(role => role === this.role));
    },
    canCreateSection(chamber) {
      if (this.role === 'ADMIN') {
        return Promise.resolve(true);
      }
      if (this.role === 'CURATOR') {
        return this.getCurated({ where: { id: chamber.id } }).then(c => Boolean(c.length));
      }
      return Promise.resolve(false);
    },
    canEditChamber(chamber) {
      return Promise.resolve(chamber.curatorId === this.id);
    },
    canEditSection(section) {
      if (this.role === 'ADMIN') return true;
      if (this.role !== 'CURATOR') return false;

      const user = this;
      return q(section).then(s => s.getChamber()).then(chamber =>
        chamber.userId === user.id // TODO figure out WTF sequelize is doing
      );
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
}, {
  instanceMethods: {
    getAnswerSetFor(user) {
      return sequelize.models.answerSet.findOne({
        where: { userId: user.id, sectionId: this.id },
      });
    },
    getAnswersFor(user) {
      return this.getAnswerSetFor(user).then(
        answerSet => answerSet.getAnswers()).catch(() => []);
    },
    isCompletedFor(user) {
      return this.getAnswerSetFor(user).then(
        answerSet => answerSet.getAnswers()
      ).then(
        answers => answers.some(a => a.valid)
      ).catch(() => false);
    },
  },
});

const AnswerSet = sequelize.define('answerSet', {
  // by default Sequelize doesn't put a primary key on the through join
  // because it's identified by its two foreign keys, we need one for
  // GraphQL purposes though so we put it back manually
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
});

const AnswerAttempt = sequelize.define('answer', {
  valid: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  attempt: {
    type: Sequelize.JSON,
    defaultValue: {},
  },
  kind: {
    type: Sequelize.STRING,
    validate: {
      isIn: [['token', 'numeric']],
    },
  },
}, {
  instanceMethods: {
    getUser() {
      return this.getAnswerSet().then(answerSet =>
        sequelize.models.user.findOne({
          where: { id: answerSet.userId },
        })
      );
    },
    getSection() {
      return this.getAnswerSet().then(answerSet =>
        sequelize.models.section.findOne({
          where: { id: answerSet.sectionId },
        })
      );
    },
  },
});

User.hasMany(Chamber, { as: 'curated' });
Chamber.belongsTo(User, { as: 'curator' });

Chamber.hasMany(Section, { as: 'sections' });
Section.belongsTo(Chamber, { as: 'chamber' });

User.belongsToMany(Section, { as: 'attemptedSections', through: 'answerSet' });
Section.belongsToMany(User, { as: 'answerers', through: 'answerSet' });

AnswerSet.hasMany(AnswerAttempt, { as: 'answers' });
AnswerAttempt.belongsTo(AnswerSet, { as: 'answerSet' });

sequelize.sync({ force: true }).then(() => {
  User.create({
    name: 'Administrator',
    email: 'admin@admin.com',
    role: 'ADMIN',
  }).then(admin => admin.setPassword('password'));
  User.create({
    name: 'Primary User',
    email: 'primary@email.com',
    role: 'CURATOR',
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
        kind: 'numericAnswer',
        name: 'Question that requires a numeric answer',
        content: {
          exposition: '# Some exposition here',
          question: 'What is 4 + 2?',
          answer: 6,
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
