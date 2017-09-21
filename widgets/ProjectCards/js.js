var ProjectCards = (function () {
    /*	public Global variable or function */
    var pub = {};
    /*	private Widget variable	*/
    var words = [];


    function _init() {
        var gr = getRepo();
        gr.then(function (res) {
            $(".loading").remove();
            drawPic(res)
            words.length = 0
        }, function(fail){
            console.log(fail)
        })
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
                // more then 6 data..
            } else if (idx = len) {
                $('#cloud').jQCloud(words, {
                    // colors:['#FA9513','#FFC06E','#FA9513','#4F8AAB','#83CEF7'],
                    colors: ['#fff'],
                    height: 300,
                    delay: 10,
                    autoResize: true
                });
                $('#cloud').addClass('bounceIn')
            }
        }, 300);
    }

    function generateCard(data) {
        var $card = $(".chain_template").clone().removeClass("chain_template").removeAttr("hidden")
        getTitleImg(data.name).then(function (res) {
            $card.find(".inner").css('background-image', 'url(' + res.html_url + '?raw=true)')
            // $card.find(".inner").css('background-image', 'url("data:image/png;base64,'+res.content+'")')
        }, function (fail) {
            $card.find(".inner").css('background-image', 'url(//placeimg.com/320/180/nature)')
            console.log(fail)
        })
        var des = data.description || data.name
        $card.find(".box_title").text(des)
        $card.find(".box_title").parents("a:first").attr("href", data.html_url).attr("target", "_blank")
        $card.find(".box_des").text(des)
        var dt = new Date(data.updated_at)
        $card.find(".box_date").text(dt.toLocaleDateString());

        $card.appendTo("#mainRow")
        $card.data('repData', data)
        getMd(data.name).then(function (res) {
            bindEvt($card);
            $card.data('md', res)
        }, function (fail) {
            bindEvt($card);
            console.log(fail)
        })

        $card.find(".box_issues").attr("data-count", data.open_issues_count)
        counter($card.find(".box_issues"))

        counter($card.find(".box_comments"))
        words.push({
            text: des,
            weight: data.open_issues_count
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

    function bindEvt($elm) {
        $elm.unbind().bind('click', function () {
            var data = $elm.data("repData")
            data['md'] = $elm.data("md")
            switch (sessionStorage.getItem("now_pages")) {
                case 'index':

                    break;
                case 'projects':
                    $("#section_header .center-heading").text(data.name + " 議題清單")
                    $("#serviceProject").slideUp('slow')
                    loadIssuesWidget(data);
                    break;
            }
        })
    }

    function loadIssuesWidget(data) {
        $("#issuesList").html();
        $("#issuesList").load("./widgets/IssuesList/main.html")
        $.getScript("./widgets/IssuesList/js.js", function (wfn) {
            try {
                eval("IssuesList")._init(data);
            } catch (e) {
                console.log(e);
            }
            // loadFlag = false
        })
    }

    function getRepo() {
        return callApi('/users/twoss-io/repos?sort="updated"', 'GET', {})
    }

    function getTotalCom() {
        return callApi('/users/twoss-io/repos', 'GET', {})
    }

    function getMd(repo) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                method: "GET",
                url: "https://raw.githubusercontent.com/twoss-io/"+repo+"/master/README.md",
                success: function (res) {
                    resolve(res)
                },
                error: function (error) {
                    reject(error)
                }
            })
        })
    }

    function getTitleImg(repo) {
        return callApi('/repos/twoss-io/' + repo + '/contents/title_img.png', 'GET', {})
    }

    function _destroy() {
        delete ProjectCards;
    }

    pub._init = _init;
    pub._destroy = _destroy;
    return pub;
}());