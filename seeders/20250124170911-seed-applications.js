'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('da_applications', [
      {
        service_id: 1, // Certifique-se de que o serviço existe
        worker_id: 2, // Certifique-se de que o usuário "Worker One" existe
        message: 'I am available and experienced for this job.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('da_applications', null, {});
  },
};
