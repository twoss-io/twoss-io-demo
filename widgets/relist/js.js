var Relist = (function () {
    /*	public Global variable or function */
    var pub = {};
    var number = '';
    var issuesAry = []
    /*	private Widget variable	*/

    function _init(data) {
        number = data.number
        $("#Relist").ready(function () {
            $("#btn_back").on('click', this, function (e) {
                e.preventDefault();
                $("#recruitment").slideDown('slow')
                $("#section_header .center-heading").text("群組招募")
                _destroy();
                $("#Relist").remove();
            })

            $("#replyCom").on('click',this, function () {
                var num = number
    
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
                    generateCom(res)
                    $('.nocommentreply').remove()
                }, function (fail) {
                    $("#com_md").modal('hide')
                    $.notify('發送錯誤，請重新嘗試', {
                        position: 'top center'
                    })
                })
            })

            $("#applygroup").on('click', this, function () {
                var isLogin = sessionStorage.getItem('isLogin')
                if (isLogin && isLogin != "") {
                    $("#app_md").modal('show')
                } else {
                    $("#login_md").modal('show')
                    $("#login_md").find(".text-danger").remove();
                    $("#login_md").find(".modal-title").append(' <span class="text-danger">* 請登入以獲得完整功能</span>')
                    return false
                }
            })

            $("#addApply").on('click', this, function () {
                var num = number
    
                var data = {
                    "body": 'Apply - '+ $('#apply_content').val()
                }
    
                postComments(num, data).then(function (res) {
                    $("#app_md").modal('hide')
                    generateCom(res)
                    $('.nocommentreply').remove()
                    var v = $("#applycount").attr('data-count')
                    console.log(v)
                    $("#applycount").attr('data-count', parseInt(v)+1)
                    counter($("#applycount"))
                }, function (fail) {
                    $("#app_md").modal('hide')
                    $.notify('發送錯誤，請重新嘗試', {
                        position: 'top center'
                    })
                })
            })

            issuesAry.length = 0;

            $('html, body').animate({
                scrollTop: $('#section_header').offset().top - 100
            }, 1000)

            generateCard(data)

            // getComments(number).then(function (res) {
            //     $(".loading").remove();
            //     if (res.length > 0) {
            //         issuesAry = res
            //         // drawPic(issuesAry)
            //     } else {
            //         noData()
            //     }
            // }, function (fail) {
            //     console.log(fail)
            // });
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
        var $card = $(".panel_template")

        $card.find('.isu_title').text(data.title)
        $card.find('.issues_body').text(data.body)

        $card.find('.comments_count').text(data.comments)
        $('.box_comments').text(data.comments)

        $card.find('.isu_num').text(data.number)
        $card.find('.isu_user').text(data.user.login)
        $card.find('.isu_user').attr('href', data.user.html_url)
        var dt = new Date(data.updated_at)
        $card.find('.updt_at').text(dt.toLocaleDateString())

        setCommentEvt(data)

        $card.find(".reBtn").on('click', this, function () {
            var isLogin = sessionStorage.getItem('isLogin')
            if (isLogin && isLogin != "") {
                $("#com_md").modal('show')
                $("#replyCom").data('cur_num', data.number)
                $("#replyCom").data('cardDiv', $card)
            } else {
                $("#login_md").modal('show')
                $("#login_md").find(".text-danger").remove();
                $("#login_md").find(".modal-title").append(' <span class="text-danger">* 請登入以獲得完整功能</span>')
                return false
            }
        })
    }

    function setCommentEvt(data) {
        var isu_num = data.number
        getComments(isu_num).then(function (res) {
            $(".com_loading").remove();
            if (res.length > 0) {
                var count = 0
                for (var i = res.length - 1; i > -1; i--) {
                    generateCom(res[i])
                    if(res[i].body.substring(0, 5)=='Apply'){
                        count++
                    }
                }
                $("#applycount").attr('data-count', count)
                counter($("#applycount"))
            } else {
                $('.commentsList').after('<div class="text-center nocommentreply"><h4><i class="fa fa-info-circle" aria-hidden="true"></i> 目前暫無回應</h4></div>')
            }
        }, function (fail) {
            console.log(fail)
        });
    }

    function generateCom(data) {
        var $card = $(".com_template").clone().removeClass("com_template").removeAttr("hidden")
        $card.find('.panel-title>a').text(data.user.login)
        $card.find('.panel-title>a').attr('href', data.user.html_url)
        $card.find('.panel-body').text(data.body)

        var dt = new Date(data.updated_at)
        $card.find('.panel-footer').text(dt.toLocaleString())
        $('.commentsList').after($card)
    }

    function counter($elm) {
        var $this = $elm,
            countTo = $this.attr('data-count');

        $({
            countNum: $this.text()
        }).animate({
            countNum: countTo
        }, {
            duration: 1000,
            easing: 'linear',
            step: function () {
                $this.text(Math.floor(this.countNum));
            },
            complete: function () {
                $this.text(this.countNum);
            }
        });
    }

    function getComments(number) {
        return callApi('/repos/twoss-io/recruitment/issues/' + number + '/comments', 'GET', {})
    }

    function postComments(number, data) {
        return callApi('/repos/twoss-io/recruitment/issues/' + number + '/comments', 'POST', data)

    }

    function _destroy() {
        delete IssuesList;
    }

    pub._init = _init;
    pub._destroy = _destroy;
    return pub;
}());