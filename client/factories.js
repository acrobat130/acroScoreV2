angular.module('acroScore.factories', [])

.factory('getPostFactory', [/*add any parameters in following function as strings here,*/ function(){
	// return console.log("inside the getPostFactory")
	var consoleSomething = function() {
		console.log("inside getPostFactory");
	}

	return {
		test: consoleSomething
	};
}])