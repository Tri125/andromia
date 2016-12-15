module.exports = class ExplorationValidator {
    
  static Create() {
    return {
        'dateExploration': {
            notEmpty: true,
            isLength: {
                options: [{ min: 7, max: 30 }],
                errorMessage: "Dois être compris entre 7 et 30 caractères."
            },
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