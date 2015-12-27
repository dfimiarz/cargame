<?php
/*
	Class used to send messages to the client
*/

namespace u311\carexperiment\view;

use u311\carexperiment\view\MessageSender as MessageSender;


class JSONMessageSender extends MessageSender {


	public function sendMessage($response)
	{

		echo json_encode($response);
		exit();

	}


}