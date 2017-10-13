var Recruitment = (function () {
    /*	public Global variable or function */
    var pub = {};
    var repo = '';
    var issuesAry = [];
    /*	private Widget variable	*/

    function _init() {
        sessionStorage.setItem("now_widget", "Recruitment");
        $("#recruitment").show()
        $("#section_header .center-heading").text('群組招募')
        $("#Recruitment").ready(function () {
            issuesAry.length = 0;
            repo = 'recruitment';

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

            $('html, body').animate({
                scrollTop: $('#section_header').offset().top - 100
            }, 1000)


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
        });
    }

    function noData() {
        $("#noData").show()
    }

    function drawPic(_data) {
        // $("#mainRow").html('')
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
        }, 0);
    }

    function generateCard(data) {
        var $card = $(".chain_template").clone().removeClass("chain_template").removeAttr("hidden")
        $card.find(".box_title").text(data.title)
        $card.find(".box_title").parents("a:first").attr("href", data.html_url).attr("target", "_blank")
        $card.find(".box_des").text(data.body)
        var dt = new Date(data.updated_at)
        $card.find(".box_date").text(dt.toLocaleDateString());

        $card.appendTo("#mainRow")

        $card.find(".check_info").on('click', this, function(){
            // console.log('gg')
            loadInfo(data)
        })

        counter($card.find(".box_comments"))
    }

    function loadInfo(data) {
        $("#section_header .center-heading").text(data.title)
        $("#recruitment").hide()
        $("#relist").html('');
        $("#relist").load("./widgets/relist/main.html")
        $.getScript("./widgets/relist/js.js", function (wfn) {
            try {
                eval("Relist")._init(data);
            } catch (e) {
                console.log(e);
            }
            // loadFlag = false
        })
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
    
    function getIssues(repo) {
        return callApi('/repos/twoss-io/' + repo + '/issues', 'GET', {})
    }
    
    function _destroy() {
        delete Recruitment;
    }

    pub._init = _init;
    pub._destroy = _destroy;
    return pub;
}());