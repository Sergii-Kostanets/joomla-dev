<?php
/**
* @file
* @brief    sigplus Image Gallery Plus plug-in for Joomla
* @author   Levente Hunyadi
* @version  1.5.0
* @remarks  Copyright (C) 2009-2014 Levente Hunyadi
* @remarks  Licensed under GNU/GPLv3, see https://www.gnu.org/licenses/gpl-3.0.html
* @see      https://hunyadi.info.hu/projects/sigplus
*/

/*
* sigplus Image Gallery Plus plug-in for Joomla
* Copyright 2009-2014 Levente Hunyadi
*
* sigplus is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* sigplus is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// no direct access
defined( '_JEXEC' ) or die( 'Restricted access' );

if (!defined('SIGPLUS_PLUGIN_FOLDER')) {
	define('SIGPLUS_PLUGIN_FOLDER', 'sigplus');
}
if (!defined('SIGPLUS_MEDIA_FOLDER')) {
	define('SIGPLUS_MEDIA_FOLDER', 'sigplus');
}

jimport('joomla.plugin.plugin');
jimport('joomla.form.form');
jimport('joomla.html.parameter');

/**
* Triggered when the sigplus content plug-in is unavailable or there is a version mismatch.
*/
class SigPlusNovoEditorDependencyException extends Exception {
	/**
	* Creates a new exception instance.
	* @param {string} $key Error message language key.
	*/
	public function __construct() {
		$key = 'SIGPLUS_EXCEPTION_EXTENSION';
		$message = '['.$key.'] '.JText::_($key);  // get localized message text
		parent::__construct($message);
	}
}

/**
* Editor button for sigplus.
*/
class plgButtonSigPlusNovo extends JPlugin {
	protected $autoloadLanguage = true;

	private function importTemplateCSS($css_file) {
		$app = JFactory::getApplication();
		$css_base_path = JPATH_BASE.DIRECTORY_SEPARATOR.'templates'.DIRECTORY_SEPARATOR.$app->getTemplate().DIRECTORY_SEPARATOR.'css';
		$css_file_path = $css_base_path.DIRECTORY_SEPARATOR.$css_file;
		$css_min_file = pathinfo($css_file, PATHINFO_FILENAME).'.min.'.pathinfo($css_file, PATHINFO_EXTENSION);
		$css_min_file_path = $css_base_path.DIRECTORY_SEPARATOR.$css_min_file;
		if (file_exists($css_min_file_path) || file_exists($css_file_path)) {
			if (file_exists($css_min_file_path)) {
				$css_imported_file = $css_min_file;
			} else {
				$css_imported_file = $css_file;
			}
			print '<link rel="stylesheet" href="'.JURI::base(true).'/templates/'.$app->getTemplate().'/css/'.$css_imported_file.'" type="text/css" />'.PHP_EOL;
		}
	}

	private function getResourceURL($base_dir, $relative_path) {
		$relative_dir = pathinfo($relative_path, PATHINFO_DIRNAME);
		$absolute_dir = realpath($base_dir.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $relative_dir));

		$filename = pathinfo($relative_path, PATHINFO_FILENAME);
		$extension = pathinfo($relative_path, PATHINFO_EXTENSION);
		$original_name = $filename.'.'.$extension;
		$minified_name = $filename.'.min.'.$extension;
		$original_path = $absolute_dir.DIRECTORY_SEPARATOR.$original_name;
		$minified_path = $absolute_dir.DIRECTORY_SEPARATOR.$minified_name;
		if (!file_exists($original_path) || file_exists($minified_path) && filemtime($minified_path) >= filemtime($original_path)) {
			$resource_name = $minified_name;
		} else {
			$resource_name = $original_name;
		}

		$resource_path = $absolute_dir.DIRECTORY_SEPARATOR.$resource_name;
		if (file_exists($resource_path)) {
			$resource_hash = md5_file($resource_path);
			$resource_query = "v={$resource_hash}";
		} else {
			$resource_query = '';
		}
		return "{$relative_dir}/{$resource_name}?{$resource_query}";
	}

	/**
	* Displays the editor button.
	*/
	public function onDisplay($editorname, $asset, $author) {
		$app = JFactory::getApplication();
		$user = JFactory::getUser();
		$extension = $app->input->get('option');

		// check the extension for categories (e.g. "component.section")
		if ($extension === 'com_categories') {
			$parts = explode('.', $app->input->get('extension', 'com_content'));
			$extension = $parts[0];
		}

		$asset = $asset !== '' ? $asset : $extension;

		if (!$user->authorise('core.edit', $asset) &&
			!$user->authorise('core.create', $asset) &&
			!(count($user->getAuthorisedCategories($asset, 'core.create')) > 0) &&
			!($user->authorise('core.edit.own', $asset) && $author === $user->id) &&
			!(count($user->getAuthorisedCategories($extension, 'core.edit')) > 0) &&
			!(count($user->getAuthorisedCategories($extension, 'core.edit.own')) > 0 && $author === $user->id)) {
				return false;
		}

		try {
			// load sigplus content plug-in
			if (!JPluginHelper::importPlugin('content', SIGPLUS_PLUGIN_FOLDER)) {
				throw new SigPlusNovoEditorDependencyException();
			}

			// load sigplus content plug-in parameters
			$plugin = JPluginHelper::getPlugin('content', SIGPLUS_PLUGIN_FOLDER);

			// load language file for internationalized labels
			$lang = JFactory::getLanguage();
			$lang->load('plg_content_'.SIGPLUS_PLUGIN_FOLDER, JPATH_ADMINISTRATOR);

			$xmlfile = JPATH_ROOT.DIRECTORY_SEPARATOR.'plugins'.DIRECTORY_SEPARATOR.'content'.DIRECTORY_SEPARATOR.SIGPLUS_PLUGIN_FOLDER.DIRECTORY_SEPARATOR.SIGPLUS_PLUGIN_FOLDER.'.xml';
			$htmldir = JPATH_ROOT.DIRECTORY_SEPARATOR.'media'.DIRECTORY_SEPARATOR.'plg_button_'.SIGPLUS_PLUGIN_FOLDER.DIRECTORY_SEPARATOR.'html';
			$htmlfile = $htmldir.DIRECTORY_SEPARATOR.'button.'.$lang->getTag().'.html';

			// check for existence of content plug-in XML configuration file
			if (!file_exists($xmlfile)) {
				throw new SigPlusNovoAccessException($xmlfile);
			}

			// regenerate dialog form if content plug-in has been upgraded
			if (!file_exists($htmlfile) || !(filemtime($htmlfile) >= filemtime($xmlfile))) {
				// load configuration XML file
				$form = new JForm(SIGPLUS_PLUGIN_FOLDER);
				$form->loadFile($xmlfile, true, '/extension/config/fields');
				$fieldSets = $form->getFieldsets('params');

				// get permissible gallery parameters
				$vars = get_class_vars('SigPlusNovoGalleryParameters');

				ob_start();
				print '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'.PHP_EOL;
				print '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="'.$lang->getTag().'" lang="'.$lang->getTag().'">'.PHP_EOL;
				print '<head>'.PHP_EOL;
				print '<meta http-equiv="content-type" content="text/html; charset=utf-8" />'.PHP_EOL;

				// import administration area template CSS file
				$this->importTemplateCSS('bootstrap.css');
				$this->importTemplateCSS('template.css');

				print '<link rel="stylesheet" href="'.$this->getResourceURL($htmldir, '../css/button.css').'" type="text/css" />'.PHP_EOL;
				print '<script type="text/javascript" src="'.$this->getResourceURL($htmldir, '../js/button.js').'"></script>'.PHP_EOL;
				print '</head>'.PHP_EOL;
				print '<body>'.PHP_EOL;
				print '<form id="sigplus-settings-form">'.PHP_EOL;
				print '<button id="sigplus-settings-submit" class="btn btn-primary" type="button">'.JText::_('SIGPLUS_EDITORBUTTON_INSERT').'</button>'.PHP_EOL;
				foreach ($fieldSets as $name => $fieldSet) {
					$fields = $form->getFieldset($name);

					$hasfields = false;
					foreach ($fields as $field) {
						if (isset($vars[$field->fieldname])) {
							$hasfields = true;
							break;
						}
					}
					if (!$hasfields) {
						continue;
					}

					// field group title
					$label = !empty($fieldSet->label) ? $fieldSet->label : 'COM_PLUGINS_'.$name.'_FIELDSET_LABEL';
					print '<h3>'.JText::_($label).'</h3>';
					if (isset($fieldSet->description) && trim($fieldSet->description)) {
						print '<p class="tip">'.$this->escape(JText::_($fieldSet->description)).'</p>';
					}

					// field group elements
					print '<fieldset class="panelform">'.PHP_EOL;
					$hidden_fields = '';
					print '<ul>'.PHP_EOL;
					foreach ($fields as $field) {
						if (!isset($vars[$field->fieldname])) {
							continue;
						}
						if (!$field->hidden) {
							print '<li class="formelm">';
							print $field->label;
							print $field->input;
							print '</li>'.PHP_EOL;
						} else {
							$hidden_fields .= $field->input;
						}
					}
					print '</ul>'.PHP_EOL;
					print $hidden_fields;
					print '</fieldset>'.PHP_EOL;
				}
				print '</form>'.PHP_EOL;
				print '<p>'.JText::_('SIGPLUS_EDITORBUTTON_DOCUMENTATION').'</p>'.PHP_EOL;
				print '</body>'.PHP_EOL;
				print '</html>'.PHP_EOL;
				$html = ob_get_clean();
				if (file_put_contents($htmlfile, $html) === false) {
					throw new SigPlusNovoAccessException($htmlfile);
				}
			}

			// hide configuration parameters that cannot be set in the modal window to avoid information leakage
			$params = json_decode($plugin->params);
			unset($params->base_folder);
			unset($params->base_url);
			unset($params->cache_image);
			unset($params->library_image);
			unset($params->debug_client);
			unset($params->debug_server);
			unset($params->clean_database);

			// allow modal window script to access default parameter values
			$doc = JFactory::getDocument();
			$doc->addScriptDeclaration('window.sigplus = '.json_encode($params).';');

			// add modal window
			if (version_compare(JVERSION, '4.0') < 0) {
				JHTML::_('behavior.modal');
			}
			$button = new JObject;
			$button->class = 'btn btn-secondary';
			$button->modal = true;
			$app = JFactory::getApplication();
			if ($app->getName() == 'administrator') {
				$root = '../';  // Joomla expects a relative path, leave site folder "administrator"
			} else {
				$root = '';
			}
			$button->link = $root.'media/plg_button_'.SIGPLUS_PLUGIN_FOLDER.'/html/button.php?lang='.$lang->getTag().'&editor='.urlencode($editorname);
			$button->text = 'sigplus';
			if (version_compare(JVERSION, '4.0') >= 0) {
				$button->name = 'sigplus';
				$button->iconSVG = '<svg viewBox="0 0 32 32" width="24" height="24"><path d="M4 8v20h28v-20h-28zM30 24.667l-4-6.667-4.533 3.778-3.46'
					. '7-5.778-12 10v-16h24v14.667zM8 15c0-1.657 1.343-3 3-3s3 1.343 3 3v0c0 1.657-1.343 3-3 3s-3-1.343-3-3v0zM28 4h-'
					. '28v20h2v-18h26z"></path></svg>';
			} else {  // Joomla 3.x
				$button->name = 'picture';
			}
			if (version_compare(JVERSION, '4.0') >= 0) {
				$button->options = array(
					'width' => '500px',
					'height' => '400px'
				);
			} else {  // Joomla 3.x
				$button->options = "{handler: 'iframe', size: {x: 500, y: 400}}";  // must use single quotes in JSON options string
			}
			return $button;
		} catch (Exception $e) {
			$app = JFactory::getApplication();
			$app->enqueueMessage($e->getMessage(), 'error');
		}
		return false;
	}
}

class plgButtonSIGPlus extends plgButtonSigPlusNovo {

}
