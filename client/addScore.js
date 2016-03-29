angular.module('acroScore.addScore', [
	// add dependencies here
	'acroScore.factories'
	])

// if there are factory dependencies, add function it depends on as a function argument
.controller('AddScoreController', ['$scope', 'getPostFactory', '$location', function($scope, getPostFactory, $location) {
	console.log("inside AddScoreController");

	// updates total score when other score parameters are edited
	$scope.updateScore = function() {
		$scope.totalScore = $scope.artistryScore + $scope.executionScore + $scope.difficultyScore - $scope.penalties;
	};

	// makes sure that total routine score adds up correctly if user edits the total
	$scope.validateScore = function() {
		// if user edits artistry, execution, or difficulty
		if ($scope.artistryScore !== 0 && $scope.executionScore !== 0 && $scope.difficultyScore !== 0) {
			// and if total score doesn't equal the sum, alert user
			if ($scope.totalScore !== $scope.artistryScore + $scope.executionScore + $scope.difficultyScore - $scope.penalties) {
				alert("The total routine score you entered doesn't match the artistry, execution, difficulty, and penalties you entered. Please double check the scores for accuracy.")
			}
		}

	}

	$scope.addScoreToDatabase = function() {
	console.log("scope.totalScore", $scope.totalScore)

		$scope.dataToSend = {
			meetName: $scope.meetName,
			groupNumber: $scope.groupNumber,
			athlete1: $scope.athlete1,
			athlete2: $scope.athlete2,
			athlete3: $scope.athlete3,
			athlete4: $scope.athlete4
		}

		console.log("adding score to database")
		getPostFactory.postScore($scope.dataToSend)
		// getPostFactory.test($scope)
		alert("your score is being added to the acroScore database");
		$location.path('/');

	}
}])