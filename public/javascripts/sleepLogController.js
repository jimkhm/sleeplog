
//--->>> Date and Time Presenter <<<---
function getFormattedDate() {
  var time = new Date();

  var month = ( "0" + ( time.getMonth()+1 ) ).slice(-2);
  var date = ( "0" + time.getDate() ).slice(-2);
  var hours = ( "0" + time.getHours() ).slice(-2);
  var minutes = ( "0" + time.getMinutes() ).slice(-2);

  var formattedDate = month + "/" + date + "  "+ hours + ":" + minutes;

  document.getElementById("start").value = formattedDate;
}

function updateDate(){
    getFormattedDate();
    window.setInterval("getFormattedDate()", 30000);
}

updateDate();

//--->>>Sleep Log Start <<<---
function goodMorning(){
  const currentTime = document.getElementById("start").value;
  document.getElementById("start").value = currentTime + "SLEEP";
  document.getElementById("logForm").submit();
}
