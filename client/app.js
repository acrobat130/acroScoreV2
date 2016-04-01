// module for overall app
angular.module('acroScore', [
	// add dependencies here
	'ui.router',
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
				url: '/'
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
	}])