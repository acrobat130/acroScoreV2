angular.module('acroScore.addScore', [
	// add dependencies here
	'acroScore.factories'
	])

// if there are factory dependencies, add function it depends on as a function argument
.controller('AddScoreController', ['$scope', 'getPostFactory', '$location', function($scope, getPostFactory, $location) {
	console.log("inside AddScoreController");

	$scope.addScoreToDatabase = function() {
		console.log("adding score to database")
		getPostFactory.test($scope)
			// .then(function() {
				$location.path('/')
			// })


	}
}])