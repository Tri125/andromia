//Schema de validation express-validator pourr la création d'une exploration.

module.exports = class ExplorationValidator {
    
  static Create() {
    return {
        'dateExploration': {
            notEmpty: true,
            errorMessage: "dateExploration requis."
        },
        'locations': {
            notEmpty: true,
            errorMessage: 'locations requis.'
        },
        'locations.start': {
            notEmpty: true,
            errorMessage: 'locations start requis.'
        },
        'locations.end': {
            notEmpty: true,
            errorMessage: 'locations end requis.'
        }
    };
  }
};