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
        'runes': {
            notEmpty: true,
            errorMessage: 'runes requis.'
        }
    };
  }
};