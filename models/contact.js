const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('arcseed_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

const Contact = sequelize.define('Contact', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connection established.');
    await sequelize.sync();
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
  }
})();

module.exports = Contact;
