'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('da_services', [
      {
        employer_id: 1, // Certifique-se de que o usuário "Employer One" existe
        title: 'Clean my backyard',
        description: 'I need someone to clean my backyard this weekend.',
        location: '123 Main St, Cityville',
        date: '2025-01-30',
        pay: 100.50,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('da_services', null, {});
  },
};
