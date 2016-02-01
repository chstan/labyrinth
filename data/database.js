const secrets = require('./../secrets.json');

const Sequelize = require('sequelize');
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
      isIn: [['markdown']],
    },
  },
  content: {
    type: Sequelize.JSON,
    defaultValue: {},
  },
});

User.hasMany(Chamber, { as: 'Curated' });
Chamber.hasMany(Section, { as: 'Sections' });

sequelize.sync({ force: true }).then(() => {
  User.create({
    name: 'Primary User',
  }).then(primaryUser =>
    primaryUser.createCurated({
      name: 'Primary Chabmer',
    }).then(primaryChamber =>
      primaryChamber.createSection({
        kind: 'markdown',
        name: 'The primary chamber',
        content: {
          markdown: '# This is some test markdown\nAnd a *small* paragraph',
        },
      })
    )
  );
});

export default sequelize;
