// module for overall app
angular.module('acroScore', [
	// add dependencies here
	'ui.router',
	'acroScore.factories',
	'acroScore.addScore',
	'acroScore.viewScores'
	])

// config adds states that correspond with templates and controllers for each view
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
	function($stateProvider, $urlRouterProvider, $locationProvider) {
		// default route that goes to index
		$urlRouterProvider.otherwise('/');

		// controller logic is in js files that correspond to each partial html file
		// these define the different states/views/controllers
		$stateProvider
			.state('home', {
				url: '/',
				abstract: true,
				template: "<div ui-view></div>"
			})
			.state('home.about', {
				url: '',
				templateUrl: 'about.html'
			})
			.state('addScore', {
				url: '/addScore',
				templateUrl: 'addScore.html',
				controller: 'AddScoreController'
			})
			.state('viewScores', {
				url: '/viewScores',
				templateUrl: 'viewScores.html',
				controller: 'ViewScoresController'
			})


	}
])

.controller('NavController', ['$scope', 'getPostFactory', function($scope, getPostFactory) {
	console.log("inside NavController");

	$scope.navbarTabs = [
		{
			name: 'Home',
			sref: 'home.about'
		}, {
			name: 'Add Score',
			sref: 'addScore'
		}, {
			name: 'View Scores',
			sref: 'viewScores'
		}
	];

	$scope.select = function(item) {
		$scope.selected = item;
	};

	$scope.isActive = function(item) {
		return $scope.selected === item;
	};

	// select the home tab as active initially
	$scope.selected = $scope.navbarTabs[0];
	$scope.isActive($scope.selected);




	// $scope.makeTabActive = function(activeTab) {
	// 	activeTab.class = 'active'
	// }

	// $scope.getAthletesAndMeets = function() {
	// 	getPostFactory.fetchAthletesAndMeets();
	// }
}])