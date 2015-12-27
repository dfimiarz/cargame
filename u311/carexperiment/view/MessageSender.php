<?php
/*
	Class used to send messages to the client
*/
namespace u311\carexperiment\view;

interface iMessageSender
{
   	function sendMessage($response);
}

class MessageSender implements iMessageSender {

	public function __construct()
	{

	}

	public function onError($data = null, $msg, $err_type = 1)
	{
		$response = new \stdClass();

		$response->err = $err_type;
		$response->msg = $msg;
		$response->data = $data;

		$this->sendMessage($response);

	}

	public function onResult($data = null, $msg )
	{
		$response = new \stdClass();

		$response->err = 0;
		$response->msg = "OK";
		$response->data = $data;

		$this->sendMessage($response);

	}

	public function sendMessage($response)
	{
		print_r($response);
		exit();
	}


}