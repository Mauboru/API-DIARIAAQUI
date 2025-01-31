'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('da_feedbacks', [
      {
        service_id: 1, // Certifique-se de que o serviço existe
        reviewer_id: 1, // Certifique-se de que o empregador existe
        rating: 5,
        comment: 'Great worker! Job completed perfectly.',
        createdAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('da_feedbacks', null, {});
  },
};
