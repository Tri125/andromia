// Contient les règles de validations pour un objet Explorer selon express-validator.

module.exports = class ExplorerValidator {
  static Create() {
      return {
          'displayName': {
              notEmpty: true,
              isLength: {
                  options: [{ min: 7, max: 30 }],
                  errorMessage: "Dois être compris entre 7 et 30 caractères."
              },
              errorMessage: "Nom requis."
          },
          'email': {
              notEmpty: true,
              isEmail: {
                  errorMessage: 'Email invalide.'
              },
              errorMessage: "Email requis."
          },
          'password': {
              notEmpty: true,
              isLength: {
                  //TODO: Vérifier le hashing côté client et serveur. Revenir sur taille min et max.
                  options: [ { min: 8, max: 16 }],
                  errorMessage: "Dois être compris entre 8 et 16 caractères."
              },
              errorMessage: "Password requis."
          }
      };
  }
  
  static Login() {
      return {
          'email': {
              notEmpty: true,
              isEmail: {
                  errorMessage: 'Email invalide.'
              },
              errorMessage: "Email requis."
          },
          'password': {
              notEmpty: true,
              errorMessage: "Password requis."
          }
      };
  }
    
    
};