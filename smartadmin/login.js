layui.use(['form', 'layer','element'], function () {

    smartAui.ajax({
        url: '/user/info',
        type:"get",
        success: function (result) {
            if (result.success && result.data) {
                window.location.href = "/views/index.html";
            }
        },
    });

    var form = layui.form
        , layer = layui.layer;
    $('#login').keydown(function (e) {
        if (e.which == 13) {
            $("#SM-login").trigger("click");
        }
    });
    //登录
    $('#SM-login').click(function () {
        var username = $.trim($("#username").val());
        var password = $.trim($("#password").val());
        if(username==""){
            layer.msg('请输入账号');
            return;
        }
        if(password==""){
            layer.msg('请输入密码');
            return;
        }
        smartAui.ajax({
            url: '/user/login',
            type: 'POST',
            dataType: 'json',
            data: {
                account: username,
                password: password
            },
            success: function (result) {
                if (result.success) {
                    if ($('#remember').is(':checked')) {
                        localStorage.setItem('username', username);
                        localStorage.setItem('password', password);
                    } else {
                        localStorage.clear('username');
                        localStorage.clear('password');
                    }
                    localStorage.setItem('account', result.data.account);
                    localStorage.setItem('avatar', result.data.avatar);
                    window.location.href = "/views/index.html";
                }else{
                    layer.msg(result.msg || "登录失败");
                }
            },
            error: function () {
                layer.msg("登录失败");
            }
        })
    });

    //注册
    $('#reg_btn').click(function () {
        var username = $.trim($("#reg_username").val());
        var password = $.trim($("#reg_password").val());
        var imgcode = $.trim($("#reg_img_code").val());
        var userEmailCode = $.trim($("#reg_mail_code").val());
        if(username==""){
            layer.msg('请输入账号');
            return;
        }
        if(imgcode==""){
            layer.msg('请输入图形验证码');
            return;
        }
        if(userEmailCode==""){
            layer.msg('请输入邮箱验证码');
            return;
        }
        if(password==""){
            layer.msg('请输入密码');
            return;
        }
        smartAui.ajax({
            url: '/user/register',
            type: 'POST',
            dataType: 'json',
            data: {
                account: username,
                password: password,
                verificationCode: imgcode,
                userEmailCode: userEmailCode
            },
            success: function (result) {
                if (result.success) {
                    layer.alert("注册成功，请登录",function () {
                        location.href = "/views/login.html";
                    });
                }else{
                    layer.msg(result.msg || "注册失败");
                    $("#imgcode").click();
                }
            },
            error: function () {
                layer.msg(result.msg);
                $("#imgcode").click();
            }
        })
    });


    $(".login-third-wx").click(openweixin);
});

//判断是否存在过用户
if (localStorage.getItem('username')) {
    $("#remember").attr("checked", true);
    $("#username").val(localStorage.getItem('username'));
    $("#password").val(localStorage.getItem('password'))
}
function showLogin() {
    $("#form_reg").hide();
    $("#form_login").show();
}
function showReg() {
    $("#form_login").hide();
    $("#form_reg").show();
}
$("#imgcode").click(function () {
    $("#imgcode").attr("src", "/common/getverifycode?v=" + Math.random());
});
$("#reg_code_send").click(function () {
    var username = $.trim($("#reg_username").val());
    var imgcode = $.trim($("#reg_img_code").val());
    if(username==""){
        layer.msg('请输入邮箱账号');
        return;
    }
    if(imgcode==""){
        layer.msg('请输入验证码');
        return;
    }
    smartAui.ajax({
        url: '/user/sendmail',
        type: 'POST',
        dataType: 'json',
        data: {
            account: username,
            verificationCode: imgcode
        },
        success: function (result) {
            if (result.success) {
                layer.msg("发送成功，请注意查收");
            }else{
                layer.msg(result.msg || "注册失败");
                $("#imgcode").click();
            }
        },
        error: function () {
            layer.msg("注册失败");
            $("#imgcode").click();
        }
    })
});
function openweixin() {
    layer.open({
        type: 1,
        title: !1,
        content: $("#weixinqr"),
        shift: 1,
        isOutAnim: !0,
        closeBtn: 2
    })
}
//百度统计
var _hmt=_hmt||[];(function(){var hm=document.createElement("script");hm.src="https://hm.baidu.com/hm.js?f07686635800b1dc0587d91cd81bf3b0";var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(hm,s)})();
(function(){var bp=document.createElement("script");var curProtocol=window.location.protocol.split(":")[0];if(curProtocol==="https"){bp.src="https://zz.bdstatic.com/linksubmit/push.js"}else{bp.src="http://push.zhanzhang.baidu.com/push.js"}var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(bp,s)})();