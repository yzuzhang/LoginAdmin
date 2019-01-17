/**
 * 设置ajax全局默认参数
 *
 */
jQuery.ajaxSetup({
    async: true,//异步加载
    type: "post",
    dataType: "json",
    cache: false, // 不缓存数据
    error: function (XMLHttpRequest, textStatus, errorThrown) {
        // console.log(XMLHttpRequest);
        // console.log(textStatus);
        // console.log(errorThrown);
    },
    complete: function (XMLHttpRequest, textStatus) {
        var sessionState = XMLHttpRequest.getResponseHeader("sessionState"); //通过XMLHttpRequest取得响应头,sessionState
        //判断是否登录
        if (sessionState == 'notLogin' && location.pathname != "/views/login.html") {
            layer.msg('请先登录系统', {shift: -1}, function () {
                location.href = "/views/login.html";
            });
        }
    }
});

;!function (win) {
    var layui = win.layui;
    var template = win.template;
    var smartAUi = function () {
        this.DEFAULT_FORMID = "list_form";   //默认查询表单id
        this.choosed = [];                   //用于弹出层多选
        this.v = '1.0.0';                   //版本号
        this.ajaxLoading = false;
    };

    //  显示load
    smartAUi.prototype.loading = function () {
        return layer.load(1, {
            shade: [0.1, '#000'] //0.1透明度的白色背景
        });
    };

    //  console
    smartAUi.prototype.console = {
        log: function (msg) {
            win.console && win.console.log && win.console.log(msg);
        },
        error: function (msg) {
            win.console && win.console.log && win.console.error(msg);
        },
    };


    //  $.ajax封装
    smartAUi.prototype.ajax = function (o) {
        var loadingIndex;
        var that = this;
        // 是否显示loading层
        if (o.loading) {
            if (this.ajaxLoading) {
                this.console.error("操作正在提交");
                return;
            }
            this.ajaxLoading = true;
            loadingIndex = this.loading();
        }
        var sf = o.success;
        var ef = o.error;
        o.success = function (r) {
            if (loadingIndex) {
                that.ajaxLoading = false;
                loadingIndex && layer.close(loadingIndex);
            }
            sf && sf(r);
        };
        o.error = function (x, t, e) {
            if (loadingIndex) {
                that.ajaxLoading = false;
                loadingIndex && layer.close(loadingIndex);
            }
            ef && ef(x, t, e);
        };
        if (loadingIndex) {
            setTimeout(function () {
                $.ajax(o);
            }, 100);
        } else {
            $.ajax(o);
        }

    };

    /**
     * pagination方法封装
     *
     * @param page 分页对象
     * @param callBack 回调函数
     * @param container 容器(可选)
     */
    smartAUi.prototype.initPage = function (page, callBack, container) {
        !container && (container = $("#pagination"));
        if (page.total != 0) {
            // 创建分页
            container.pagination(page.total, {
                current_page: page.page - 1,//当前页，默认是从0开始
                items_per_page: page.pageSize, //每页显示数目
                num_edge_entries: 1, //边缘页数
                num_display_entries: 4, //主体页数
                prev_show_always: false,
                next_show_always: false,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    //获取列表数据并刷新
                    if ((page.page - 1) != index) {
                        callBack({
                            page: index + 1
                        });
                    }
                }
            });
        }
        return page;
    };

    /**
     * 弹出提示框
     *
     * @param content 内容
     * @param okCallBack 回调
     * @param icon 0:警告，1:正确，2:错误，3:问号，4:锁定，5:苦脸，6:笑脸
     */
    smartAUi.prototype.alert = function (content, okCallBack, icon) {
        if (!icon) {
            icon = 0;
        }
        return layer.alert(content, {icon: icon}, okCallBack);
    };

    /**
     * 确认对话框
     *
     * @param content 内容
     * @param okCallBack 确定按钮回调函数
     * @param icon 0:警告，1:正确，2:错误，3:问号，4:锁定，5:苦脸，6:笑脸
     * @param cancelCallBack

     */
    smartAUi.prototype.confirm = function (content, okCallBack, icon, cancelCallBack) {
        var index;
        typeof (icon) == "undefined" && (icon = 3);
        if (cancelCallBack) {
            index = layer.confirm(content, {icon: icon, title: '提示'}, okCallBack, cancelCallBack);
        } else {
            index = layer.confirm(content, {icon: icon, title: '提示'}, okCallBack);
        }
        return index;
    };

    /**
     * 确认对话框
     *
     * @param content 内容
     * @param okCallBack 确定按钮回调函数
     * @param icon 0:警告，1:正确，2:错误，3:问号，4:锁定，5:苦脸，6:笑脸
     * @param cancelCallBack
     */
    smartAUi.prototype.confirm = function (content, okCallBack, icon, cancelCallBack) {
        var option = {
            icon: typeof (icon) == "undefined" ? 3 : icon,
            title: '提示',
            skin: "SM-theme-green"
        };
        return layer.confirm(content, option, okCallBack, (cancelCallBack || this.fn));
    };

    // 空函数
    smartAUi.prototype.fn = function () {
    };

    /**
     * 弹出窗口
     *
     * @param params
     *          title:窗口标题
     *          width:窗口宽度（默认700）
     *          height:窗口高度（默认500）
     *          template:html模板路径
     *          saveUrl:保存/修改 接口
     *          tableObj:table对象
     *          beforeSubmit:表单提交前执行的方法
     *          submited：表单提交前执行的方法
     *          success:弹出后的成功回调方法
     * @returns {*}

     */
    smartAUi.prototype.dialog = function (params) {
        var that = this;
        var index = null;
        var option = {
            width: 700,// 默认宽度
            height: 500,// 默认高度
            btn: ['确认', '取消'],// 默认按钮名称
            contentType: 'application/x-www-form-urlencoded',
            formId: "dialog_form",
            async: false,
            // skin: $(".layui-layout-admin").attr("data-theme")
            skin: "SM-theme-green"
        };
        params = $.extend(option, params);
        //获取模板
        that.ajax({
            url: that.getTemplatePath(params.template),
            dataType: 'html',
            type: "get",
            async: false,//异步加载
            success: function (html) {
                //打开窗口
                index = layer.open({
                    type: 1,
                    title: params.title,
                    area: [params.width + 'px', params.height + 'px'],
                    content: template.render(html, params.htmlData),
                    btn: params.btn,
                    skin: option.skin,
                    yes: function (index, layero) {
                        if ($.isFunction(params.yes)) {
                            //yse函数
                            return params.yes(index, layero);
                        }
                        if (params.saveUrl) {
                            //注：先注册监听事件：监听提交，验证通过才会执行此方法
                            layui.form.on('submit(' + params.formId + ')', function (data) {
                                var field = data.field || {};
                                if ($.isFunction(params.beforeSubmit)) {
                                    var res = params.beforeSubmit(field);
                                    if (res == false) {
                                        return false;
                                    }
                                    res != true && (field = res);
                                }
                                that.ajax({
                                    url: params.saveUrl,
                                    type: "post",
                                    data: field,
                                    async: params.async,
                                    contentType: params.contentType,
                                    loading: true,
                                    success: function (result) {
                                        if (result.success) {
                                            layer.close(index);
                                            result.msg && layer.msg(result.msg);
                                            //刷新列表
                                            params.tableObj && that.reloadTable(params.tableObj);
                                            //执行完成回调
                                            params.submited && $.isFunction(params.submited) && params.submited(result);
                                        } else {
                                            that.alert(result.msg);
                                        }
                                    }
                                });
                                return false;
                            });

                            //表单验证
                            layui.form.validate(params.formId);
                        }
                    },
                    btn2: function (index, layero) {
                        if ($.isFunction(params.btn2)) {
                            //回调函数
                            params.btn2(index, layero);
                        } else {
                            layer.close(index);
                        }
                    },
                    cancel: function (index, layero) {
                        if ($.isFunction(params.cancel)) {
                            //回调函数
                            params.cancel(index, layero);
                        } else {
                            layer.close(index);
                        }
                    },
                    success: function (layero,index) {
                        if ($.isFunction(params.success)) {
                            //回调函数
                            params.success(index, layero);
                        }
                        layui.form && layui.form.render();
                    },
                    end: function () {
                        if ($.isFunction(params.end)) {
                            //回调函数
                            params.end();
                        }
                    }
                });
            }
        });
    };

    /**
     * 确认对话框
     *
     */
    smartAUi.prototype.showEmpty = function ($ele, str) {
        $ele.html("<p class='nothing'>" + (str ? str : "没有查询到相关数据！") + "</p>");
    };


    /**
     * 渲染模板
     *
     * @param params
     * {
     *  targetId:目标id
     *  template:模板名称(注：不写路径，默认从template文件下查找)
     *  htmlData:数据对象
     *  callBack:回调函数
     * }
     */
    smartAUi.prototype.renderHtml = function (params) {
        var $target = params.targetId instanceof jQuery ? params.targetId : $('#' + params.targetId);
        if ($target.length == 0) {
            window.console && window.console.error("#" + params.targetId + "不存在！");
        }
        //获取模板
        this.ajax({
            loading: params.loading,
            url: this.getTemplatePath(params.template),
            dataType: 'html',
            type: "get",
            success: function (html) {
                //渲染模板
                $target.html(template.render(html, params.htmlData));
                if (params.callBack) {
                    params.callBack();
                }
            }
        });
    };

    smartAUi.prototype.getHtml = function (template, callback) {
        //获取模板
        $.ajax({
            url: this.getTemplatePath(template),
            dataType: 'html',
            type: "get",
            success: function (html) {
                //渲染模板
                callback(html);
            }
        });
    };

    smartAUi.prototype.appendHtml = function (params) {
        var $target = $('#' + params.targetId);
        if ($target.length == 0) {
            window.console && window.console.error("#" + params.targetId + "不存在！");
        }
        //获取模板
        $.ajax({
            url: this.getTemplatePath(params.template),
            dataType: 'html',
            type: "get",
            // async: false,//异步加载
            success: function (html) {
                //渲染模板
                $target.append(template.render(html, params.htmlData));
                if (params.callBack) {
                    params.callBack();
                }
            }
        });
    };


    /**
     * 获取模板完成路径
     *
     * @param template 注：不写路径，默认从template文件下查找
     * @returns {string}
     */
    smartAUi.prototype.getTemplatePath = function (template) {
        if (template.indexOf("/") != 0) {
            var path = location.hash.substring(1, location.hash.lastIndexOf("/") + 1);
            return "/views" + path + "template/" + template + ".html";
        } else {
            return template;
        }
    };

    /**
     * 表格重载
     *
     * @param tableObj render()返回table对象
     * @param form 查询表单id，默认list_form（可不填）

     */
    smartAUi.prototype.reloadTable = function (tableObj, form) {
        if (typeof form == "undefined" || typeof form == "string") {
            tableObj.reload({
                page: {
                    curr: 1
                }
                , where: this.getFormData(form ? form : this.DEFAULT_FORMID)
            });
        } else if (typeof form == "object") {                 //传入参数
            tableObj.reload({
                page: {
                    curr: form.page || 1
                }
                , where: form
            });
        }
    };

    /**
     *  ajax初始化下拉列表，支持select与多选select
     * @param param
     *        param.url     路径
     *        param.field   [值字段，名字段]
     *        param.elem    选择器或jq元素
     *
     *        param.type    选填，默认post
     *        param.before  选填，数据预处理函数
     *        param.callBack  选填，渲染完成回调函数
     *
     *        取data-value为选中值（多选,拼接）
     *        取placeholder为默认提示
     *
     *       示例
     initSelect({
            elem:"#dialog_form select[name=provinceId]",
            url:"/common/getprovince",
            type:"GET",
            field:["provinceId","provinceName"],
        });
     * @author zhaoqf
     */
    smartAUi.prototype.initSelect = function (param) {
        var $elem = param.elem instanceof jQuery ? param.elem : $(param.elem);
        if ($elem.length == 0) {
            return;
        }
        var vdefault = $elem.attr("data-value");
        $elem.removeAttr("data-value");
        var ismultiple = $elem.attr("multiple") != undefined;
        var placeholder = $elem.attr("placeholder");
        placeholder = placeholder ? placeholder : "请选择";
        $.ajax({
            url: param.url,
            type: param.type || "get",
            data: param.data || {},
            success: function (result) {
                if (!result.success || !result.data) {
                    return;
                }
                var data = param.before ? param.before(result.data) : result.data;
                if (ismultiple) {
                    var arr = vdefault == undefined ? [] : vdefault.split(",");
                    $.each(data, function (i, v) {
                        v.value = v[param.field[0]];
                        v.name = v[param.field[1]];
                        v.selected = ifinArray(arr, v.value) ? "selected" : "";
                    })
                } else {
                    $.each(data, function (i, v) {
                        v.value = v[param.field[0]];
                        v.name = v[param.field[1]];
                        v.selected = v.value == vdefault ? "selected" : "";
                    })
                }
                var temp='';
                if(param.placeholder!=false){
                    temp='<option value="">' + placeholder + '</option>';
                }
                temp = temp+ '<% for(var i = 0; i < data.length; i++){ %>';
                temp += '<option value="<%=data[i].value%>" <%=data[i].selected%> ><%=data[i].name%></option><%}%>';
                $elem.html(template.render(temp, {data: data}));
                ismultiple ? (layui.select2 && layui.select2.render()) : (layui.form.render("select"));
                param.callBack && param.callBack();
            }
        })
    }

    /**
     * 获取所有表单域的键值对
     *
     * @param formId
     * @author sunday
     */
    smartAUi.prototype.getFormData = function (formId) {
        var field = [];
        var fieldElem = $('#' + formId).find('input,select,textarea');

        layui.each(fieldElem, function (_, item) {
            if (!item.name) return;
            if (/^checkbox|radio$/.test(item.type) && !item.checked) return;
            field[item.name] = item.value;
        });

        return field;
    };

    /**
     *  ajax初始化checkbox列表
     * @param param
     *        param.url     路径
     *        param.field   [值字段，名字段]
     *        param.name    name
     *        param.elem    容器选择器或jq元素
     *
     *        param.type    选填，默认post
     *        param.before  选填，数据预处理函数
     *        param.callBack  选填，渲染完成回调函数
     *        取data-value为选中值（,拆分）
     *
     *       示例
     initCheckboxList({
            elem: "#courseTagList",
            url: "/tag/list",
            type: "GET",
            field: ["id", "tagName"],
            name:"courseTags"
        });
     *
     * @author zhaoqf
     */
    smartAUi.prototype.initCheckboxList = function (param) {
        var that = this;
        var $elem = param.elem instanceof jQuery ? param.elem : $(param.elem);
        if ($elem.length == 0) {
            return;
        }
        var vdefault = $elem.attr("data-value");
        $elem.removeAttr("data-value");
        $.ajax({
            url: param.url,
            type: param.type || "POST",
            data: param.data || {},
            success: function (result) {
                if (!result.success || !result.data) {
                    return;
                }
                var data = param.before ? param.before(result.data) : result.data;
                var arr = vdefault == undefined ? [] : vdefault.split(",");
                $.each(data, function (i, v) {
                    v.value = v[param.field[0]];
                    v.title = v[param.field[1]];
                    v.checked = that.indexOfArray(arr, v.value) > -1 ? "checked" : "";
                });

                var temp = '<% for(var i = 0; i < data.length; i++){ %>';
                temp += '<input type="checkbox" name="<%=name%>" <%=data[i].checked%>  value="<%=data[i].value%>" title=<%=data[i].title%> lay-skin="primary">';
                temp += '<%}%>';
                $elem.html(template.render(temp, {data: data, name: param.name}));
                layui.form.render("checkbox");
                param.callBack && param.callBack();
            }
        })
    };

    /**
     * 初始化或更新ztree,
     * 1、打开根节点及上次选中节点
     * 2、自动选中根节点或上次选中节点
     * 划重点：hashchange里的$.fn.zTree.destroy()
     */
    smartAUi.prototype.initZtree = function (treeid, setting, data) {
        var treeObj = $.fn.zTree.getZTreeObj(treeid);
        var selectdNode = [];
        var isFirstInit = true;
        if (treeObj) {
            isFirstInit = false;
            selectdNode = treeObj.getSelectedNodes();
        }
        treeObj = $.fn.zTree.init($("#" + treeid), setting, data);
        var rootNode = treeObj.getNodeByParam("level", "0", null);
        rootNode && treeObj.expandNode(rootNode, true, false, true);
        var selectd = false;
        if (selectdNode.length > 0) {
            $.each(selectdNode, function (_, v) {
                var node = treeObj.getNodeByParam("id", v.id, null);
                if (node) {
                    treeObj.selectNode(node, true);
                    selectd = true;
                    // 手动触发点击回调用于刷新表格等数据
                    $("#" + node.tId + "_a").trigger("click");
                    // setting.callback
                    // && setting.callback.onClick
                    // && setting.callback.onClick({}, treeid, node);
                }
            });
        }
        if (!selectd && rootNode) {
            treeObj.selectNode(rootNode, true);
            !isFirstInit && $("#" + rootNode.tId + "_a").trigger("click");
            // && setting.callback
            // && setting.callback.onClick
            // && setting.callback.onClick({}, treeid, node);
        }
        return treeObj;
    };


    smartAUi.prototype.fullscreen = function (open) {
        var element = document.documentElement;
        if (open) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };
    /**
     * 异步加载js文件,
     * 已存在不会重新加载,顺序加载
     *
     * @param src           string或array
     * @param callback      回调函数
     */
    smartAUi.prototype.loadJs = function (src, callback) {
        var that = this;
        if (typeof src == "string") {
            src = [src];
        }

        var jsarr = [], scriptArr = document.getElementsByTagName("script");
        for (var i = 0; i < scriptArr.length; i++) {
            jsarr.push(scriptArr[i].src);
        }
        function load() {
            if (src.length > 0) {
                var link = src.shift();
                if (that.indexOfArray(jsarr, link) > -1) {
                    return load();
                }
                var head = document.getElementsByTagName('head')[0];
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = link;
                script.onload = load;
                head.appendChild(script);
            } else {
                typeof callback == "function" && callback();
            }
        }

        load();
    };


    /**
     * 执行js文件,不产生script标签
     *
     * @param src           string或array
     * @param callback      回调函数
     */
    smartAUi.prototype.executeJs = function (src, callback) {
        var that = this;
        if (typeof src == "string") {
            src = [src];
        }
        if (src.length > 0) {
            var url = src.shift();
            $.ajax({
                type: 'get',
                url: url,
                dataType: 'script',
                success: function () {
                    if (src.length = 0) {
                        callback && callback();
                    } else {
                        that.executeJs(src, callback);
                    }
                }
            });
        }
    };

    /**
     * 异步加载css文件,
     * 已存在不会重新加载,顺序加载
     * @param src           string或array
     * @param callback      回调函数
     */
    smartAUi.prototype.loadCss = function (href, callback) {
        var that = this;
        if (typeof href == "string") {
            href = [href];
        }
        var cssarr = [], linkArr = document.getElementsByName("link");
        for (var i = 0; i < linkArr.length; i++) {
            cssarr.push(linkArr[i].href);
        }
        function load() {
            if (href.length > 0) {
                var url = href.shift();
                if (that.indexOfArray(cssarr, url) > -1) {
                    return load();
                }
                var head = document.getElementsByTagName('head')[0];
                var link = document.createElement('link');
                link.rel = "stylesheet";
                link.type = "text/css";
                link.href = url;
                link.onload = load;
                head.appendChild(link);
            } else {
                typeof callback == "function" && callback();
            }
        }

        load();
    };

    /**
     * 获取url中的参数
     *
     * @param name
     * @returns {*}
     */
    smartAUi.prototype.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null; //返回参数值
    };

    /**
     * 获取id下所有表单元素的键值对
     *
     * @param formId

     */

    smartAUi.prototype.getFormData = function (formId) {
        var field = [];
        var fieldElem = $('#' + formId).find('input,select,textarea');
        $.each(fieldElem, function (_, item) {
            if (!item.name) return;
            if (/^checkbox|radio$/.test(item.type) && !item.checked) return;
            field[item.name] = $(item).val();
        });
        return field;
    };

    /**
     * 获取值在数组中下标
     *
     *
     * @param arr
     * @param v
     */
    smartAUi.prototype.indexOfArray = function (arr, v) {
        if (!Array.isArray(arr)) {
            return -1;
        }
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == v) {
                return i
            }
        }
        return -1;
    };

    /**
     * 删除数组中指定值
     *
     * @param arr
     * @param v
     */
    smartAUi.prototype.removeFromArray = function (arr, v) {
        var index = this.indexOfArray(arr, v);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr;
    };

    /**
     * push非重复值
     *
     * @param arr
     * @param v
     */
    smartAUi.prototype.pushArray2 = function (arr, v) {
        if (this.indexOfArray(arr, v) == -1) {
            arr.push(v);
        }
        return arr;
    };
    /**
     * push非重复值
     *
     * @param arr
     * @param v
     */
    smartAUi.prototype.getCookie = function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

        if (arr = document.cookie.match(reg))

            return unescape(arr[2]);
        else
            return null;
    };


    win.smartAui = new smartAUi();
}(window);

layui.config({
    base: '/js/plugin/layui/lay/extend/'
}).extend({
    treeGrid: 'treeGrid'
});

