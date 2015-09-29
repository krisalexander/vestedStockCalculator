console.log('hello');

angular.module('VestedStockApp', []);
angular.module('VestedStockApp')
  .controller('VestedStockCtrl', function ($scope) {

    // edit / add stock grants here
    $scope.stockGrants = [
      { employee:"Ray Kurzweil", date: new Date(2012, 6, 1), options: 5000, termYears: 4 },
      { employee:"Ray Kurzweil", date: new Date(2015, 2, 3), options: 30000, termYears: 4 }
    ];

    $scope.today = new Date();
    $scope.totalVested = 0;
    $scope.futureMonths = 0;


    $scope.$watch('futureMonths', function(n,o) {
      var now = new Date();
      var future = new Date(now.getFullYear(), now.getMonth() + $scope.futureMonths, 1);
      $scope.futureDate = future;

      //calculate the vesting
      $scope.totalVested = 0;
      for(var i in $scope.stockGrants) {
        var offering = $scope.stockGrants[i];
        var vested = $scope.calculateCurrentVesting( offering.options, offering.date, offering.termYears ).toFixed(0);
        $scope.stockGrants[i].vested = vested; console.log('vested', vested)

        //calculate total
        $scope.totalVested = +$scope.totalVested + +vested;
      }
    });


    $scope.calculateMonthsSinceGrantDate = function(grantDate) {
      var currentDate = new Date();

      //return the # of months since that timestamp
      console.log(  Math.abs(grantDate.getMonth() - currentDate.getMonth() + (12 * (grantDate.getFullYear() - currentDate.getFullYear())) )  );
      var months = Math.abs(
          ( grantDate.getMonth()
            - currentDate.getMonth()
            + (12 * (grantDate.getFullYear() - currentDate.getFullYear()))
          )
        );

      return months + parseInt($scope.futureMonths);
    };

    $scope.calculateCurrentVesting = function( options, date, termYears ) {

      var vestedStock = 0;
      var totalStockOffered = options;
      var monthsSinceGrant = $scope.calculateMonthsSinceGrantDate( date );

      //is the employee past their 1 year mark?
      var quarterVested = monthsSinceGrant >= 12 ? true : false;
      var remainingStock = (totalStockOffered - (.25*totalStockOffered));

      //if so, give them 25%, and calculate the remaining months worth of stock
      if(quarterVested)
      {
        vestedStock += parseInt(totalStockOffered*.25);
        var monthsSinceInitialVesting = parseInt(monthsSinceGrant-12);

        //if 4 years is up, stop.
        if( monthsSinceInitialVesting >= ((termYears-1)*12) )
        {
          vestedStock = totalStockOffered;
          return vestedStock;
        }

        //console.log('Total Months', 12+monthsSinceInitialVesting);
        //console.log('Addional Vested Months', monthsSinceInitialVesting);

        //figure out, based on term, the fraction granted per add'l month
        var denominator = parseInt(12*(termYears-1));

        //for each month worked since first year, increase vesting by that fraction
        var additionalVestedStock = parseInt(remainingStock * (monthsSinceInitialVesting/denominator));

        //tally it up since grant + vesting period 1 starts
        vestedStock += additionalVestedStock;

        //calculate & return the shares vested.
        return vestedStock;
      } else {
        return 0.00;
      }
    }

  });
