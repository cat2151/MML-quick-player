angular.module('generatorApp')
.service('GeneratorService', [
function() {

  function generate(inputText) {
    var mml = '';
    mml += ';';
    mml += inputText.replace(/C/g, 'c;e;g');
    return mml;
  };

  return {
    generate: generate
  };
}]);
