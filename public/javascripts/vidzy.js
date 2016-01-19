var app = angular.module('Vidzy', ['ngResource', 'ngRoute'])
app.directive('showErrors', function ($timeout, showErrorsConfig) {
  var getShowSuccess, linkFn;
  getShowSuccess = function (options) {
    var showSuccess;
    showSuccess = showErrorsConfig.showSuccess;
    if (options && options.showSuccess != null) {
      showSuccess = options.showSuccess;
    }
    return showSuccess;
  };
  linkFn = function (scope, el, attrs, formCtrl) {
    var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses;
    blurred = false;
    showSuccess = attrs.showValid !== undefined;
    inputEl = el[0].querySelector('[name]');
    inputNgEl = angular.element(inputEl);
    inputName = inputNgEl.attr('name');
    if (!inputName) {
      throw 'show-errors element has no child input elements with a \'name\' attribute';
    }
    inputNgEl.bind('blur', function () {
      blurred = true;
      return toggleClasses(formCtrl[inputName].$invalid);
    });
    scope.$watch(function () {
      return formCtrl[inputName] && formCtrl[inputName].$invalid;
    }, function (invalid) {
      if (!blurred) {
        return;
      }
      return toggleClasses(invalid);
    });
    scope.$on('show-errors-check-validity', function () {
      return toggleClasses(formCtrl[inputName].$invalid);
    });
    scope.$on('show-errors-reset', function () {
      return $timeout(function () {
        el.removeClass('has-error');
        el.removeClass('has-success');
        return blurred = false;
      }, 0, false);
    });
    return toggleClasses = function (invalid) {
      el.toggleClass('has-error', invalid);
      if (showSuccess) {
        return el.toggleClass('has-success', !invalid);
      }
    };
  };
  return {
    restrict: 'A',
    require: '^form',
    compile: function (elem, attrs) {
      if (!elem.hasClass('form-group')) {
        throw 'show-errors element does not have the \'form-group\' class';
      }
      return linkFn;
    }
  };
});

app.provider('showErrorsConfig', function () {
  var _showSuccess;
  _showSuccess = false;
  this.showSuccess = function (showSuccess) {
    return _showSuccess = showSuccess;
  };
  this.$get = function () {
    return { showSuccess: _showSuccess };
  };
});

app.config(['$routeProvider', function($routeProvider){
  $routeProvider
    .when('/', {
        templateUrl: 'partials/home.html',
        controller: 'HomeCtrl'
    })
    .when('/newvideo', {
      templateUrl: 'partials/add-video.html',
      controller: 'AddVideoCtrl'
    })
    .when('/video/:id', {
      templateUrl: 'partials/edit-video.html',
      controller: 'EditVideoCtrl'
    })
    .when('/video/delete/:id', {
      templateUrl: 'partials/delete-video.html',
      controller: 'DeleteVideoCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
}]);

app.controller('HomeCtrl', ['$scope', '$resource',
  function($scope, $resource){
    var Videos = $resource('/api/videos');
    Videos.query(function(videos) {
      $scope.videos = videos;
    });
  }
]);

app.controller('AddVideoCtrl', ['$scope', '$resource', '$location',
  function($scope, $resource, $location){
    var vm = this;
    vm.saveChanges = function() {
      var theForm = vm.myForm;
      $scope.$broadcast('show-errors-check-validity');
      if(theForm.$invalid) return;

      var Videos = $resource('/api/videos');
      Videos.save($scope.video, function(){
        $location.path('/');
      });
    }
  }
]);

app.controller('EditVideoCtrl', ['$scope', '$resource', '$location', '$routeParams',
  function($scope, $resource, $location, $routeParams){
    var vm = this;

    var Videos = $resource('/api/videos/:id', { id: '@_id' }, {
        update: { method: 'PUT' }
    });

    Videos.get({ id: $routeParams.id }, function(video){
      $scope.video = video;
    });

    vm.saveChanges = function() {
      var theForm = vm.myForm;
      $scope.$broadcast('show-errors-check-validity');
      if(theForm.$invalid) return;

      Videos.update($scope.video, function(){
        $location.path('/');
      });
    }
  }
]);

app.controller('DeleteVideoCtrl', ['$scope', '$resource', '$location', '$routeParams',
  function($scope, $resource, $location, $routeParams){
    var Videos = $resource('/api/videos/:id');

    Videos.get({ id: $routeParams.id }, function(video){
      $scope.video = video;
    })

    $scope.delete = function(){
      Videos.delete({ id: $routeParams.id }, function(video){
        $location.path('/');
      });
    }
  }
]);
