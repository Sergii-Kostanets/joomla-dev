<?php

/**
 * @package [PACKAGE_NAME]
 *
 * @author [AUTHOR] <[AUTHOR_EMAIL]>
 * @copyright [COPYRIGHT]
 * @license GNU General Public License version 2 or later; see LICENSE.txt
 * @link [AUTHOR_URL]
 */

// No direct access to this file
defined('_JEXEC') or die;

use Joomla\CMS\Helper\ModuleHelper;
use Joomla\Module\Hello\Site\Helper\HelloHelper;

$test = HelloHelper::getText();

require ModuleHelper::getLayoutPath('mod_hello', $params->get('layout', 'default'));