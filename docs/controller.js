angular.module('generatorApp')
.controller('generatorController', ['$scope', '$location', '$timeout', 'GeneratorService',
function($scope, $location, $timeout, GeneratorService) {

  $scope.inputText = '';
  $scope.generatedMml = "なし";
  $scope.mmlFormat = "sion";
  $scope.iPhoneReady = false;
  $scope.isPlayFromUrl = false;

  function setMmlFromUrl() {
    // [URLイメージ] ～/#?mml=C
    var urlMml = $location.search().mml;
    if (angular.isString(urlMml)) {
      $scope.inputText = urlMml;
      $scope.generate();
      $scope.isPlayFromUrl = true;
    }
  }

  $scope.generate = function() {
    //iOSでは、WebAudioを最初にclickイベントから扱う必要がある。
    //一度onloadまたはonchangedで実行してしまうと、その後clickで再生しても無音になる。
    if($scope.isiPhone() && $scope.iPhoneReady === false){
        return;
    }

    $timeout(function() { // compileより前にする(compileがSIOPMロード失敗の為にundefinedでexceptionになっても、先にURLへの反映はしておく)
      setParamsToUrlFromScope();
    }, 0);

    $scope.generatedMml = $scope.inputText;
    try{
      SIOPM.stop();
    }catch(e){
      $scope.SIOPM_fallback();
    }
    Pico.pause();

    switch($scope.mmlFormat){
      case "sion" :
        SIOPM.compile($scope.generatedMml);
        break;
      case "sionic" :
        Pico.play(Sionic($scope.generatedMml));
        break;
      default:
        console.error("Unsupported format");
    }

  };

  // URLに反映 [用途] 書いたMMLをURLコピペで共有できるようにする
  function setParamsToUrlFromScope() {
    $location.search({
      mml : $scope.generatedMml
    });
  }

  $scope.play = function(){
    $scope.iPhoneReady = true;
    $scope.generate();
  }

  $scope.isiPhone = function(){
    return window.navigator.userAgent.toLowerCase().indexOf("iphone") >= 0;
  }

  SIOPM.onLoad = function() {
    $timeout(function() {
      setMmlFromUrl();
    }, 1000);
  };

  SIOPM.onCompileComplete = function() {
    SIOPM.play();
  };

  $scope.SIOPM_fallback = function() {
    $scope.mmlFormat = "sionic";
  };

  try{
    SIOPM.initialize(); // [前提] SIOPMのプロパティへ各functionを代入し終わっていること
  }catch(e){
    $scope.SIOPM_fallback();
  }

  $timeout(function() {
    setMmlFromUrl();
  }, 0);

}]);
