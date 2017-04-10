angular.module('PersonalFinance', ['LocalStorageModule'])
.controller('FinanceController', function($scope, localStorageService) {

    $scope.cards = [];
    $scope.income = 5000;
    $scope.onlyNumbers = /^\d+(?:[.]\d+|$)$/;
    $scope.options = [
        {
            value: 'daily',
            visual: 'Daily',
            selected: false
        },
        {
            value: 'weekly',
            visual: 'Weekly',
            selected: false
        },
        {
            value: 'monthly',
            visual: 'Monthly',
            selected: true
        },
        {
            value: 'yearly',
            visual: 'Yearly',
            selected: false
        }
    ];
    $scope.currencies = [
        {
            value: 'pound',
            visual: '£',
            selected: true
        },
        {
            value: 'dollar',
            visual: '$',
            selected: false
        },
        {
            value: 'euro',
            visual: '€',
            selected: false
        }
    ];

    if(localStorageService.isSupported) {
        if (localStorageService.get("cards") !== null) {
            $scope.cards = localStorageService.get("cards");
        }
        if (localStorageService.get("income") !== null) {
            $scope.income = localStorageService.get("income");
        }
        if (localStorageService.get("options") !== null) {
            $scope.options = localStorageService.get("options");
        }
        if (localStorageService.get("currencies") !== null) {
            $scope.currencies = localStorageService.get("currencies");
        }
    }

    $scope.$watch(
        function () {
            return $scope.cards;
        },
        function (newValue, oldValue) {
            if (!angular.equals(oldValue, newValue)) {
                localStorageService.set('cards', $scope.cards);
            }
        },
    true);

    $scope.$watch(
        function () {
            return $scope.options;
        },
        function (newValue, oldValue) {
            if (!angular.equals(oldValue, newValue)) {
                localStorageService.set('options', $scope.options);
            }
        },
    true);

    $scope.$watch(
        function () {
            return $scope.currencies;
        },
        function (newValue, oldValue) {
            if (!angular.equals(oldValue, newValue)) {
                localStorageService.set('currencies', $scope.currencies);
            }
        },
	true);

    $scope.$watch(
        function () {
            return $scope.income;
        },
        function (newValue, oldValue) {
            if (!angular.equals(oldValue, newValue)) {
                localStorageService.set('income', $scope.income);
            }
        },
	true);

	$scope.errors = [];
	
	$scope.closeError = function(id) {
		$scope.errors.splice(id, 1);
	};
	
	$scope.closeAllErrors = function() {
		$scope.errors = [];
	};

	$scope.getSelectedValue = function(array) {

		for (var i = 0; i < array.length; i++) {
			if (array[i].selected === true) {
				 return array[i];
			}
		}
		
	};
	
	$scope.toggleSelected = function(array, option) {

		for (var i = 0; i < array.length; i++) {
			array[i].selected = array[i].value === option;
		}

	};
	
	$scope.newExpenseView = false;
	
	$scope.deleteCard = function(id) {
		$scope.cards.splice(id, 1);
	};
	
	$scope.editCard = function(id) {
		$scope.cards[id].edit = true;
	};
	
	$scope.submitEditExpense = function(id, title, cost) {
		
		if (!validateForm(title, cost)) {
			 return false;
		}
		
		$scope.cards[id].title = title;
		$scope.cards[id].cost = cost;
		$scope.cards[id].edit = false;
		
		return true;
	};

	$scope.incomeEditing = false;
	
	$scope.finalizeEditing = function() {
		$scope.incomeEditing = false;
	};
	
	$scope.setIncome = function(type, income) {
		$scope.incomeEditing = true;
		$scope.income = income;
	};

	$scope.getDifference = function () {
		var value = round2DP(Math.abs($scope.getIncome($scope.getSelectedValue($scope.options).value) - $scope.calculateOutgoings()));
		if (!isNaN(value)){
            return value;
        } else {
			return 0;
		}
    };
	
	$scope.getIncome = function(type) {
		
		if (!$scope.incomeEditing) {
			var income = 0;

			switch(type) {
				case 'yearly':
					income = $scope.income;
					break;
				case 'monthly':
					income = ($scope.income / 12);
					break;
				case 'weekly':
					income = ($scope.income / 12) / 4;
					break;
				case 'daily':
					income = (($scope.income / 12) / 4) / 7;
					break;
			}

			return round2DP(income);
		}
		
	};
	
	$scope.outgoingStatus = function() {
		
		var income = $scope.getIncome($scope.getSelectedValue($scope.options).value);
		var outgoings = $scope.calculateOutgoings();
		
		if (income > outgoings && outgoings <= income / 2) {
			return 'low';
		}
		if (income > outgoings / 2 && income > outgoings) {
			return 'medium';
		}
		if (income <= outgoings) {
			return 'high';
		}
	};
	
	$scope.calculateOutgoings = function() {
		
		var outgoings = 0;
		
		for (var i = 0; i < $scope.cards.length; i++) { 
			if ($scope.getSelectedValue($scope.options).value === 'daily') {
				 outgoings += ($scope.cards[i].cost / 4) / 7;
				continue;
			}
			if ($scope.getSelectedValue($scope.options).value === 'weekly') {
				 outgoings += ($scope.cards[i].cost / 4);
				continue;
			}
			if ($scope.getSelectedValue($scope.options).value === 'monthly') {
				 outgoings += $scope.cards[i].cost;
				continue;
			}
			if ($scope.getSelectedValue($scope.options).value === 'yearly') {
				 outgoings += ($scope.cards[i].cost * 12);
			}
		}
		
		return round2DP(outgoings);
	};
	
	function round2DP(value) {
		return Math.round(value * 100) / 100;
	}
	
	$scope.toggleNewExpense = function() {
		$scope.newExpenseView = !$scope.newExpenseView;
	};
	
	function errorDescriptionExist(string) {
		
		for (var i = 0; i < $scope.errors.length; i++) {
			if ($scope.errors[i].description === string) {
				 return true;
			}
		}
		
		return false;
	}
	
	function validateForm(title, cost) {
		
		$scope.errors = [];
		
		if (!title) {
			if (!errorDescriptionExist('Please make sure service is not empty!')) {
				$scope.errors.push({
					title: "Expense Form Error",
					description: "Please make sure service is not empty!"
				});
			}
		}
		
		if (!cost) {
			if (!errorDescriptionExist('Please make sure cost is not empty!')) {
				$scope.errors.push({
					title: "Expense Form Error",
					description: "Please make sure cost is not empty!"
				});
			}
		}

		if (!$scope.onlyNumbers.exec(cost)) {
            if (!errorDescriptionExist('Please make sure cost is a number!')) {
                $scope.errors.push({
                    title: "Expense Form Error",
                    description: "Please make sure cost is number!"
                });
            }
		}
		
		if (cost <= 0) {
			if (!errorDescriptionExist('Please make sure cost is more than 0!')) {
				$scope.errors.push({
					title: "Expense Form Error",
					description: "Please make sure cost is more than 0!"
				});	
			}
		}
		
		return $scope.errors.length <= 0;
	}
	
	$scope.newExpense = function(title, cost) {
		
		if (!validateForm(title, cost)) {
			 return false;
		}
		
		$scope.cards.push({
			title: title,
			cost: round2DP(parseFloat(cost)),
			edit: false
		});
		
		$scope.title = '';
		$scope.cost = '';
		
		$scope.toggleNewExpense();

		return true;
	};
	
});
	angular.element(function() {
	angular.bootstrap(document, ['PersonalFinance']);
});