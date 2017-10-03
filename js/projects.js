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
        sessionStorage.clear();
        location.reload();
    })

    $("#doLogin").unbind().bind('click', function () {
        var ld = {
            'acc': $("#git_acc").val(),
            'psw': $("#git_psw").val()
        };
        var cryp = btoa(ld.acc + ":" + ld.psw)
        $("#doLogin").append(' <i class="fa fa-compass fa-spin lo_lo"></i>')
        $("#doLogin").attr('disabled', true)

        getUsr(cryp).then(function (res) {
            sessionStorage.setItem("isLogin", true)
            sessionStorage.setItem("cryp", cryp)
            sessionStorage.setItem("user", res.login)
            sessionStorage.setItem("uid", res.id)
            $("#loginBtn").hide()
            $("#logoutBtn").show()
            $("#logoutBtn>.u_name").text(res.login)
            $("#login_md").modal('hide')
            location.reload();
        }, function (fail) {
            console.log(fail)
            $("#doLogin>.lo_lo").remove()
            $("#doLogin").attr('disabled', false)
            $("#log_info").html('');
            $("#log_info").append("<i class='fa fa-exclamation-circle'></i> 取得用戶資訊失敗，請重新操作")
        });
    });

    $("#demand").unbind().bind('click', function(){
        deleteWidget()
        loadDemandsWidget()
    })

    $("#working").unbind().bind('click', function(){
        deleteWidget()
        loadWorkingWidget()
    })
});

function loadWorkingWidget(data){
    $(".mainWidget").each(function() {
        $(this).html('')
    });
    $("#serviceProject").load("./widgets/ProjectCards/main.html")
    $.getScript("./widgets/ProjectCards/js.js", function (wfn) {
        try {
            eval("ProjectCards")._init();
        } catch (e) {
            console.log(e);
        }
        loadFlag = false
    })
}

function loadDemandsWidget(data) {
    $(".mainWidget").each(function() {
        $(this).html('')
    });
    $("#demandsList").load("./widgets/DemandsList/main.html")
    $.getScript("./widgets/DemandsList/js.js", function (wfn) {
        try {
            eval("DemandsList")._init(data);
        } catch (e) {
            console.log(e);
        }
        // loadFlag = false
    })
}

function deleteWidget(){
    var ng = sessionStorage.getItem('now_widget')
    eval(ng)._destroy();    
}

var getUsr = function (cryp) {
    return callApi('/user', 'GET', {}, cryp)
}

var logoutApi = function (cryp) {
    return callApi('/authorizations/' + sessionStorage.getItem("tid"), 'DELETE', {}, cryp)
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
