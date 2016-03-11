angular.module('acroScore.factories', [])

.factory('getPostFactory', ['$http', function($http){
	// return console.log("inside the getPostFactory")
	var url = '/api/scores';

	var consoleSomething = function(scoreInfoFromUserInput) {
		console.log("inside getPostFactory");
		console.log("testing scoreInfoFromUserInput variable", scoreInfoFromUserInput)
	}
	var postScore = function(data) {
		console.log("data in postScore", data)
		return $http({
			method: 'POST',
			url: '/api/scores',
			data: data
		})
		// return $http.post(url, data)
		.then(function(data) {
			console.log("data successfully posted");
			console.log("data returned from post", data)
		})
	}

	return {
		test: consoleSomething,
		postScore: postScore
	};
}])