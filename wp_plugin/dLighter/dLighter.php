<?php
/*
Plugin Name: dLighter Syntax Highlight
Plugin URI: http://xiaoge.me/dlighter
Description: dLighter provides syntax highlighting. Wrap code blocks with &lt;pre&gt;&lt;pre&gt; tag. <a href='options-general.php?page=dLighter-admin.php'>Settings</a>
Version: 1.0.0
Author: XiaoGe
Author URI: http://xiaoge.me
Text Domain: dLighter
Domain Path: /lang
*/
function load_dLighter_lang(){
    $currentLocale = get_locale();
    if(!empty($currentLocale)) {
        $moFile = dirname(__FILE__) . "/dLighter-" . $currentLocale . ".mo";
        if(@file_exists($moFile) && is_readable($moFile)) load_textdomain('dLighter', $moFile);
    }
}
add_filter('init','load_dLighter_lang');

function plugin_settings_link($links){
    $settings_link = '<a href="options-general.php?page=dLighter-admin.php">Settings</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter("plugin_action_links_".plugin_basename(__FILE__), 'plugin_settings_link');

function dLighter_head(){
    $css_url = plugins_url('dlighter.min.css', __FILE__);
    $js_url = plugins_url("dlighter.js", __FILE__);
    echo '<link rel="stylesheet" type="text/css" href="'.$css_url.'"/>' . '\n';
    echo '<script type="text/javascript" src="'.$js_url.'"></script>'.'\n';
}
add_action("wp_head",'dLighter_head');

function dLighter_onload(){
?>
    <script type="text/javascript">
        dLighter.config.theme = "<?php echo get_option("dLighter_theme");?>";
        dLighter.config.break_line = <?php echo get_option("dLighter_break_line") === 'yes' ? 'true' : 'false';?>;
        dLighter.config.show_line_number = <?php echo get_option("dLighter_show_line_number") === 'yes' ? 'true' : 'false';?>;
        dLighter.go();
    </script>
<?php
}
add_action('get_footer','dLighter_onload');

function dLighter_activate(){
    add_option('dLighter_theme','dLighter');
    add_option('dLighter_show_line_number','yes');
    add_option('dLighter_break_line','yes');
}
register_activation_hook( __FILE__, 'dLighter_activate' );

function dLighter_plugin_menu() {
   
    add_options_page ( 'dLighter Settings', "dLighter Highlight", 'manage_options', 'dLighter-admin', 'dLighter_options' );

}

function dLighter_options() {
    if (! current_user_can ( 'manage_options' )) {
        wp_die ( __ ( 'You do not have sufficient permissions to access this page.' ) );
    }
    include_once dirname ( __FILE__ ) . "/dLighter-admin.php";
}

if(is_admin()){
    add_action('admin_menu', 'dLighter_plugin_menu');
}