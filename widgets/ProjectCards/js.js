var ProjectCards = (function () {
    /*	public Global variable or function */
    var pub = {};
    /*	private Widget variable	*/
    var words = [];


    function _init() {
        $(document).ready(function(){
            var gr = getRepo();
            gr.then(function (res) {
                $(".loading").remove();
                drawPic(res)
                words.length = 0
            }, function(fail){
                console.log(fail)
            })
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
                if(_data[idx].name=='issues-testing' || _data[idx].name=='twoss-io-videocms-demo' || _data[idx].name=='Main'){
                    idx++
                    timeoutdraw(_data, idx, len)
                }else{
                    generateCard(_data[idx])
                    idx++
                    timeoutdraw(_data, idx, len)
                }
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
        }, 0);
    }

    function generateCard(data) {
        var $card = $(".chain_template").clone().removeClass("chain_template").removeAttr("hidden")
        getTitleImg(data.name).then(function (res) {
            data['titleImg'] = res.html_url
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

        var topics = data.topics
        for (var i = 0; i < topics.length; i++) {
            $card.find(".topics").append('<span class="label label-success">'+topics[i]+'</span>&nbsp;')
        }

        $card.appendTo("#mainRow")
        getMd(data.name).then(function (res) {
            data['md'] = res
            bindEvt($card, data); 
        }, function (fail) {
            data['md'] = '<h4><i class="fa fa-info-circle" aria-hidden="true"></i> 目前暫無內容</h4>'
            bindEvt($card, data);
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

    function bindEvt($elm, data) {
        $elm.unbind().bind('click', function () {
            $("#section_header .center-heading").text(data.name)
            $("#serviceProject").hide()
            loadIssuesWidget(data);
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
        return callApi('/orgs/twoss-io/repos', 'GET', {})
    }

    function getTotalCom() {
        return callApi('/users/twoss-io/repos', 'GET', {})
    }

    function getMd(repo) {
        // return new Promise(function (resolve, reject) {
        //     $.ajax({
        //         method: "GET",
        //         url: "https://raw.githubusercontent.com/twoss-io/"+repo+"/master/README.md",
        //         success: function (res) {
        //             resolve(res)
        //         },
        //         error: function (error) {
        //             reject(error)
        //         }
        //     })
        // })
        return new Promise(function (resolve, reject) {
            var headers = {
                "Content-Type":"application/json; charset=utf-8",
                "Accept":"application/vnd.github.VERSION.html"
            }
            if(sessionStorage.getItem('cryp')){
                headers.Authorization = "Basic " + sessionStorage.getItem('cryp')
            }
            $.ajax({
                method: "GET",
                url: 'https://api.github.com/repos/twoss-io/'+repo+'/readme',
                headers: headers,
                success: function (res) {
                    resolve(res)
                },
                error: function (error) {
                    reject(error)
                }
            })
        })
        // return callApi('/repos/twoss-io/'+repo+'/readme', 'GET', {}, false, true)
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