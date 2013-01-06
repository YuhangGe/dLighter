<div class="wrap">
    <?php screen_icon(); ?>
    <h2>dLighter Syntax Highlight for WordPress</h2>

    <form action="options.php" method="post" enctype="multipart/form-data" name="dLighter_form">
        <?php wp_nonce_field('update-options'); ?>

        <table class="form-table">
            <tr valign="top">
                <th>
                    字体选择
                </th>
                <td>

                </td>
            </tr>
            <tr valign="top">
                <th scope="row">
                    默认主题
                </th>
                <td>
                    <label>
                        <input name="dLighter_theme" type="radio" value="dLighter"<?php if (get_option('dLighter-theme') == 'dLighter') { ?> checked="checked"<?php } ?> />
                        dLighter
                    </label>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">
                    显示行号
                </th>
                <td>
                    <label>
                        <input name="dLighter_show_line_number" type="radio" value="yes"<?php if (get_option('dLighter_show_line_number') == 'yes') { ?> checked="checked"<?php } ?> />
                        是
                    </label>
                    <label>
                        <input name="dLighter_show_line_number" type="radio" value="no"<?php if (get_option('dLighter_show_line_number') == 'no') { ?> checked="checked"<?php } ?> />
                        否
                    </label>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">
                    自动换行
                </th>
                <td>
                    <label>
                        <input name="dLighter_break_line" type="radio" value="yes"<?php if (get_option('dLighter_break_line') == 'yes') { ?> checked="checked"<?php } ?> />
                        是
                    </label>
                    <label>
                        <input name="dLighter_break_line" type="radio" value="no"<?php if (get_option('dLighter_break_line') == 'no') { ?> checked="checked"<?php } ?> />
                        否
                    </label>
                </td>
            </tr>
        </table>


        <p class="submit">
            <input type="submit" class="button-primary" name="Submit" value="保存设置" />
        </p>

    </form>

    <h3>使用方法</h3>
    1.请注意本插件不支持ie8以下的浏览器。
    2.通过&lt;pre&gt;和&lt;/pre&gt;标签来包围需要高亮的代码。
    3.可以在pre标签中使用如下参数：
    &nbsp;&nbsp;a.lang 必选参数，指定代码语言。如lang="js",lang="c",lang="c#".等等
    &nbsp;&nbsp;b.break_line 可选参数，指定是否自动换行。默认为true。
    <!-- todo  这里还需要完善使用说明-->
    4.更多参数的详细说明和使用，请参考下文中的插件主页链接。

    <h3>使用示例</h3>
    <code>&lt;pre lang="js" break_line="false"&gt;</code><br/>
    &nbsp;(function(){<br/>
    &nbsp;&nbsp;alert("I love you.");<br/>
    &nbsp;})();<br/>
    <code>&lt;/pre&gt;</code>

    <h3>其它说明</h3>
    <p>dLighter Syntax Highlight for WordPress是全新的WordPress代码高亮插件，它以dLighter代码高亮库为核心。
       dLighter是基于html5的代码高亮库，支持各种主流程序语言，各种颜色主题。
       更多使用方法和配置，请参考<a href="http://xiaoge.me/dlighter" target="_blank">dLighter的主页</a>。
       你还可以访问dLighter在<a href="https://github.com/YuhangGe/dLighter.git" target="_blank">GitHub上的源代码主页</a>。</p>

    <?php $donate_url = plugins_url('/img/paypal_32_32.jpg', __FILE__);?>
    <?php $paypal_donate_url = plugins_url('/img/btn_donateCC_LG.gif', __FILE__);?>
    <?php $ali_donate_url = plugins_url('/img/alipay_donate.png', __FILE__);?>
    <div class="icon32"><img src="<?php echo $donate_url; ?>" alt="Donate" /></div>
    <h2>捐赠</h2>
    <p>
        目前dLighter代码高亮库以及以它为基础的WordPress插件都还在开发完善中。
        如果您认可这个项目并希望为其发展做出贡献，欢迎您通过PayPal或者支付宝进行捐赠。
    </p>
    <p>
        <a href="" target="_blank"><img src="<?php echo $paypal_donate_url; ?>" alt="Paypal Donate" title="Paypal" /></a>
        &nbsp;
        <a href="https://me.alipay.com/abraham" target="_blank"><img src="<?php echo $ali_donate_url; ?>" alt="Alipay Donate" title="Alipay" /></a>
    </p>
    <br />


    <div style="text-align:center; margin:60px 0 10px 0;">&copy; <?php echo date("Y"); ?> <a href="http://weibo.com/abeyuhang">白羊座小葛</a></div>
</div>
