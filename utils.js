colors=["#CC99C9","#9EC1CF","#9EE09E","#FDFD97 ","#FEB144 ","#FF6663","#cccccc"]
function dayOfWeek(n){
  return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][n]
}
function runningAverage(array, radius){
  radius=Math.floor(radius)
  var average=[]
  for(var i=0;i<array.length;i++){
    var start=Math.max(0,i-radius)
    var end=Math.min(array.length-1,i+radius)
    average.push(0)
    for(var j=start;j<=end;j++){
      average[i]+=array[j]
    }
    average[i]/=end-start+1
  }
  return average
}

function formatSeconds(n){
  string=""
  started=false;
  if(n>=24*60*60){
    string+=Math.floor(n/(24*60*60))+" day "
    n%=24*60*60
    started=true;
  }
  if(n>=60*60 || started){
    string+=Math.floor(n/(60*60))+" hours "
    n%=60*60
  }
  if(n>=60 || started){
    string+=Math.floor(n/60)+" minutes "
    n%=60
  }
  string+=Math.floor(n)+" seconds"
  return string
}

//get number of seconds since midnight
function secondsOfDay(date){
  return date.getSeconds() + (60 * date.getMinutes()) + (60 * 60 * date.getHours());
}

function formatSecondsShort(n){
  if(n==0)return "00:00"
  string=""
  started=false;

  if(n>=60*60 || started){
    string+=Math.floor(n/(60*60))+":"
    n%=60*60
  }
  if(n>=60 || started){
    let m=Math.floor(n/60)
    if(m==0)string+="0"
    if(m<10)string+="0"
    string+=m+":"
    n%=60
  }
  if(n<10)string+="0"
  string+=Math.floor(n)
  return string
}
function formatTime(n){
  date=new Date(0,0,0);
  date=new Date(date.getTime()+n*1000)
  return date.toLocaleString('en-US', { hour: 'numeric', minute:'numeric', hour12: true })

}
function formatArray(arr){
  if(arr.length==0)return ""
  if(arr.length==1){
    return arr[0];
  }
  if(arr.length==2){
    return arr[0]+" and "+arr[1]
  }
  string=""
  for(i=0;i<arr.length-1;i++){
    string+=arr[i]+", "
  }
  string+="and "+arr[arr.length-1]
  return string
}
function formatDayList(arr){
  out=[]
  for(var i=0;i< arr.length;i++){
    out[i]=dayOfWeek(arr[i])
  }

  return formatArray(out)
}

function reformatDate(date){
  date=new Date(new Date(date).getTime()+(new Date()).getTimezoneOffset()*60*1000)
  return dayOfWeek(date.getDay())+" "+(date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear()
}

function NYTFormatToDate(date){
  return (new Date(new Date(date).getTime()+(new Date()).getTimezoneOffset()*60*1000))
}

function toNYTDateFormat(date){
  var month=(date.getMonth()+1)+""
  if(month.length==1) month="0"+month

  var day=date.getDate()+""
  if(day.length==1) day="0"+day
  return date.getFullYear()+"-"+month+"-"+day
}
