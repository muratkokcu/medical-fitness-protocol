const path = require('path');
const fs = require('fs');

// Helper function to load JSON files
function loadJSON(filename) {
  try {
    const filePath = path.join(__dirname, 'assessment', filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
}

// Assessment database loaders
const getAssessmentDatabase = (language = 'tr') => {
  const filename = `database-${language}.json`;
  return loadJSON(filename);
};

// Medical ranges
const getMedicalRanges = () => {
  return loadJSON('medical-ranges.json');
};

// Export configuration
module.exports = {
  assessment: {
    getDatabase: getAssessmentDatabase,
    getMedicalRanges,
    // Direct exports for convenience
    databaseTR: () => getAssessmentDatabase('tr'),
    databaseEN: () => getAssessmentDatabase('en'),
    medicalRanges: getMedicalRanges()
  }
};