angular.module('acroScore.viewScores', [
	// add dependencies here
	'acroScore.factories'
	])

// if there are factory dependencies, add function it depends on as a function argument
.controller('ViewScoresController', ['$scope', 'getPostFactory', '$location', function($scope, getPostFactory, $location) {
	console.log("inside ViewScoresController");

	$scope.groupQueried = getPostFactory.groupJustPosted;
	console.log("$scope.groupQueried", $scope.groupQueried);

	$scope.thirdAthlete = $scope.groupQueried.data[0].athlete3;
	$scope.fourthAthlete = $scope.groupQueried.data[0].athlete4;

	$scope.meetTotal = function(meetName) {
		var meetTotalScore = 0;
		for (var i = 0; i < $scope.groupQueried.data.length; i++) {
			// if the meet names match
			if ($scope.groupQueried.data[i].meetName === meetName) {
				// add scores together
				var scoreToBeAdded = Number($scope.groupQueried.data[i].total);
				meetTotalScore += scoreToBeAdded;
			}
		}
		return meetTotalScore;
	}

}])