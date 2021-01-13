function timeOfDayChart(){
  var timeOFDayCtx = document.getElementById('timeOfDay').getContext('2d');

  //Generate labels for all 24 hours
  var labels=[]
  for(var i=0;i<24*60*60;i+=24*60*60/stats["solvingPercentOfDay"].length){
    labels.push(formatTime(i))
  }


  var timeOfDayChart = new Chart(timeOFDayCtx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: 'Time spent on crossword',
              data: stats["solvingPercentOfDay"].map(function(i){return i*100}),
              backgroundColor: ["#dee2e6"],
              borderColor: ["#343a40"],
              borderWidth: 1,
              pointRadius:0,

          }]
      },
      options: {
          scales: {xAxes:[
            {
              scaleLabel:{
                display:true,
                labelString:"Time",
                fontSize:30
              }
            }
          ],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Percentage of days working on puzzle',
              fontSize:20
            },
                  ticks: {
                      beginAtZero: true,
                      callback: function(value, index, values) {
                        return  value+"%";
                    }
                  }
              }]
          }
      }
  });
}


function dailyTimeOfDayChart(){
  var dailyTimeOFDayCtx = document.getElementById('dailyTimeOfDay').getContext('2d');

  //generate labels for all 24 hours
  var labels=[]
  for(var i=0;i<24*60*60;i+=24*60*60/stats["solvingPercentOfDay"].length){
    labels.push(formatTime(i))
  }

  var datasets=[]
  for(var i=6;i>=0;i--){
    dataset={
      label: dayOfWeek(i),
      backgroundColor: colors[i],
      borderColor: colors[i],
      borderWidth: 1,
      fill: true,
      pointRadius:0,
    }
    dataset.data=stats["dailySolvingPercentageOfDay"][i].map(function(i){return i*100/7})
    datasets.push(dataset)
  }

  var dailyTimeOfDayChart = new Chart(dailyTimeOFDayCtx, {
      type: 'line',

      data: {
          labels: labels,
          datasets: datasets,
      },
      options: {
          scales: {xAxes:[
            {
              scaleLabel:{
                display:true,
                labelString:"Time",
                fontSize:30
              }
            }
          ],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Percentage of days working on puzzle',
              fontSize:20
            },
                  stacked:true,
                  ticks: {
                      beginAtZero: true,
                      callback: function(value, index, values) {
                        return  value+"%";
                    }
                  }
              }]
          }
      }
  });
}

function solveTimeChart(){
  let averageWidth=0.03
  var solveTimeCtx = document.getElementById('solveTime').getContext('2d');

  var datasets=[]
  var maxLength=0;
  for(day of stats["dailySolveTimes"]){
    if(day.length>maxLength)maxLength=day.length;
  }

  var labels=[]
  for(var i=1;i<=maxLength;i++)labels.push(i)

  for(i in stats["dailySolveTimes"]){
    dataset={
      label: dayOfWeek(i),
      borderColor: colors[i],
      fill:false,
      borderWidth: 4,
      pointRadius: 0,
    }
    data=runningAverage(stats["dailySolveTimes"][i],stats["dailySolveTimes"][i].length*averageWidth)
    //TODO: set cutoff
    for(var j=0;j<data.length;j++){
      if(data[j]>2*60*60){
        data.splice(j,1)
        i--;
      }
    }

    dataset.data=data;
    datasets.push(dataset)


  }



  var solveTimeChart = new Chart(solveTimeCtx, {
      type: 'line',
      data: {
        labels: labels,
          datasets: datasets
      },
      options: {
          scales: {xAxes:[
            {
              scaleLabel:{
                display:true,
                labelString:"Number Solved",
                fontSize:30
              }
            }
          ],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Time to Solve',
              fontSize:30
            },
                  ticks: {
                      beginAtZero: true,
                      callback: function(value, index, values) {
                        return  formatSeconds(value);
                    }
                  }
              }]
          }
      }
  });




}


function squaresFilledChart(){
  var squaresFilledCtx = document.getElementById('squaresFilledChart').getContext('2d');

  var labels=[]
  for(var i=0;i<stats["avgPercentFilled"].length;i++){
    labels.push(formatSecondsShort(i*stats["percentFilledIncrement"]))
  }

  var squaresFilledChart = new Chart(squaresFilledCtx, {
      type: 'line',

      data: {
          labels: labels,
          datasets: [{
              label: 'Time spent on crossword',
              data: stats["avgPercentFilled"].map(function(i){return i*100}),
              backgroundColor: ["#dee2e6"],
              borderColor: ["#343a40"],
              borderWidth: 1
          }]
      },
      options: {
          scales: {xAxes:[
            {
              scaleLabel:{
                display:true,
                labelString:"Time Elapsed",
                fontSize:30
              }
            }
          ],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Percentage of board filled',
              fontSize:30
            },
                  ticks: {
                      beginAtZero: true,
                      callback: function(value, index, values) {
                        return  value+"%";
                    }
                  }
              }]
          }
      }
  });


}
function dailySquaresFilledChart(){
  var dailySquaresFilledCtx = document.getElementById('dailySquaresFilledChart').getContext('2d');

  var labels=[]
  maxLen=0;
  for(var i in stats["avgDailyBoardPercentFilled"]){
    if(stats["avgDailyBoardPercentFilled"][i].length>maxLen)maxLen=stats["avgDailyBoardPercentFilled"][i].length
  }

  for(var i=0;i<maxLen;i++){
    labels.push(formatSecondsShort(i*stats["percentFilledIncrement"]))
  }

  datasets=[]
  for(var i=0;i<stats["avgDailyBoardPercentFilled"].length;i++){
    dataset={
      label: dayOfWeek(i),
      borderColor: colors[i],
      fill:false,
      borderWidth: 4,
      pointRadius:0,
    }
    data=stats["avgDailyBoardPercentFilled"][i];
    //while(data.length<maxLen)data.push(1)
    dataset.data=data
    datasets.push(dataset)
  }

  var dailySolveTimeChart= new Chart(dailySquaresFilledCtx, {
      type: 'line',

      data: {
          labels: labels,
          datasets: datasets,
      },
      options: {
          scales: {
              xAxes:[
                {
                  scaleLabel:{
                    display:true,
                    labelString:"Time Elapsed",
                    fontSize:30
                  }
                }
              ],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Percentage of board filled',
                  fontSize:30
                },
                  ticks: {
                      beginAtZero: true,
                      callback: function(value, index, values) {
                        return  value*100+"%";
                      },
                      suggestedMax:1,
                  }
              }]
          }
      }
  });

}
