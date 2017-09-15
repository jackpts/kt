<?php
/**
 * Created by IntelliJ IDEA.
 * User: jacky
 * Date: 15/09/17
 * Time: 16:18
 */

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

//use Symfony\Component\BrowserKit\Response;
//use Symfony\Component\HttpFoundation\Response;

class MusicController extends Controller
{
    /**
     * @Route("/", name="homepage")
     */
    public function showAction()
    {
        //return new Response('Test it!!!');
        return $this->render('default/index.html.twig', [
            'base_dir' => realpath($this->getParameter('kernel.project_dir')).DIRECTORY_SEPARATOR,
        ]);
    }

}