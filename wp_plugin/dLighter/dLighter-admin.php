<div class="wrap">
    <?php screen_icon(); ?>
    <h2>dLighter Syntax Highlight for WordPress</h2>

    <form action="options.php" method="post" enctype="multipart/form-data" name="dLighter_form">
        <?php wp_nonce_field('update-options'); ?>

        <table class="form-table">
            <tr valign="top">
                <th scope="row">
                    <?php echo _e("Default Theme", "dLighter");?>
                </th>
                <td>
                    <label>
                        <input name="dLighter_theme" type="radio" value="dLighter"<?php if (get_option('dLighter_theme') == 'dLighter') { ?> checked="checked"<?php } ?> />
                        dLighter
                    </label>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">
                    <?php echo _e("Show Line Number","dLighter");?>
                </th>
                <td>
                    <label>
                        <input name="dLighter_show_line_number" type="radio" value="yes"<?php if (get_option('dLighter_show_line_number') == 'yes') { ?> checked="checked"<?php } ?> />
                        <?php echo _e("Yes","dLighter");?>
                    </label>
                    <label>
                        <input name="dLighter_show_line_number" type="radio" value="no"<?php if (get_option('dLighter_show_line_number') == 'no') { ?> checked="checked"<?php } ?> />
                        <?php echo _e("No","dLighter");?>
                    </label>
                </td>
            </tr>
            <tr valign="top">
                <th scope="row">
                    <?php echo _e("Break Line","dLighter");?>
                </th>
                <td>
                    <label>
                        <input name="dLighter_break_line" type="radio" value="yes"<?php if (get_option('dLighter_break_line') == 'yes') { ?> checked="checked"<?php } ?> />
                        <?php echo _e("Yes","dLighter");?>
                    </label>
                    <label>
                        <input name="dLighter_break_line" type="radio" value="no"<?php if (get_option('dLighter_break_line') == 'no') { ?> checked="checked"<?php } ?> />
                        <?php echo _e("No","dLighter");?>
                    </label>
                </td>
            </tr>
        </table>


        <p class="submit">
            <input type="submit" class="button-primary" name="Submit" value="保存设置" />
        </p>

    </form>

    <h3><?php echo _e("Usage","dLighter");?></h3>
    1.<?php echo _e("<b>Notice!</b>dLighter Syntax Highlight only supports browser whitch has html5 <code>Canvas</code> element. That is, dLighter dosenot work on IE8 and less.","dLighter");?><br/>
    2.通过&lt;pre&gt;和&lt;/pre&gt;标签来包围需要高亮的代码。<br/>
    3.可以在pre标签中使用如下参数：<br/>
    &nbsp;&nbsp;a) <code>lang</code> 必选参数，指定代码语言。如lang="js", lang="c", lang="c#".等等<br/>
    &nbsp;&nbsp;b) <code>break_line</code> 可选参数，指定是否自动换行。默认为true。<br/>
    <!-- todo  这里还需要完善使用说明-->
    4.更多参数的详细说明和使用，请参考<a href="https://xiaoge.me/dlighter" target="_blank">插件的主页</a>。<br/>

    <h3><?php echo _e("Example","dLighter");?></h3>
    &lt;pre lang="js" break_line="false"&gt;<br/>
    &nbsp;(function(){<br/>
    &nbsp;&nbsp;&nbsp;&nbsp;alert("I love you.");<br/>
    &nbsp;})();<br/>
    &lt;/pre&gt;

    <h3><?php echo _e("More","dLighter");?></h3>
    <p><?php echo _e("dLighter is a code syntax highlighter based on html5. For more infomation, please see <a href='http://xiaoge.me/dlighter' target='_blank'>dLighter's Homepage</a>. Also, dLighter is a open source project base on Apache Licence 2.0. You can view dLighter's <a href='https://github.com/YuhangGe/dLighter.git' target='_blank'>source at GitHub</a>.", "dLighter");?></p>

    <?php $donate_url = plugins_url('/img/paypal_32_32.jpg', __FILE__);?>
    <?php $paypal_donate_url = plugins_url('/img/btn_donateCC_LG.gif', __FILE__);?>
    <?php $ali_donate_url = plugins_url('/img/alipay_donate.png', __FILE__);?>
    <div class="icon32"><img src="<?php echo $donate_url; ?>" alt="Donate" /></div>
    <h2><?php echo _e("Donate","dLighter");?></h2>
    <p>
        <?php echo _e("If you find my work useful and you want to encourage the development of more free resources, you can do it by donating.", "dLighter");?>

    </p>
    <p>
<!--    <form name="_donations" action="https://www.paypal.com/cgi-bin/webscr" method="post">-->
<!--        <input type="hidden" name="cmd" value="_donations">-->
<!--        <input type="hidden" name="business" value="abeyuhang@gmail.com">-->
<!--        <input type="hidden" name="item_name" value="--><?php //echo _e("Donate for dLighter Syntax Highlight", "dLighter");?><!--">-->
<!--        <input type="hidden" name="currency_code" value="USD">-->
<!--        <input type="hidden" name="charset" value="UTF-8">-->
<!--        <input type="image" src="--><?php //echo $paypal_donate_url;?><!--" border="0" name="submit" alt="">-->
<!--    </form>-->
<!---->

        <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=abeyuhang@gmail.com&item_name=<?php echo _e("Donate for dLighter Syntax Highlight", "dLighter");?>&currency_code=USD&charset=UTF-8" target="_blank"><img src="<?php echo $paypal_donate_url; ?>" alt="Paypal Donate" title="Paypal" /></a>
        &nbsp;<?php echo _e("or", "dLighter");?>&nbsp;
        <a href="https://me.alipay.com/abraham" target="_blank"><img src="<?php echo $ali_donate_url; ?>" alt="Alipay Donate" title="Alipay" /></a>
    </p>
    <br />


    <div style="text-align:right; margin:60px 0 10px 0;">&copy; <?php echo date("Y"); ?> <a href="<?php echo _e("http://xiaoge.me","dLighter");?>" target="_blank"><?php echo _e("XiaoGe","dLighter");?></a></div>
</div>
