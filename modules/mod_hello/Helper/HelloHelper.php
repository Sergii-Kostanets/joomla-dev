<?php

/**
 * @package Joomla.Site
 * @subpackage mod_hello
 *
 * @copyright Copyright (C) 2005 - 2019 Open Source Matters, Inc. All rights reserved.
 * @license GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Module\Hello\Site\Helper;

// No direct access to this file
defined('_JEXEC') or die;

class HelloHelper
{
    public static function getText()
    {
        return 'Foo Helper test';
    }
}