<?php
/**
 * @package RSContact!
 * @copyright (C) 2015 www.rsjoomla.com
 * @license GPL, http://www.gnu.org/licenses/gpl-3.0.html
 */

defined('_JEXEC') or die('Restricted access');

JText::script('MOD_RSCONTACT_SALUTATION_ERROR');
JText::script('MOD_RSCONTACT_FIRST_NAME_ERROR');
JText::script('MOD_RSCONTACT_LAST_NAME_ERROR');
JText::script('MOD_RSCONTACT_FULL_NAME_ERROR');
JText::script('MOD_RSCONTACT_EMAIL_ERROR');
JText::script('MOD_RSCONTACT_ADDRESS_1_ERROR');
JText::script('MOD_RSCONTACT_ADDRESS_2_ERROR');
JText::script('MOD_RSCONTACT_CITY_ERROR');
JText::script('MOD_RSCONTACT_STATE_ERROR');
JText::script('MOD_RSCONTACT_ZIP_ERROR');
JText::script('MOD_RSCONTACT_ZIP_NOT_A_ALPHANUMERIC_ERROR');
JText::script('MOD_RSCONTACT_HOME_PHONE_ERROR');
JText::script('MOD_RSCONTACT_MOBILE_PHONE_ERROR');
JText::script('MOD_RSCONTACT_WORK_PHONE_ERROR');
JText::script('MOD_RSCONTACT_PHONE_NOT_A_NUMBER_ERROR');
JText::script('MOD_RSCONTACT_COMPANY_ERROR');
JText::script('MOD_RSCONTACT_WEBSITE_ERROR');
JText::script('MOD_RSCONTACT_SUBJECT_ERROR');
JText::script('MOD_RSCONTACT_MESSAGE_ERROR');
JText::script('MOD_RSCONTACT_CHARACTERS_LEFT');

class modRSContactHelper
{
	static $states = array(
		'AK' => 'Alaska',
		'AL' => 'Alabama',
		'AR' => 'Arkansas',
		'AZ' => 'Arizona',
		'CA' => 'California',
		'CO' => 'Colorado',
		'CT' => 'Connecticut',
		'DC' => 'District of Columbia',
		'DE' => 'Delaware',
		'FL' => 'Florida',
		'GA' => 'Georgia',
		'HI' => 'Hawaii',
		'IA' => 'Iowa',
		'ID' => 'Idaho',
		'IL' => 'Illinois',
		'IN' => 'Indiana',
		'KS' => 'Kansas',
		'KY' => 'Kentucky',
		'LA' => 'Louisiana',
		'MA' => 'Massachusetts',
		'MD' => 'Maryland',
		'ME' => 'Maine',
		'MI' => 'Michigan',
		'MN' => 'Minnesota',
		'MO' => 'Missouri',
		'MS' => 'Mississippi',
		'MT' => 'Montana',
		'NC' => 'North Carolina',
		'ND' => 'North Dakota',
		'NE' => 'Nebraska',
		'NH' => 'New Hampshire',
		'NJ' => 'New Jersey',
		'NM' => 'New Mexico',
		'NV' => 'Nevada',
		'NY' => 'New York',
		'OH' => 'Ohio',
		'OK' => 'Oklahoma',
		'OR' => 'Oregon',
		'PA' => 'Pennsylvania',
		'PR' => 'Puerto Rico',
		'RI' => 'Rhode Island',
		'SC' => 'South Carolina',
		'SD' => 'South Dakota',
		'TN' => 'Tennessee',
		'TX' => 'Texas',
		'UT' => 'Utah',
		'VA' => 'Virginia',
		'VT' => 'Vermont',
		'WA' => 'Washington',
		'WI' => 'Wisconsin',
		'WV' => 'West Virginia',
		'WY' => 'Wyoming',
		'OU' => 'Outside US'
	);

	public static function loadJs($file)
	{
		JHtml::_('script', 'mod_rscontact/'.$file.'.js', array('relative' => true, 'version' => 'auto'));
	}

	public static function loadCss($file)
	{
		JHtml::_('stylesheet', 'mod_rscontact/'.$file.'.css', array('relative' => true, 'version' => 'auto'));
	}

	protected static function encodeHTML(&$item, $key)
	{
		$item = self::cleanInput($item);
	}

	protected static function flatten(&$item, $key)
	{
		if (is_array($item))
		{
			$item = implode(', ', $item);
		}
	}

	public static function cleanInput($input)
	{
		return htmlspecialchars(is_array($input) ? implode(', ', $input) : $input, ENT_QUOTES, "UTF-8");
	}

	protected static function replacePlaceholders($text, $placeholders, $escapeCallable = null)
	{
		// Performance check
		if (strpos($text, '{') === false)
		{
			return $text;
		}

		array_walk($placeholders, array('self', 'flatten'));

		// Escape placeholders with user supplied function
		if ($escapeCallable)
		{
			// Built-in "HTML" encoding function
			if (strtolower($escapeCallable) == 'html')
			{
				$escapeCallable = array('self', 'encodeHTML');
			}

			if (is_callable($escapeCallable))
			{
				array_walk($placeholders, $escapeCallable);
			}
		}

		return str_replace(array_keys($placeholders), array_values($placeholders), $text);
	}

	public static function captchaGenerate($event, $value = null, $id = '')
	{
		if (!strlen(trim($value)))
		{
			$value = null;
		}

		try
		{
			$captcha = JCaptcha::getInstance(JFactory::getConfig()->get('captcha'));
		}
		catch (Exception $e)
		{
			JFactory::getApplication()->enqueueMessage($e->getMessage(), 'error');
			return false;
		}

		if (!$captcha)
		{
			JFactory::getApplication()->enqueueMessage(JText::_('MOD_RSCONTACT_NO_CAPTCHA_CONFIGURED'), 'error');
			return false;
		}

		switch ($event)
		{
			case 'onDisplay':
				return $captcha->display('mod-rscontact-captcha-' . $id, 'mod-rscontact-captcha-' . $id, 'required');
				break;

			case 'onCheckAnswer':
				return $captcha->checkAnswer($value);
				break;

			default:
				return false;
				break;
		}
	}

	public static function split($input)
	{
		$options = trim($input);
		$options = str_replace(array("\r\n", "\r"), "\n", $options);
		$options = preg_split("/[\n,]+/", $options);
		return $options;
	}

	protected static function showResponse($status, $message, $warnings = array())
	{
		$response = (object) array(
			'status' 	=> $status,
			'message' 	=> $message,
			'warnings' 	=> $warnings
		);
		JFactory::getDocument()->setMimeEncoding('application/json');

		echo json_encode($response);

		JFactory::getApplication()->close();
	}

	public static function getAjax(){
		JFactory::getLanguage()->load('mod_rscontact');
		$warning 	= array();
		$jInput		= JFactory::getApplication()->input;
		//ajax submit
		$inputs 	= $jInput->get('data', array(), 'array');

		$user 		= JFactory::getUser();
		$config		= JFactory::getConfig();

		$user_id 	= $user->get('id');
		$username	= $user->get('username');
		$user_email = $user->get('email');

		$timeZone	= $config->get('offset');
		$myDate 	= JDate::getInstance('now', $timeZone);
		$date 		= $myDate->format('d-m-Y', true, true);
		$date_time	= $myDate->format('d-m-Y H:i:s', true, true);

		$module 	= JModuleHelper::getModule('rscontact', $inputs['mod_rscontact_module_name']);
		$params 	= new JRegistry();
		$params->loadString($module->params);

		$recipient		= $params->get('mail_to');
		$bcc 			= $params->get('mail_bcc');
		$cc 			= $params->get('mail_cc');
		$message_set	= $params->get('mail_msg');
		$fullname_email	= $params->get('name_type') == 1;
		$thank_you		= $params->get('thank_you', JText::_('MOD_RSCONTACT_THANK_YOU_DEFAULT'));
		$send_copy		= $params->get('send_copy') == 1;
		$show_captcha	= $params->get('captcha');
		$show_consent   = $params->get('display_consent');
		$subject_predef	= $params->get('email_subj');
		$set_reply		= $params->get('reply_to');
		$reply_email	= $params->get('reply_email');
		$ip_remote		= $jInput->server->getString('REMOTE_ADDR');

		$salut_form 	= !empty($inputs['mod_rscontact_salutation'])   	? $inputs['mod_rscontact_salutation']	: '';
		$first_name		= !empty($inputs['mod_rscontact_first_name'])   	? $inputs['mod_rscontact_first_name']	: '';
		$last_name		= !empty($inputs['mod_rscontact_last_name'])    	? $inputs['mod_rscontact_last_name']	: '';
		$fullname		= !empty($inputs['mod_rscontact_full_name'])    	? $inputs['mod_rscontact_full_name']	: '';
		$email			= !empty($inputs['mod_rscontact_email'])	    	? $inputs['mod_rscontact_email'] 		: '';
		$address_1		= !empty($inputs['mod_rscontact_address_1'])    	? $inputs['mod_rscontact_address_1']	: '';
		$address_2		= !empty($inputs['mod_rscontact_address_2'])    	? $inputs['mod_rscontact_address_2']	: '';
		$city			= !empty($inputs['mod_rscontact_city'])		    	? $inputs['mod_rscontact_city']			: '';
		$state			= !empty($inputs['mod_rscontact_states'])	    	? $inputs['mod_rscontact_states']		: '';
		$zip			= !empty($inputs['mod_rscontact_zip'])			    ? $inputs['mod_rscontact_zip']			: '';
		$h_phone 		= !empty($inputs['mod_rscontact_home_phone'])	    ? $inputs['mod_rscontact_home_phone']	: '';
		$m_phone		= !empty($inputs['mod_rscontact_mobile_phone'])     ? $inputs['mod_rscontact_mobile_phone']	: '';
		$w_phone		= !empty($inputs['mod_rscontact_work_phone'])	    ? $inputs['mod_rscontact_work_phone']	: '';
		$company		= !empty($inputs['mod_rscontact_company'])	    	? $inputs['mod_rscontact_company']		: '';
		$website		= !empty($inputs['mod_rscontact_website'])	    	? $inputs['mod_rscontact_website']		: '';
		$subject		= !empty($inputs['mod_rscontact_subject'])	    	? $inputs['mod_rscontact_subject']		: '';
		$message		= !empty($inputs['mod_rscontact_message'])	    	? $inputs['mod_rscontact_message']		: '';
		$cf1			= !empty($inputs['mod_rscontact_cf1'])			    ? $inputs['mod_rscontact_cf1']			: '';
		$cf2			= !empty($inputs['mod_rscontact_cf2'])			    ? $inputs['mod_rscontact_cf2']			: '';
		$cf3			= !empty($inputs['mod_rscontact_cf3'])			    ? $inputs['mod_rscontact_cf3']			: '';
		$selfcopy		= !empty($inputs['mod_rscontact_selfcopy'])		    ? $inputs['mod_rscontact_selfcopy']		: '';
		$consent		= !empty($inputs['mod_rscontact_display_consent'])	? $inputs['mod_rscontact_display_consent'] : '';

		try
		{
			if (!JSession::checkToken()) {
				throw new Exception(JText::_('MOD_RSCONTACT_INVALID_TOKEN'));
			}

			if(!JMailHelper::isEmailAddress($email)){
				throw new Exception(JText::_('MOD_RSCONTACT_EMAIL_ERROR'));
			}

			if(!$recipient){
				throw new Exception(JText::_('MOD_RSCONTACT_EMAIL_TO_ERROR'));
			}

			if($show_consent && !$consent) {
				throw new Exception(JText::_('MOD_RSCONTACT_DISPLAY_CONSENT_ERROR'));
			}

			if ($show_captcha && !self::captchaGenerate('onCheckAnswer', null, $module->id)) {
				throw new Exception(JText::_('MOD_RSCONTACT_CAPTCHA_ERROR'));
			}

			if($fullname_email){
				$sender = $fullname;
			}
			else {
				$sender = $first_name.' '.$last_name;
			}

			if (isset(self::$states[$state])) {
				$state = self::$states[$state];
			}

			$placeholders = array(
				'{salut-form}'			=> $salut_form,
				'{salutation}'			=> $salut_form,
				'{first-name}'			=> $first_name,
				'{last-name}'			=> $last_name,
				'{fullname}'			=> $fullname,
				'{subject}'				=> $subject,
				'{email}'				=> $email,
				'{address-1}'			=> $address_1,
				'{address-2}'			=> $address_2,
				'{city}'				=> $city,
				'{state}'				=> $state,
				'{zip}'					=> $zip,
				'{home-phone}'			=> $h_phone,
				'{mobile-phone}'		=> $m_phone,
				'{work-phone}'			=> $w_phone,
				'{company}'				=> $company,
				'{website}'				=> $website,
				'{message}'				=> $message,
				'{cf1}'					=> $cf1,
				'{cf2}'					=> $cf2,
				'{cf3}'					=> $cf3,
				'{consent}'             => JText::_('MOD_RSCONTACT_DISPLAY_CONSENT_PLACEHOLDER'),
				'{username}'			=> $username,
				'{user-id}'				=> $user_id,
				'{user-email}'			=> $user_email,
				'{date}'				=> $date,
				'{date-time}'			=> $date_time,
				'{ip}'					=> $ip_remote,
				'{your-website}'		=> $config->get('sitename'),
				'{your-website-url}' 	=> JUri::root()
			);

			// Replace placeholders for the email body
			$msg = self::replacePlaceholders($message_set, $placeholders, 'html');

			// Replace placeholders for the email subject
			$subject_predef	= self::replacePlaceholders($subject_predef, $placeholders);

			// Replace placeholders for the Thank You message
			$thank_you = self::replacePlaceholders($thank_you, $placeholders, 'html');

			// array email addresses
			$recipient	= array_filter(preg_split('/[;,]+/', $recipient), array('JMailHelper', 'isEmailAddress'));
			$bcc		= array_filter(preg_split('/[;,]+/', $bcc), array('JMailHelper', 'isEmailAddress'));
			$cc			= array_filter(preg_split('/[;,]+/', $cc), array('JMailHelper', 'isEmailAddress'));

			if (($set_reply) && (strlen($reply_email)>0)) {
				$replyTo = $reply_email;
			}
			else {
				$replyTo = $email;
			}

			// send admin email
			$sent_admin = JFactory::getMailer()->sendMail($config->get('mailfrom'), $sender, $recipient, $subject_predef, $msg, true, $cc, $bcc, null, $replyTo, null);

			// send selfcopy email
			if ($selfcopy || $send_copy) {
				$subject = JText::sprintf('MOD_RSCONTACT_SEND_COPY_SUBJECT', $config->get('sitename'));

				$sent_user = JFactory::getMailer()->sendMail($config->get('mailfrom'), $config->get('fromname'), $email, $subject, $msg, true);
				if ($sent_user !== true) {
					$errorMessage = JText::_('MOD_RSCONTACT_NO_FURTHER_INFORMATION_AVAILABLE');
					if (is_object($sent_user) && is_callable(array($sent_user, 'getMessage'))) {
						$errorMessage = $sent_user->getMessage();
					}
					$warning[] = JText::sprintf('MOD_RSCONTACT_EMAIL_FAILED_COPY', $errorMessage);
				}
			}

			if ($sent_admin !== true) {
				$db = JFactory::getDbo();
				$jdate = new JDate('now');
				$query = $db->getQuery(true);

				// Get all admin users for database
				$query->clear()
					->select($db->qn(array('id', 'name', 'email', 'sendEmail')))
					->from($db->qn('#__users'))
					->where($db->qn('sendEmail') . ' = ' . 1);

				$db->setQuery($query);
				if ($rows = $db->loadObjectList()) {
					foreach ($rows as $row) {
						$user_send_from = $user_id ? $user_id : $row->id;
						$not_sent 		= JText::sprintf('MOD_RSCONTACT_ADMIN_EMAIL_NOT_SENT', '<strong>'.$params->get('mail_to').'</strong><br />');
						$values = array($db->q($user_send_from), $db->q($row->id), $db->q($jdate->toSql()), $db->q($subject_predef), $db->q($not_sent.$msg));
						$query->clear()
							->insert($db->qn('#__messages'))
							->columns($db->qn(array('user_id_from', 'user_id_to', 'date_time', 'subject', 'message')))
							->values(implode(',', $values));
						$db->setQuery($query);
						$db->execute();
					}
				}

				$errorMessage = JText::_('MOD_RSCONTACT_NO_FURTHER_INFORMATION_AVAILABLE');
				if (is_object($sent_admin) && is_callable(array($sent_admin, 'getMessage'))) {
					$errorMessage = $sent_admin->getMessage();
				}

				$warning[] = JText::sprintf('MOD_RSCONTACT_EMAIL_FAILED', $errorMessage);
			}

			self::showResponse(1, $thank_you, $warning);
		} catch (Exception $e) {
			self::showResponse(0, $e->getMessage());
		}
	}
}