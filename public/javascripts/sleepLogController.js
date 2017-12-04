
//--->>> Date and Time Presenter <<<---
function getFormattedDate(value) {
  console.log(value);
  var time = new Date();

  var month = ( "0" + ( time.getMonth()+1 ) ).slice(-2);
  var date = ( "0" + time.getDate() ).slice(-2);
  var hours = ( "0" + time.getHours() ).slice(-2);
  var minutes = ( "0" + time.getMinutes() ).slice(-2);

  var formattedDate = month + "/" + date + "  "+ hours + ":" + minutes;

  document.getElementById(value).value = formattedDate;
}

var interval;

function updateDateStart(){
    //document.getElementById("end_sign").value=""
    getFormattedDate("start");
    interval = window.setInterval("getFormattedDate('start')", 30000);
}

function updateDateEnd(){
    getFormattedDate("end");
    interval = window.setInterval("getFormattedDate('end')", 30000);
}

updateDateStart();

//--->>>Sleep Log Start <<<---
function goodNight(){
  if(document.getElementById("start").value.slice(-5) === "SLEEP") {
    console.log("already started");
  } else {
    const currentTime = document.getElementById("start").value;
    document.getElementById("start").value = currentTime + " SLEEP";
    document.getElementById("logForm").submit();
    window.clearInterval(interval);
    updateDateEnd();
  }
}

//--->>>Sleep Log End <<<---
function goodMorning(){
  if(document.getElementById("end").value.slice(-5) === "") {
    console.log("already ended");
  } else {
    document.getElementById("end_sign").value="end";
    document.getElementById("end").value = "";
    document.getElementById("logForm").submit();
    window.clearInterval(interval);
    updateDateStart();
  }
}
