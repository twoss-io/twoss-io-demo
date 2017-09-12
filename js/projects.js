sessionStorage.setItem("now_pages", "projects");

$("#serviceProject").load("./widgets/ProjectCards/main.html")
$.getScript("./widgets/ProjectCards/js.js", function (wfn) {
    try {
        eval("ProjectCards")._init();
    } catch (e) {
        console.log(e);
    }
    loadFlag = false
})

$(document).ready(function () {
    if (sessionStorage.getItem("isLogin") && sessionStorage.getItem("isLogin") != "") {
        $("#loginBtn").hide()
        $("#logoutBtn").show()
        $("#logoutBtn>.u_name").text(sessionStorage.getItem("user"))
    } else {
        $("#loginBtn").show()
        $("#logoutBtn").hide()
    }

    $("#loginBtn").unbind().bind('click', function () {
        $("#login_md").modal('show')
        $("#log_info").html('');
    })

    $("#logoutBtn").unbind().bind('click', function () {
        loginApi(sessionStorage.getItem("cryp"), "DELETE", "/" + sessionStorage.getItem("tid")).then(function (res) {
            sessionStorage.clear();
            window.location = '/index.html'
        }, function (fail) {
            console.log(fail);
            // sessionStorage.clear();
            // window.location = '/index.html'
        })
    })

    $("#doLogin").unbind().bind('click', function () {
        var ld = {
            'acc': $("#git_acc").val(),
            'psw': $("#git_psw").val()
        };
        var cryp = btoa(ld.acc + ":" + ld.psw)
        $("#doLogin").append(' <i class="fa fa-compass fa-spin lo_lo"></i>')
        $("#doLogin").addClass('disabled')
        loginApi(cryp, "POST", "").then(function (res) {
            sessionStorage.setItem("isLogin", true)
            sessionStorage.setItem("token", res.token)
            sessionStorage.setItem("tid", res.id)
            sessionStorage.setItem("cryp", cryp)
            $("#doLogin>.lo_lo").remove()
            $("#doLogin").removeClass('disabled')

            getUsr().then(function (res) {
                sessionStorage.setItem("user", res.login)
                sessionStorage.setItem("uid", res.id)
                $("#loginBtn").hide()
                $("#logoutBtn").show()
                $("#logoutBtn>.u_name").text(res.login)
                $("#login_md").modal('hide')
            }, function (fail) {
                console.log(fail)
                $("#doLogin>.lo_lo").remove()
                $("#doLogin").removeClass('disabled')
                $("#log_info").html('');
                $("#log_info").append("<i class='fa fa-exclamation-circle'></i> 取得用戶資訊失敗，請重新操作")
            });
        }, function (fail) {
            $("#doLogin>.lo_lo").remove()
            $("#doLogin").removeClass('disabled')
            $("#log_info").html('');
            $("#log_info").append("<i class='fa fa-exclamation-circle'></i> 登入錯誤，請重新操作")
        });
    })
});



var getUsr = function () {
    return callApi('/user', 'GET', {}, true)
}

var logoutApi = function () {
    return callApi('/authorizations/' + sessionStorage.getItem("tid"), 'DELETE', {})
}

var loginApi = function (data, method, id) {
    url = "https://api.github.com/authorizations" + id;
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.setRequestHeader("Authorization", "Basic " + data);
        xhr.send(JSON.stringify({
            "scopes": ["repo", "user"],
            "note": "twoss_client"
        }));
        //Call a function when the state changes.
        xhr.onload = function () {
            if (xhr.readyState == XMLHttpRequest.DONE && (xhr.status == 201 || xhr.status == 204)) {
                // console.log(xhr.response)
                resolve(JSON.parse(xhr.response || '{}'))
            } else {
                reject(JSON.parse(xhr.response));
            }
        }
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
    });
}
