const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');

const createCsv = async (records) => {
  const csvPath = path.join(__dirname, `../reports/attendees_${Date.now()}.csv`);
  const csvWriter = createCsvWriter({
    path: csvPath,
    header: [
      { id: 'eventId', title: 'Event ID' },
      { id: 'username', title: 'Username' },
      { id: 'email', title: 'Email' },
      { id: 'registeredAt', title: 'Registered At' }
    ]
  });

  await csvWriter.writeRecords(records);
  return csvPath;
};

module.exports = { createCsv };