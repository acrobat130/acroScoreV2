angular.module('acroScore.viewScores', [
	// add dependencies here
	'acroScore.factories'
	])

// if there are factory dependencies, add function it depends on as a function argument
.controller('ViewScoresController', ['$scope', 'getPostFactory', '$location', function($scope, getPostFactory, $location) {
	console.log("inside ViewScoresController");

	$scope.groupJustPosted = getPostFactory.groupJustPosted;
	console.log("$scope.groupJustPosted", $scope.groupJustPosted);

	$scope.thirdAthlete = $scope.groupJustPosted.data[0].athlete3;
	$scope.fourthAthlete = $scope.groupJustPosted.data[0].athlete4;

}])