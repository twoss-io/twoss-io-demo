var DemandsList = (function () {
    /*	public Global variable or function */
    var pub = {};
    var repo = '';
    var issuesAry = []
    /*	private Widget variable	*/

    function _init() {
        sessionStorage.setItem("now_widget", "DemandsList");
        $("#section_header .center-heading").text('需求討論')
        $("#DemandsList").ready(function () {
            issuesAry.length = 0;
            repo = 'demand'

            $("#addIssues").on('click', this, function () {
                var isLogin = sessionStorage.getItem('isLogin')
                if (isLogin && isLogin != "") {
                    $("#add_md").modal('show')
                } else {
                    $("#login_md").modal('show')
                    $("#login_md").find(".text-danger").remove();
                    $("#login_md").find(".modal-title").append(' <span class="text-danger">* 請登入以獲得完整功能</span>')
                    return false
                }
            })

            $("#addIssue").click(function () {
                var title = $("#Issue_title").val()
                var body = $("#Issue_content").val()
                var data = {
                    title: $("#Issue_title").val(),
                    body: $("#Issue_content").val()
                }

                if (data.title == '' || data.body == '') {
                    $.notify('請正確填入標題與內容', {
                        position: 'top center'
                    })
                    return false;
                }

                postIssues(repo, data).then(function (res) {
                    issuesAry.unshift(res)
                    drawPic(issuesAry)
                    $("#add_md").modal('hide')
                    $("#noData").hide()
                }, function (fail) {
                    $("#add_md").modal('hide')
                    $.notify('發送錯誤，請重新嘗試', {
                        position: 'top center'
                    })
                })
            });

            $('html, body').animate({
                scrollTop: $('#section_header').offset().top - 100
            }, 1000)


            $("#replyCom").on('click', function () {
                var num = $("#replyCom").data().cur_num

                var data = {
                    "body": $("#com_content").val()
                }

                if (data.body == '') {
                    $.notify('請正確填寫內容', {
                        position: 'top center'
                    })
                    return false
                }

                postComments(num, data).then(function (res) {
                    $("#com_md").modal('hide')
                    var tg = $("#replyCom").data().cardDiv
                    generateCom(res, tg.find('.commentsList'))
                    tg.find('.nocommentreply').remove()
                }, function (fail) {
                    $("#com_md").modal('hide')
                    $.notify('發送錯誤，請重新嘗試', {
                        position: 'top center'
                    })
                })
            })

            getIssues(repo).then(function (res) {
                $(".loading").remove();
                if (res.length > 0) {
                    issuesAry = res
                    drawPic(issuesAry)
                } else {
                    noData()
                }
            }, function (fail) {
                console.log(fail)
            });
        })
    }

    function noData() {
        $("#noData").show()
    }

    function drawPic(_data) {
        $("#issues_accordion").find(".panel_div:not('.panel_template')").remove()
        var idx = 0;
        var len = _data.length;
        timeoutdraw(_data, idx, len);
    }

    function timeoutdraw(_data, idx, len) {
        setTimeout(function () {
            if (idx < len) {
                generateCard(_data[idx])
                idx++
                timeoutdraw(_data, idx, len)
            }
        }, 300);
    }

    function generateCard(data) {
        var $card = $(".panel_template").clone().removeClass("panel_template").removeAttr("hidden")
        //collapse setting
        $card.find('.panel-heading').attr('id', 'head_' + data.id)
        $card.find('.panel-collapse.collapse').attr('aria-labelledby', 'head_' + data.id)

        $card.find('.isu_title').attr('href', '#collapse_' + data.id)
        $card.find('.panel-collapse.collapse').attr('id', 'collapse_' + data.id)

        $card.find('.isu_title').text(data.title)
        $card.find('.issues_body').text(data.body)

        $card.find(".collapse_com").attr('href', "#com_" + data.id)
        $card.find(".collapse_com").attr('aria-controls', "com_" + data.id)
        $card.find('.com.collapse').attr('id', "com_" + data.id)

        $card.find('.comments_count').text(data.comments)
        $card.find('.box_comments').text(data.comments)

        $card.find('.isu_num').text(data.number)
        $card.find('.isu_user').text(data.user.login)
        $card.find('.isu_user').attr('href', data.user.html_url)
        var dt = new Date(data.updated_at)
        $card.find('.updt_at').text(dt.toLocaleDateString())

        $card.appendTo("#issues_accordion")
        $card.data('isuData', data)
        setCommentEvt($card, data.id)

        $card.find(".reBtn").unbind().bind('click', function () {
            var isLogin = sessionStorage.getItem('isLogin')
            if (isLogin && isLogin != "") {
                $("#com_md").modal('show')
                $("#replyCom").data('cur_num', $card.data('isuData').number)
                $("#replyCom").data('cardDiv', $card)
            } else {
                $("#login_md").modal('show')
                $("#login_md").find(".text-danger").remove();
                $("#login_md").find(".modal-title").append(' <span class="text-danger">* 請登入以獲得完整功能</span>')
                return false
            }
        })
    }

    function setCommentEvt($elm, id) {
        $elm.find('#collapse_' + id).on('shown.bs.collapse', function () {
            var isu_num = $elm.data('isuData').number
            var isClick = $elm.data('isClick') || false
            if (!isClick)
                getComments(isu_num).then(function (res) {
                    $elm.data('isClick', true)
                    $elm.find(".com_loading").remove();
                    if (res.length > 0) {
                        for (var i = res.length - 1; i > -1; i--) {
                            generateCom(res[i], $elm.find('.commentsList'))
                        }
                    } else {
                        $elm.find('.commentsList').after('<div class="text-center nocommentreply"><h4><i class="fa fa-info-circle" aria-hidden="true"></i> 目前暫無回應</h4></div>')
                    }
                }, function (fail) {
                    console.log(fail)
                });
        })
    }

    function drawCom(_data, target) {
        var idx = 0;
        var len = _data.length;
        timeoutCom(_data, idx, len, target);
    }

    function timeoutCom(_data, idx, len, target) {
        var $tg = target
        setTimeout(function () {
            if (idx < len) {
                generateCom(_data[idx], $tg)
                idx++
                timeoutCom(_data, idx, len)
            }
        }, 100);
    }

    function generateCom(data, target) {
        var $card = $(".com_template").clone().removeClass("com_template").removeAttr("hidden")
        $card.find('.panel-title').text(data.user.login)
        $card.find('.panel-body').text(data.body)

        var dt = new Date(data.updated_at)
        $card.find('.panel-footer').text(dt.toLocaleString())
        target.after($card)
    }

    function getComments(number) {
        return callApi('/repos/twoss-io/' + repo + '/issues/' + number + '/comments', 'GET', {})
    }

    function postComments(number, data) {
        return callApi('/repos/twoss-io/' + repo + '/issues/' + number + '/comments', 'POST', data)

    }

    function getIssues(repo) {
        return callApi('/repos/twoss-io/' + repo + '/issues', 'GET', {})
    }

    function postIssues(repo, data) {
        return callApi('/repos/twoss-io/' + repo + '/issues', 'POST', data)
    }

    function _destroy() {
        delete DemandsList;
    }

    pub._init = _init;
    pub._destroy = _destroy;
    return pub;
}());