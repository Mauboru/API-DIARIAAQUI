'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 10;

    const passwordHash1 = await bcrypt.hash('123', saltRounds);
    const passwordHash2 = await bcrypt.hash('321', saltRounds); 

    return queryInterface.bulkInsert('da_users', [
      {
        name: 'Employer One',
        email: 'employer1@example.com',
        password_hash: passwordHash1,
        phone_number: '1234567890',
        user_type: 'employer',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Worker One',
        email: 'worker1@example.com',
        password_hash: passwordHash2,
        phone_number: '0987654321',
        user_type: 'worker',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('da_users', null, {});
  },
};
