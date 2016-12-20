module.exports = {
    version:"1.0",
    baseUrl:"https://ws-andromia-francishamel.c9users.io",
    releaseUrl:"https://ws-andromia-francishamel.c9users.io/v1"
};

//Fonction format rajouté aux types string pour faire du formattage de string.
//  let s = "Bonne {0}";
//  let input = "journée";
//  s.format(input);
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}