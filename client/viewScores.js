angular.module('acroScore.viewScores', [
	// add dependencies here
	'acroScore.factories'
	])

// if there are factory dependencies, add function it depends on as a function argument
.controller('ViewScoresController', ['$scope', 'getPostFactory', '$location', function($scope, getPostFactory, $location) {
	console.log("inside ViewScoresController");

	$scope.scoresQueried = getPostFactory.groupJustPosted;
	$scope.athleteList;
	$scope.meetList;
	$scope.showMeetsOrAthletes = 'athletes'; // change to meets to change to meet display view

	//load athletelist and meetlist for search functionality
	getPostFactory.fetchAthletesAndMeets().then(function(dataFromFactory) {
		$scope.setExtraAthleteNames();
		$scope.athleteList = dataFromFactory.athletes;
		$scope.meetList = dataFromFactory.meets;
	})

	// test to see if the scoresQueried object is empty or not, which determines whether to show scores table or not
	$scope.scoreQueryLoaded = function() {
		// console.log("Object.keys($scope.scoresQueried).length", Object.keys($scope.scoresQueried).length)
		if (Object.keys($scope.scoresQueried).length > 0) {
			if ($scope.scoresQueried.data.length > 0) {
				return true;
			}
		}
		return false;
	};

	// set values of athlete names after they have loaded
	$scope.setExtraAthleteNames = function() {
		// if ($scope.scoreQueryLoaded()) {
		if (Object.keys($scope.scoresQueried).length > 0) {
			if ($scope.scoresQueried.data.length > 0) {
				$scope.thirdAthlete = $scope.scoresQueried.data[0].athlete3;
				$scope.fourthAthlete = $scope.scoresQueried.data[0].athlete4;
			}
		}
		// }
	}
	// $scope.setExtraAthleteNames();

	$scope.meetTotal = function(meetName) {
		var meetTotalScore = 0;
		for (var i = 0; i < $scope.scoresQueried.data.length; i++) {
			// if the meet names match
			if ($scope.scoresQueried.data[i].meetName === meetName) {
				// add scores together
				var scoreToBeAdded = Number($scope.scoresQueried.data[i].total);
				meetTotalScore += scoreToBeAdded;
			}
		}
		return meetTotalScore;
	};

	$scope.searchDatabaseAthletes = function(athlete1, athlete2, athlete3, athlete4, teamName) {
		$scope.dataForRequest = {
			athlete1: athlete1,
			athlete2: athlete2,
			athlete3: athlete3,
			athlete4: athlete4,
			teamName: teamName
		};
		alert('retrieving scores from database');
		getPostFactory.getScoresFromAthletes($scope.dataForRequest).then(function(dataFromFactory) {
			$scope.setExtraAthleteNames();
			// $location.path('/viewScores');
			// $scope.scoresQueried = dataFromFactory;
		})
		$scope.athleteOrMeetToSearch = "";
		$scope.searchDatabaseFor = "";
	};

	$scope.searchDatabaseMeets = function(meetName, meetYear) {
		$scope.dataForRequest = {
			meetName: meetName,
			meetYear, meetYear
		};
		alert('retrieving scores from database');
		getPostFactory.getScoresFromMeets($scope.dataForRequest).then(function(dataFromFactory) {
			$scope.setExtraAthleteNames();
			$scope.showMeetsOrAthletes = 'meets';
		})
		$scope.athleteOrMeetToSearch = "";
		$scope.searchDatabaseFor = "";
	};

}])




