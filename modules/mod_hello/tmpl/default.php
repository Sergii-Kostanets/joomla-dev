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

echo "Sergii's " . $test . " 1";

$domain = $params->get('domain', 'https://www.joomla.org');
?>

<br>

<a href="/<?php echo $domain; ?>">
    <?php echo "Sergii's " . $test . " 2"; ?>
</a>

<br>

<a href="<?php echo $domain; ?>">
    <?php echo "Sergii's " . $test . " 3"; ?>
</a>