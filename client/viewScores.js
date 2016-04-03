angular.module('acroScore.viewScores', [
	// add dependencies here
	'acroScore.factories'
	])

// if there are factory dependencies, add function it depends on as a function argument
.controller('ViewScoresController', ['$scope', 'getPostFactory', '$location', function($scope, getPostFactory, $location) {
	console.log("inside ViewScoresController");

	$scope.groupQueried = getPostFactory.groupJustPosted;
	console.log("$scope.groupQueried", $scope.groupQueried);

	// test to see if the groupQueried object is empty or not
	$scope.groupQueryLoaded = function() {
		console.log("Object.keys($scope.groupQueried).length", Object.keys($scope.groupQueried).length)
		if (Object.keys($scope.groupQueried).length > 0) {
			return true;
		} else {
			return false;
		}
	};

	// set values of athlete names after they have loaded
	if ($scope.groupQueryLoaded()) {
		$scope.thirdAthlete = $scope.groupQueried.data[0].athlete3;
		$scope.fourthAthlete = $scope.groupQueried.data[0].athlete4;
	}

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
	};

	$scope.searchDatabase = function() {
		$scope.dataForRequest = {
			searchType: $scope.searchDatabaseFor,
			dataToSearchFor: $scope.athleteOrMeetToSearch
		};
		alert('retrieving scores from database');
		getPostFactory.getScores($scope.dataForRequest).then(function(dataFromFactory) {
			$scope.groupQueried = dataFromFactory;
		})
		$scope.athleteOrMeetToSearch = "";
	};

}])