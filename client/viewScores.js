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
	$scope.athleteChartData = []; // [0] = balance, [1] = dynamic, [2] = combined
	$scope.meetsArray = [];
	$scope.chartSeries = ['Balance', 'Dynamic', 'Combined', 'MeetTotal'];

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
			console.log("dataFromFactory", dataFromFactory)
			$scope.formatAthleteChartData(dataFromFactory);
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

	$scope.showScoreList = function() {
		$scope.listOrGraphScores = 'list';
	}

	$scope.showScoreGraph = function() {
		$scope.listOrGraphScores = 'graph';
	}

	$scope.formatAthleteChartData = function(array) { // takes array of objects as the input
		// push into athleteChartData an array of each series to graph
		// [0] = balance, [1] = dynamic, [2] = combined
		var balanceArray = [];
		var dynamicArray = [];
		var combinedArray = [];
		var meetTotalScoreArray = [];
		var meetNamesArray = [];
		// object for storing scores grouped by each meet
		var meetDetailsObj = {};

		// iterate through input array of scores
		for (var i = 0; i < array.length; i++) {
			var meetName = array[i].meetName;
			var meetYear = array[i].meetYear;
			var meetNameAndYear = meetName + ' ' + meetYear;
			var routineTotal = Number(array[i].total);

			// add meet to the meetDetails obj if it's not already in there
			if (!meetDetailsObj[meetNameAndYear]) {
				meetDetailsObj[meetNameAndYear] = new Meet(meetName, meetYear);
			}
			// add score to meetdetails obj
			if (array[i].routineType === 'balance') {
				meetDetailsObj[meetNameAndYear].balance = routineTotal;
			} else if (array[i].routineType === 'dynamic') {
				meetDetailsObj[meetNameAndYear].dynamic = routineTotal;
			} else if (array[i].routineType === 'combined') {
				meetDetailsObj[meetNameAndYear].combined = routineTotal;
			}
		}

		// iterate through meetDetails obj to calculate meetTotals
		for (var meet in meetDetailsObj) {
			if (meetDetailsObj.hasOwnProperty(meet)) {
				var balance = Number(meetDetailsObj[meet].balance);
				var dynamic = Number(meetDetailsObj[meet].dynamic);
				var combined = Number(meetDetailsObj[meet].combined);
				var meetName = meetDetailsObj[meet].name;

				// set meet total
				meetDetailsObj[meet].meetTotal = balance + dynamic + combined;

				// push all scores and meet name to arrays for chart
				balanceArray.push(balance);
				dynamicArray.push(dynamic);
				combinedArray.push(combined);
				meetTotalScoreArray.push(meetDetailsObj[meet].meetTotal);
				meetNamesArray.push(meetName);

			}
		}
		console.log("meetDetailsObj", meetDetailsObj)


		$scope.athleteChartData = [balanceArray, dynamicArray, combinedArray, meetTotalScoreArray];
		$scope.meetsArray = meetNamesArray;
		console.log("$scope.athleteChartData", $scope.athleteChartData);
	}

	// constructor function for formatting athlete chart data
	var Meet = function(meetName, meetYear) {
		this.name = meetName;
		this.year = meetYear;
		this.balance = null;
		this.dynamic = null;
		this.combined = null;
		this.meetTotal = null;
	}

}])




