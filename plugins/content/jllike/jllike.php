<?php
/**
 * jllike
 *
 * @version 4.0.0
 * @author Vadim Kunicin (vadim@joomline.ru), Arkadiy (a.sedelnikov@gmail.com)
 * @copyright (C) 2010-2019 by Joomline (http://www.joomline.ru)
 * @license GNU/GPL license: http://www.gnu.org/copyleft/gpl.html
 **/

// no direct access
defined('_JEXEC') or die;

jimport('joomla.plugin.plugin');

require_once JPATH_ROOT.'/plugins/content/jllike/helper.php';
if (version_compare(JVERSION, '3.5.0', 'ge'))
{
    if(!class_exists('StringHelper1')){
        class StringHelper1 extends \Joomla\String\StringHelper{}
    }
}
else
{
    if(!class_exists('StringHelper1')){
        jimport('joomla.string.string');
        class StringHelper1 extends JString{}
    }
}

class plgContentjllike extends JPlugin
{
    private $protokol;

    public function __construct(& $subject, $config)
    {
        parent::__construct($subject, $config);
        $this->loadLanguage('plg_content_jllike', JPATH_ROOT.'/plugins/content/jllike');
        $this->protokol = (JFactory::getConfig()->get('force_ssl') == 2) ? 'https://' : 'http://';
    }

    public function onAfterRender()
    {
        $app = JFactory::getApplication();

        if (version_compare(JVERSION, '3.5.0', 'ge'))
        {
            $buffer = $app->getBody();
        }
        else
        {
            $buffer = JResponse::getBody();
        }

        if($buffer !== null)
        {
            $image = $app->getUserState('jllike.image', '');
            if(!empty($image))
            {
            $app->setUserState('jllike.image', '');
                $html = "  <link rel=\"image_src\" href=\"". $image ."\" />\n</head>";
                $buffer = StringHelper1::str_ireplace('</head>', $html, $buffer, 1);
            }
            $buffer = StringHelper1::str_ireplace('<meta name="og:', '<meta property="og:', $buffer);
            if (version_compare(JVERSION, '3.5.0', 'ge'))
            {
                $app->setBody($buffer);
            }
            else
            {
                JResponse::setBody($buffer);
            }
        }
    }


    public function onContentPrepare($context, &$article, &$params, $page = 0)
    {
        if(JFactory::getApplication()->isClient('administrator'))
        {
            return true;
        }

        $input = JFactory::getApplication()->input;

        $allowContext = array(
            'com_content.article',
            'easyblog.blog',
            'com_virtuemart.productdetails'
        );

        $allow_in_category = $this->params->get('allow_in_category', 0);

        if($allow_in_category)
        {
            $allowContext[] = 'com_content.category';
            $allowContext[] = 'com_content.featured';
        }

        if(!in_array($context, $allowContext)){
            return true;
        }

        if (strpos($article->text, '{jllike-off}') !== false) {
            $article->text = str_replace("{jllike-off}", "", $article->text);
            return true;
        }

        $autoAdd = $this->params->get('autoAdd',0);
        $sharePos = (int)$this->params->get('shares_position', 1);
        $enableOpenGraph = $this->params->get('enable_opengraph',1);
        $option = $input->get('option');
        $helper = PlgJLLikeHelper::getInstance($this->params);

        if (strpos($article->text, '{jllike}') === false && !$autoAdd)
        {
            return true;
        }

        if (!isset($article->catid))
        {
            $article->catid = '';
        }

        $print = (int) $input->get('print', 0);

		$root = JURI::getInstance()->toString(array('host'));
        $url = $this->protokol . $this->params->get('pathbase', '') . str_replace('www.', '', $root);

        if($this->params->get('punycode_convert',0))
        {
            $file = JPATH_ROOT.'/libraries/idna_convert/idna_convert.class.php';
            if(!JFile::exists($file))
            {
                return JText::_('PLG_JLLIKEPRO_PUNYCODDE_CONVERTOR_NOT_INSTALLED');
            }

            include_once $file;

            if($url)
            {
                if (class_exists('idna_convert'))
                {
                    $idn = new idna_convert;
                    $url = $idn->encode($url);
                }
            }
        }

        switch ($option) {
            case 'com_content':

                if(empty($article->id))
                {
                    //???????? ??????????????????, ???? ??????????????????
                    return true;
                }

                if($print)
                {
                    $article->text = str_replace("{jllike}", "", $article->text);
                    return true;
                }

                $cat = $this->params->get('categories', array());
                $exceptcat = is_array($cat) ? $cat : array($cat);

                if (in_array($article->catid, $exceptcat))
                {
                    $article->text = str_replace("{jllike}", "", $article->text);
                    return true;
                }


                if (version_compare(JVERSION, '3.12.0', '<')) {
                    include_once JPATH_ROOT.'/components/com_content/helpers/route.php';
                }
                $link = $url . JRoute::_(ContentHelperRoute::getArticleRoute($article->slug, $article->catid));

                $image = '';
                if($this->params->get('content_images', 'fields') == 'fields')
                {
					If(!empty($article->images))
					{
						$images = json_decode($article->images);

						if(!empty($images->image_intro))
						{
							$image = $images->image_intro;
						}
						else if(!empty($images->image_fulltext))
						{
							$image = $images->image_fulltext;
						}

						if(!empty($image))
						{
							$image = JURI::root().$image;
						}
					}

                }
                else
                {
                    $image = PlgJLLikeHelper::extractImageFromText($article->introtext, $article->fulltext);
                }

                $text = $helper->getShareText($article->metadesc, $article->introtext, $article->text);
                $enableOG = $context == 'com_content.article' ? $enableOpenGraph : 0;
                $shares = $helper->ShowIN($article->id, $link, $article->title, $image, $text, $enableOG);

                if ($context == 'com_content.article')
                {
                    $view = $input->get('view');
                    if ($view == 'article')
                    {
                        if ($autoAdd == 1 || strpos($article->text, '{jllike}') == true)
                        {
                            $helper->loadScriptAndStyle(0);

                            switch($sharePos)
                            {
                                case 0:
                                    $article->text = $shares . str_replace("{jllike}", "", $article->text);
                                    break;
                                default:
                                    $article->text = str_replace("{jllike}", "", $article->text) . $shares;
                                    break;
                            }
                        }
                    }
                }
                else if ($context == 'com_content.category' || 'com_content.featured')
                {
                    if ($autoAdd == 1 || strpos($article->text, '{jllike}') == true)
                    {
                        $helper->loadScriptAndStyle(1);
                        $article->text = str_replace("{jllike}", "", $article->text) . $shares;
                    }
                }
                break;
            case 'com_virtuemart':
                if ($context == 'com_virtuemart.productdetails') {
                    $VirtueShow = $this->params->get('virtcontent', 1);
                    if ($VirtueShow == 1)
                    {
                        $autoAddvm = $this->params->get('autoAddvm', 0);
                        if ($autoAddvm == 1 || strpos($article->text, '{jllike}') !== false)
                        {
                            $helper->loadScriptAndStyle(0);
                            $uri = StringHelper1::str_ireplace(JURI::root(), '', JURI::current());
                            $link = $url.'/'.$uri;
                            $image = $helper->getVMImage($article->virtuemart_product_id);
                            $text = $helper->getShareText($article->metadesc, $article->product_s_desc, $article->product_desc);
                            $shares = $helper->ShowIN($article->virtuemart_product_id, $link, $article->product_name, $image, $text, $enableOpenGraph);

                            switch($sharePos){
                                case 0:
                                    $article->text = $shares . str_replace("{jllike}", "", $article->text);
                                    break;
                                default:
                                    $article->text = str_replace("{jllike}", "", $article->text) . $shares;
                                    break;
                            }
                        }
                    }
                }
                break;
            case 'com_easyblog':
                if (($context == 'easyblog.blog') && ($this->params->get('easyblogshow', 0) == 1))
                {
					$allow_in_category = $this->params->get('allow_in_category', 0);
					$isCategory = ($input->get('view', '') == 'entry') ? false : true;

					if(!$allow_in_category && $isCategory)
					{
						return true;
					}

                    if ($autoAdd == 1 || strpos($article->text, '{jllike}') == true)
                    {
                        $helper->loadScriptAndStyle(0);
                        $uri = StringHelper1::str_ireplace(JURI::root(), '', JURI::current());
                        $link = $url.'/'.$uri;

                        $image = '';
                        if($this->params->get('easyblog_images','fields') == 'fields'){
                            $images = json_decode($article->image);
                            if(isset($images->type) && $images->type == 'image')
                            {
                                $image = $images->url;
                            }
                        }
                        else
                        {
                            $image = PlgJLLikeHelper::extractImageFromText($article->intro, $article->content);
                        }

                        $enableOG = $isCategory ? 0 : $this->params->get('easyblog_add_opengraph', 0);
                        $text = $helper->getShareText($article->metadesc, $article->intro, $article->content);
                        $shares = $helper->ShowIN($article->id, $link, $article->title, $image, $text, $enableOG);
                        switch($sharePos){
                            case 0:
                                $article->text = $shares . str_replace("{jllike}", "", $article->text);
                                break;
                            default:
                                $article->text = str_replace("{jllike}", "", $article->text) . $shares;
                                break;
                        }
                    }
                }
                break;
            default:
                break;
        }
    }
}
