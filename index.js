$( document ).ready(function() {
  loadXWordData()
});


//getData from xword.json
xWordData=null;
function loadXWordData(){
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", "xword.json", false);
  rawFile.onreadystatechange = function (){

    if(rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0)){
      console.log(JSON.parse(rawFile.responseText))
      xWordData=JSON.parse(rawFile.responseText)
      dataReady()
      updateHTML()
    }else{
      throw "file error"
    }

  }
  rawFile.send(null);
}



stats={
  "totalStarted":0,
  "totalSolved":0,
  "solvePercent":0,
  "dailySolved":[0,0,0,0,0,0,0],
  "solveTimes":[],
  "averageSolveTime":0,
  "dailySolveTimes":[[],[],[],[],[],[],[]],
  "dailyAverageSolveTimes":[0,0,0,0,0,0,0],
  "solvingPercentOfDay":[],
  "dailySolvingPercentageOfDay":[[],[],[],[],[],[],[]],
  "first":"",
  "firstDate":Infinity,
  "mostRecent":"",
  "mostRecentDate":"1-1-1700",
  "fastest":"",
  "fastestTime":Infinity,
  "slowest":"",
  "slowestTime":-Infinity,
  "totalSolveTime":0,
  "averageTimeOfDay":0,
  "medianTimeOfDay":0,
  "bestDay":0,
  "squaresFilled":0,
  "clueCount":0,
  "boardPercentFilled":[],
  "dailyBoardPercentFilled":[[],[],[],[],[],[],[]],
  "avgDailyBoardPercentFilled":[0,0,0,0,0,0,0],
  "doneDates":[],
  "maxTimeCutoff":2.5*60*60
}



function updateSolveTime(puzzle){
  //solve time
  if(puzzle.calcs.secondsSpentSolving){
    var dayOFWeek=NYTFormatToDate(puzzle["puzzle_meta"]["printDate"]).getDay()
    let solveTime=parseInt(puzzle["calcs"]["secondsSpentSolving"])
    stats["solveTimes"].push(solveTime)
    stats["dailySolveTimes"][dayOFWeek].push(solveTime)
    stats["dailyAverageSolveTimes"][dayOFWeek]+=(solveTime)
    stats["averageSolveTime"]+=(solveTime)
    stats["totalSolveTime"]+=(solveTime)
    if(isNaN(solveTime))console.log(key)


    //check if it slowest or fastest time
    if(solveTime<stats["fastestTime"]){
      stats["fastestTime"]=solveTime;
      stats["fastest"]=key
    }
    if(solveTime>stats["slowestTime"]){
      stats["slowestTime"]=solveTime;
      stats["slowest"]=key
    }
  }
}



function updateMostLeastRecent(puzzle){
  //check if it is the most recent and first puzzle
  var completedDate=puzzle["firsts"]["solved"]
  if(new Date(completedDate)>new Date(stats["mostRecentDate"])){
    stats["mostRecentDate"]=completedDate
    stats["mostRecent"]=key
  }
  if(completedDate<stats["firstDate"]){
    stats["firstDate"]=completedDate;
    stats["first"]=key
  }
}



function countWhiteSquares(puzzle){
  var squareCount=0;
  for(var i=0;i<puzzle["puzzle_data"]["answers"].length;i++){
    if(puzzle["puzzle_data"]["answers"][i]!=null){
    squareCount++;
    }
  }
  return squareCount
}



function updatePercentFilled(puzzle){
  var dayOFWeek=NYTFormatToDate(puzzle["puzzle_meta"]["printDate"]).getDay()
  //count total number of squares (not including black(null) squares)
  var squareCount=countWhiteSquares(puzzle)
  stats["squaresFilled"]+=squareCount

  //get number of clues
  stats["clueCount"]+=puzzle["puzzle_data"]["clues"]["A"].length
  stats["clueCount"]+=puzzle["puzzle_data"]["clues"]["D"].length

  //boardPercentFilled vs time
  var increment=10;//seconds
  stats["percentFilledIncrement"]=increment;
  var cluesFilled=0;
  var time=0;
  var percentFilled=[]

  //generate an array "squares" only containing non-null squares
  var squares=puzzle["board"]["cells"]
  for(var i=0;i<squares.length;i++){
    if(squares[i]==null){
      squares.splice(i,1)
      i--;
    }
  }


  //
  do{
    percentFilled.push(0)

    //count number of filled squares for given time
    for(var i=0;i<squares.length;i++){
      var timestamp=puzzle["board"]["cells"][i]["timestamp"]
      if(timestamp && timestamp<time){
        percentFilled[percentFilled.length-1]++
      }
    }
    percentFilled[percentFilled.length-1]/=squareCount;
    time+=increment

  //while board is unfilled and we haven't reached the time cutoff
  }while(percentFilled[percentFilled.length-1]<1 && percentFilled.length*increment<stats["maxTimeCutoff"])

  //log data if time didn't take longer than the cutoff
  if(percentFilled.length*increment<stats["maxTimeCutoff"]){
    stats["boardPercentFilled"].push(percentFilled)
    stats["dailyBoardPercentFilled"][dayOFWeek].push(percentFilled)
    puzzle["percentFilled"]=percentFilled
  }




}
function updatePercentFilledArrays(){
  //calculate average board solve graph by averaging the percent filled vs. time graphs
  var avgPercentFilled=[];
  var index=0;
  //loop through each time and average the percetn filled for each day
  do{

    avgPercentFilled.push(0)

    //average all percent filleds at that time
    for(var j in stats["boardPercentFilled"]){
      if(index>=stats["boardPercentFilled"][j].length){
        avgPercentFilled[index]+=1
      }else{

        avgPercentFilled[index]+=stats["boardPercentFilled"][j][index]
      }

    }
    avgPercentFilled[index]/=stats["boardPercentFilled"].length;
    index++;
  }while(avgPercentFilled[avgPercentFilled.length-1]<1 )
  stats["avgPercentFilled"]=avgPercentFilled;

  //calculate average board solve graph for each day of week
  for(var i=0;i<7;i++){

    var done=false;
    var avgPercentFilled=[];
    var index=0;
    do{
      done=true;
      avgPercentFilled.push(0)
      for(var j in stats["dailyBoardPercentFilled"][i]){
        if(index>=stats["dailyBoardPercentFilled"][i][j].length){
          avgPercentFilled[index]+=1
        }else{
          done=false;
          avgPercentFilled[index]+=stats["dailyBoardPercentFilled"][i][j][index]
        }

      }
      avgPercentFilled[index]/=stats["dailyBoardPercentFilled"][i].length

      index++

    }while(avgPercentFilled[avgPercentFilled.length-1]<1 )

    stats["avgDailyBoardPercentFilled"][i]=avgPercentFilled;
  }
}




function updateBestDay(){
  //get best day (day of week with most crosswords solved)
  stats["bestDay"]=[]
  max=0
  for(var i=0;i<stats["dailySolved"].length;i++){
    if(stats["dailySolved"][i]==max){
      stats["bestDay"].push(i)
    }
    if(stats["dailySolved"][i]>max){
      stats["bestDay"]=[i];
      max=stats["dailySolved"][i]
    }
  }
}

function updateAverageSolveTime(){
  //divide for averageSolveTime
  stats["averageSolveTime"]/=stats["totalSolved"]
  for(var i=0;i<stats["dailySolveTimes"].length;i++){
    stats["dailyAverageSolveTimes"][i]/=stats["dailySolved"][i]
  }
}

function updateSolveTimeOfDay(){
  //-----------------------------------------------------------------------------
  //of the days where a crossword was completed, what hours were they  on

  //spacing between points to check when crossword was completed (in secs)
  var workingTimes=[]
  var increment=60*10
  var entryCount=0//keep track of how many sections crosswodr was being done in order to divide for weighted average to calculated average time of day.
  for(var i=0;i<24*60*60;i+=increment){
    stats["solvingPercentOfDay"].push(0)
    for(var j=0;j<7;j++){
      stats["dailySolvingPercentageOfDay"][j].push(0)
    }
    //add up all crosswords being completed during this time
    for(key of Object.keys(xWordData)){
      var puzzle=xWordData[key]
      var dayOfWeek=(new Date(puzzle["puzzle_meta"]["printDate"])).getDay()
      if(puzzle["calcs"] && puzzle["calcs"]["solved"]){
        start=new Date(puzzle["firsts"]["opened"]*1000)
        end=new Date(puzzle["firsts"]["solved"]*1000)
        startSecs=secondsOfDay(start)
        endSecs=secondsOfDay(end)

        if(i>=startSecs && i<=endSecs){
          stats["solvingPercentOfDay"][stats["solvingPercentOfDay"].length-1]+=1
          stats["dailySolvingPercentageOfDay"][dayOfWeek][stats["dailySolvingPercentageOfDay"][dayOfWeek].length-1]+=1
          entryCount+=1;
          stats["averageTimeOfDay"]+=i
          workingTimes.push(i)
        }
      }
    }


  }
  stats["medianTimeOfDay"]=workingTimes[Math.floor(workingTimes.length/2)]
  //divide by total completed to get percentage
  stats["solvingPercentOfDay"][stats["solvingPercentOfDay"].length-1]/=stats["totalSolved"]
  for(var j=0;j<7;j++){
    stats["dailySolvingPercentageOfDay"][j][stats["dailySolvingPercentageOfDay"][j].length-1]/=stats["dailySolved"][j]
  }
  stats["averageTimeOfDay"]/=entryCount
}
//populate stats
async function dataReady(){
  //loop through each crossword
  var puzzleDates=Object.keys(xWordData)
  for(var i in puzzleDates){
    key=puzzleDates[i]
    var puzzle=xWordData[key]
    var dayOFWeek=NYTFormatToDate(puzzle["puzzle_meta"]["printDate"]).getDay()

    //if puzzle has been opened
    if(puzzle["firsts"] && puzzle["firsts"]["opened"]){
      stats["totalStarted"]+=1;
    }

    //if the puzzle has been solved
    if(puzzle["calcs"] && puzzle["calcs"]["solved"]){
      stats["doneDates"].push(key)
      stats["totalSolved"]++;
      stats["dailySolved"][dayOFWeek]++;

      updateSolveTime(puzzle)
      updateMostLeastRecent(puzzle)
      updatePercentFilled(puzzle)
    }
    //let percentDone=i/puzzleDates.length*100
    //$("#loadProgress").css("width",percentDone+"%")
  }

  updatePercentFilledArrays()
  updateBestDay()
  updateAverageSolveTime()




  updateSolveTimeOfDay()

  //-----------------------------------------------------------------------------
  stats["solvePercent"]=stats["totalSolved"]/stats["totalStarted"]
  //--------------------------------------------------------------


  console.log(stats)
}


//displays board on canvas
function loadBoard(dateStr){
    try{clearTimeout(replayTimeout);}catch(err){}
  var puzzle=xWordData[toNYTDateFormat(new Date(dateStr))]

  var c=$("#puzzle")[0]
  c.width=400;
  c.height=400;
  var ctx=c.getContext("2d")
  var cellCount=puzzle.board.cells.length
  var width=puzzle.puzzle_meta.width
  var height=puzzle.puzzle_meta.height


  cellWidth=c.width/width
  cellHeight=c.height/height
  ctx.fillStyle="black"
  ctx.textAlign = 'center';
  ctx.font = (cellWidth)*0.8+'px serif';

  ctx.textBaseline = "middle";
  for(var row=0;row<height;row++){
    for(var col=0;col<width;col++){
      i=row*width+col;
      square=puzzle.board.cells[i]
      if(square.blank==true){
        ctx.fillRect(col*cellWidth,row*cellHeight,cellWidth,cellHeight)
      }else{
        ctx.strokeRect(col*cellWidth,row*cellHeight,cellWidth,cellHeight)
        ctx.fillText(square.guess,(col+0.5)*cellWidth,(row+0.5)*cellHeight)
      }

    }
  }
  loadBoardGraph(puzzle)
}

//shows grahp of squarses filled vs time on canvas
function loadBoardGraph(puzzle){
  var c=$("#puzzleGraph")[0]
  c.width=700;
  c.height=400;

  var ctx=c.getContext("2d")
  ctx.textAlign = 'center';
  ctx.textBaseline = "middle";

  if(!puzzle.percentFilled){
    ctx.clearRect(0,0,c.width,c.height)
    ctx.font="50px serif"
    ctx.fillText("data not available",c.width/2,c.height/2)
    return;
  }

  var graphX=c.width*0.2
  var graphY=c.height*0.1
  var graphHeight=c.height*0.7
  var graphWidth=c.width*0.7
  c.graphX=graphX
  c.graphY=graphY
  c.graphHeight=graphHeight
  c.graphWidth=graphWidth

  ctx.strokeRect(graphX,graphY,graphWidth,graphHeight)
  ctx.font="20px serif";

  ctx.fillText("Time", graphX+graphWidth/2,(c.height-(graphY+graphHeight))/1.5+(graphY+graphHeight))

  for(var i=0;i<=100;i+=20){
    ctx.fillText(i+"%",graphX*0.8,graphY+graphHeight-(i/100)*graphHeight)
  }

  ctx.save()
  ctx.translate(graphX/2,c.height/2);
  ctx.rotate(-Math.PI/2)
  ctx.fillText("Percent complete",0,0)
  ctx.restore()

  ctx.beginPath();
  ctx.moveTo(graphX,graphY+graphHeight)
  maxTime=stats["percentFilledIncrement"]*puzzle.percentFilled.length
  for(var i=0;i<puzzle.percentFilled.length;i++){
    var time=i*stats["percentFilledIncrement"]
    var x=(time/maxTime)*(graphWidth)+graphX
    ctx.lineTo(x, graphY+graphHeight-puzzle.percentFilled[i]*graphHeight)

    if(i%(Math.floor(puzzle.percentFilled.length/5))==0 ){
      ctx.font="20px serif";
      ctx.save()
      ctx.translate(x,(c.height-graphY-graphHeight)/5+graphY+graphHeight)
      //ctx.rotate(Math.PI/2)
      ctx.fillText(formatSecondsShort(time),0,0)
      ctx.restore()
    }

  }
  ctx.stroke()
}

//draws a line of the graph during replay
function drawBoardGraphLine(time,puzzle){
  var c=$("#puzzleGraph")[0]

  var ctx=c.getContext("2d")

  maxTime=stats["percentFilledIncrement"]*puzzle.percentFilled.length
  ctx.beginPath()
  ctx.moveTo(c.graphX+time/maxTime*c.graphWidth,c.graphY)
  ctx.lineTo(c.graphX+time/maxTime*c.graphWidth,c.graphY+c.graphHeight)
  ctx.stroke();

  ctx.fillText(formatSecondsShort(time),c.graphX+time/maxTime*c.graphWidth,c.graphY*0.8)
}

function watchReplay(){
  if($("#datepicker").val()=="")return;
  try{clearTimeout(replayTimeout);}catch(err){}
  replayTimeout=setTimeout(function(){replay(0,10)},100)
}

function replay(time,increment){
  puzzle=xWordData[toNYTDateFormat(new Date($("#datepicker").val()))]

  c=$("#puzzle")[0]
  ctx=c.getContext("2d")
  ctx.clearRect(0,0,c.width,c.height)
  var cellCount=puzzle.board.cells.length
  var width=puzzle.puzzle_meta.width
  var height=puzzle.puzzle_meta.height


  cellWidth=c.width/width
  cellHeight=c.height/height
  ctx.fillStyle="black"
  ctx.textAlign = 'center';
  ctx.font = (cellWidth)*0.8+'px serif';

  ctx.textBaseline = "middle";
  allFilled=true;
  for(var row=0;row<height;row++){
    for(var col=0;col<width;col++){
      i=row*width+col;
      square=puzzle.board.cells[i]
      if(square.blank==true){
        ctx.fillRect(col*cellWidth,row*cellHeight,cellWidth,cellHeight)
      }else{
        ctx.strokeRect(col*cellWidth,row*cellHeight,cellWidth,cellHeight)

        if(time>square.timestamp){
          ctx.fillText(square.guess,(col+0.5)*cellWidth,(row+0.5)*cellHeight)
        }else{
          allFilled=false
        }
      }

    }
  }

  loadBoardGraph(puzzle)
  drawBoardGraphLine(time,puzzle)

  if(allFilled==false){
    replayTimeout=setTimeout(function(){replay(time+increment,increment)},100)
  }
}

function updateHTML(){
  $("#attempted").html(stats["totalStarted"])
  $("#solved").html(stats["totalSolved"])
  $("#solveRate").html(Math.floor(stats["solvePercent"]*100)+"%")
  $("#firstPuzzle").html(reformatDate(stats["first"]))
  $("#timeSpent").html(formatSeconds(stats["totalSolveTime"]))
  $("#averageTimeOfDay").html(formatTime(stats["medianTimeOfDay"]))
  $("#fastestTime").html(formatSeconds(stats["fastestTime"]))
  $("#fastestTimeDay").html(reformatDate(stats["fastest"]))
  $("#slowestTime").html(formatSeconds(stats["slowestTime"]))
  $("#slowestTimeDay").html(reformatDate(stats["slowest"]))
  $("#mostRecent").html(reformatDate(stats["mostRecent"]))
  $("#favoriteDay").html(formatDayList(stats["bestDay"]))
  $("#favoriteDayCount").html(Math.max.apply(null,stats["dailySolved"]))
  $("#cluesAnswered").html(stats["clueCount"])
  $("#squaresFilled").html(stats["squaresFilled"])

  timeOfDayChart();
  dailyTimeOfDayChart();
  solveTimeChart();
  squaresFilledChart();
  dailySquaresFilledChart();

  addDatePicker()
  loadBoard($("#datepicker").val())

}
