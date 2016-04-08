angular.module('acroScore.viewScores', [
	// add dependencies here
	'acroScore.factories',
	'chart.js'
	])

// if there are factory dependencies, add function it depends on as a function argument
.controller('ViewScoresController', ['$scope', 'getPostFactory', '$location', function($scope, getPostFactory, $location) {
	console.log("inside ViewScoresController");

	$scope.scoresQueried = getPostFactory.groupJustPosted;
	$scope.athleteList;
	$scope.meetList;
	$scope.showMeetsOrAthletes = 'athletes'; // change to meets to change to meet display view
	$scope.listOrGraphScores = 'list'; // changes to 'graph' when graph button is clicked

	$scope.athleteChartData = []; // [0] = balance, [1] = dynamic, [2] = combined, [3] = meetTotal
	$scope.meetChartData = []; // [0] = balance, [1] = dynamic, [2] = combined, [3] = meetTotal

	$scope.meetsArray = [];
	$scope.pairgroupsArray = [];

	$scope.athleteChartSeries = ['Balance', 'Dynamic', 'Combined', 'MeetTotal'];
	$scope.meetChartSeries = ['Balance', 'Dynamic', 'Combined', 'MeetTotal'];

	$scope.scoreJustAdded = getPostFactory.scoreJustAdded;

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
			// format and load chart data
			var dataForChart = getPostFactory.formatAthleteChartData(dataFromFactory);
			$scope.athleteChartData = dataForChart.athleteChartData;
			$scope.meetsArray = dataForChart.meetsArray;

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

			var dataForChart = getPostFactory.formatMeetChartData(dataFromFactory);
			$scope.meetChartData = dataForChart.meetChartData;
			$scope.pairgroupsArray = dataForChart.pairgroupsArray;
			console.log("$scope.scoresQueried", $scope.scoresQueried)
		})
		$scope.athleteOrMeetToSearch = "";
		$scope.searchDatabaseFor = "";
	};

	$scope.showScoreList = function() {
		$scope.listOrGraphScores = 'list';
	}

	$scope.showScoreGraph = function() {
		// load graph if it wasn't loaded yet
		if (getPostFactory.scoreJustAdded.wasScoreJustAdded === true) {
			var dataForChart = getPostFactory.formatAthleteChartData($scope.scoresQueried.data)
			$scope.athleteChartData = dataForChart.athleteChartData;
			$scope.meetsArray = dataForChart.meetsArray;
		}
		$scope.listOrGraphScores = 'graph';
	}

	$scope.changeScoreJustAdded = function() {
		getPostFactory.scoreJustAdded.wasScoreJustAdded = false;
		console.log("$scope.scoreJustAdded", $scope.scoreJustAdded)
	}

}])




