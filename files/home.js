var MAC={
    'Ajax':function(url,type,dataType,data,sfun,efun,cfun){
        type=type||'get';
        dataType=dataType||'json';
        data=data||'';
        efun=efun||'';
        cfun=cfun||'';
        $.ajax({
            url:url,
            type:type,
            dataType:dataType,
            data:data,
            timeout: 5000,
            beforeSend:function(XHR){

            },
            error:function(XHR,textStatus,errorThrown){
                if(efun) efun(XHR,textStatus,errorThrown);
            },
            success:function(data){
                sfun(data);
            },
            complete:function(XHR, TS){
                if(cfun) cfun(XHR, TS);
            }
        })
    },
		'Suggest':{
        'Init':function($obj,$mid,$jumpurl){
            try {
                $($obj).autocomplete('/index.php/ajax/suggest?mid=' + $mid, {
                    inputClass: "ac_input",
                    resultsClass: "ac_items",
                    loadingClass: "ac_loading",
                    minChars: 1, matchSubset: 0,
                    cacheLength: 10, multiple: false, matchContains: true, autoFill: false,
                    dataType: "json",
                    parse: function (r) {
                        if (r.code == 1) {
                            var parsed = [];
                            $.each(r['list'], function (index, row) {
                                row.url = r.url;
                                parsed[index] = {
                                    data: row
                                };
                            });
                            return parsed;
                        } else {
                            return {data: ''};
                        }
                    },
                    formatItem: function (row, i, max) {
                        return row.name;
                    },
                    formatResult: function (row, i, max) {
                        return row.text;
                    }
                }).result(function (event, data, formatted) {
                    $($obj).val(data.name);
                    location.href = data.url.replace('mac_wd', encodeURIComponent(data.name));
                });
            }
            catch(e){}
        }
    },
		'Gbook':{
        'Init':function(){
            $('body').on('keyup', '.report-content', function(e){
                MAC.Remaining($(this),200,'.gbook_remaining')
            });
            $('body').on('click', '.gbook_submit', function(e){
                MAC.Gbook.Submit();
            });
        },
        'Submit':function(){
            if($(".report-content").val() == ''){
                MAC.Pop.Msg('内容不能为空',1500);
                return false;
            }
            MAC.Ajax(maccms.path + '/index.php/gbook/saveData','post','json',$('.gbook_form').serialize(),function(r){
                MAC.Pop.Msg(r.msg,5000);
                if(r.code == 1){
                    location.reload();
                }
                else{
                    if(MAC.Gbook.Verify==1){
                        MAC.Verify.Refresh();
                    }
                }
            });
        },
        'Report':function(name,id){
            MAC.Pop.Show('我要报错',maccms.path + '/index.php/gbook/report.html?id='+id+'&name='+ encodeURIComponent(name),function(r){
            });
        }
    },
		'Pop':{
        'Remove':function(){
            $('.shortcuts-overlay').remove();
            $('.popup').remove();
        },
        'RemoveMsg':function(){
            $('.popup-msg').remove();
        },
        'Msg':function($msg,$timeout){
            if($('.shortcuts-overlay').length !=1) {
                MAC.Pop.Remove();
            }
            $('body').append('<div class="popup-msg"></div>');

            $('.popup-msg').html($msg);
            $('.popup-msg').show();
            setTimeout(MAC.Pop.RemoveMsg,$timeout);
        },
        'Show':function($title,$url,$callback) {
            if($('.shortcuts-mobile-overlay').length !=1) {
                MAC.Pop.Remove();
            }
            $('body').append('<div class="popup" id="report-popup"><div class="popup-icon"><img src="/statics/images/report.svg?1"></div><div class="popup-header"><h2 class="popup-title"></h2></div><div class="popup-main"></div><div class="close-popup" id="close-popup"><i class="icon-close-o"></i></div></div><div class="shortcuts-overlay"></div>');
            $('.close-popup').click(function(){
                $('.shortcuts-overlay,.popup').remove();
            });

            $('.popup-main').html('');
            $('.popup-header').find('h2').html($title);

            MAC.Ajax($url,'post','json','',function(r){
                $(".popup-main").html(r);
                $callback(r);
            },function(){
                $(".popup-main").html('加载失败，请刷新...');
            });

            $('.shortcuts-overlay,.popup').show();
        }
    },
    'Hits': {
        'Init':function() {
            if($('.mac_hits').length==0){
                return;
            }
            var $that = $(".mac_hits");

            MAC.Ajax(maccms.path + '/index.php/ajax/hits?mid='+$that.attr("data-mid")+'&id='+$that.attr("data-id")+'&type=update','get','json','',function(r){
                if (r.code == 1) {
                    $(".mac_hits").each(function(i){
                        $type = $(".mac_hits").eq(i).attr('data-type');
                        if($type != 'insert'){
                            $('.'+$type).html(eval('(r.data.' + $type + ')'));
                        }
                    });
                }
            });

        }
    }
}

$(function(){
	  MAC.Suggest.Init('.ac_wd',1,'');
    MAC.Hits.Init();
});
