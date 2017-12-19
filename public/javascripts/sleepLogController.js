
//--->>> Date and Time Presenter <<<---
var interval;

function getFormattedDate(value) {
  console.log(value);
  var time = new Date();

  var month = ( "0" + ( time.getMonth()+1 ) ).slice(-2);
  var date = ( "0" + time.getDate() ).slice(-2);
  var hours = ( "0" + time.getHours() ).slice(-2);
  var minutes = ( "0" + time.getMinutes() ).slice(-2);

  var formattedDate = month + "/" + date + "  "+ hours + ":" + minutes;

  document.getElementById(value).innerHTML = formattedDate;
}

function updateDateStart(value){
    getFormattedDate(value);
    interval = window.setInterval("getFormattedDate('start')", 30000);
}

updateDateStart("start");

//moment.js 시간 관련 지난 메일 참조

//let button_flag = true;
let logged_start_time;

function sendRequest(data) {
  var myRequest = new Request('/controller_reciever' ,
    {
      method:'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      cookie: document.cookie
    }
   );

  fetch(myRequest).then(function(response) {
    return response.json();
  }).then(function(res) {
    console.log(res);
    button_flag = res.button_flag;
    //localStorage.setItem('logged_start_time', res.logged_start_time);
    console.log(localStorage.getItem('logged_start_time'));
  }).catch(function(err) {
    console.log(err);
  });
}

function goodMorning() {
  var data = {
    auth:document.cookie,//jtw 에서 받아오는 로직
    is_start: false//,
    //logged_start_time: localStorage.getItem('logged_start_time')
  }
  console.log(data);
  sendRequest(data);
  window.clearInterval(interval);
  document.getElementById("end").innerHTML = "";
  updateDateStart("start");

}

function goodNight() {
  var data = {
    auth: document.cookie,
    is_start: true
  }

  sendRequest(data);
  window.clearInterval(interval);
  updateDateStart("end");
}

function sendRequsetForRecentSleepHours() {
  var myRequest = new Request('/lastest_sleeptime', {
    method: "GET",
    headers: {
      "Contents_Type": "application/json"
    }
  });

  fetch(myRequest).then(function(response) {
    console.log(response);
    return response.json();
  }).then(function(res) {
    console.log(REQUEST);
  }).catch(function(err) {
    console.log(err);
  });
}
//sendRequsetForRecentSleepHours();



// 직렬화
// 오브젝트 저장, http request로 보내고 싶을 때,
// 텍스트 파일 등로 변환하는 과정
// 다시 프로그래밍 안에서 쓸 수 있도록 하는 것을 디 시리얼라이제이션
// 객체는 메모리에 올라와 있는 형태
// 밖으로 빼서 전송하거나 파일로 저장할 때
// 메모리에 있는 것이 아니라 스트림: 쪼개진 바이트들의 집합
// 객체 -> 바이트  디시리얼라이제이션 바이트 -> 객체
// json web token 키를 정해 놓으면 그걸로 암호화와 복호화를 할 수 있음
// 양방향 암호화  jwt
