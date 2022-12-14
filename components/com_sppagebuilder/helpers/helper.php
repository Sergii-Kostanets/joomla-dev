<?php
/**
 * @package SP Page Builder
 * @author JoomShaper http://www.joomshaper.com
 * @copyright Copyright (c) 2010 - 2022 JoomShaper
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
//no direct accees
defined ('_JEXEC') or die ('restricted aceess');

use Joomla\CMS\Factory;
use Joomla\CMS\Uri\Uri;

class SppagebuilderHelperSite {

	public static function loadLanguage() {
        $lang = Factory::getLanguage();

		$app = Factory::getApplication();
		$template = $app->getTemplate();

        // Load component language
        $lang->load('com_sppagebuilder', JPATH_ADMINISTRATOR, null, true);

        // Load template language file
        $lang->load('tpl_' . $template, JPATH_SITE, null, true);

        require_once JPATH_ROOT .'/administrator/components/com_sppagebuilder/helpers/language.php';
	}

	public static function getPaddingMargin($main_value, $type){
		$css = '';
		$pos = array( 'top', 'right', 'bottom', 'left' );
		if(trim($main_value) != ""){
				$values = explode(' ',  $main_value);
				foreach($values as $key => $value){
						if(!empty(trim($value))){
								$css .= $type.'-'.$pos[$key].': '.$value.';';
						}
				}
		}

		return $css;
	}

	public static function addScript( $script, $client = 'site', $version = false)
	{
		$doc = Factory::getDocument();

		$script_url = Uri::base(true) . ($client == 'admin' ? '/administrator' : '') . '/components/com_sppagebuilder/assets/js/'. $script;
		if($version)
		{
			$script_url .= '?' . self::getVersion(true);
		}
		$doc->addScript($script_url);
	}

	public static function addStylesheet( $stylesheet, $client = 'site', $version = false)
	{
		$doc = Factory::getDocument();

		$stylesheet_url = Uri::base(true) . ($client == 'admin' ? '/administrator' : '') . '/components/com_sppagebuilder/assets/css/'. $stylesheet;
		if($version)
		{
			$stylesheet_url .= '?' . self::getVersion(true);
		}
		$doc->addStylesheet($stylesheet_url);
	}

	public static function getVersion($md5 = false) {
		$db = Factory::getDbo();
		$query = $db->getQuery(true)
		->select('e.manifest_cache')
		->select($db->quoteName('e.manifest_cache'))
		->from($db->quoteName('#__extensions', 'e'))
		->where($db->quoteName('e.element') . ' = ' . $db->quote('com_sppagebuilder'));

		$db->setQuery($query);
		$manifest_cache = json_decode($db->loadResult());

		if(isset($manifest_cache->version) && $manifest_cache->version)
		{
			
			if($md5)
			{
				return md5($manifest_cache->version);
			}

			return $manifest_cache->version;
		}

		return '1.0';
	}
}
