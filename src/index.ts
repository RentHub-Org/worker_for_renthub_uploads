import BullQueues from "./redis";
import Btfs from "./btfs_provider"
import fs from "fs";
import { v6 } from "uuid";
import take_task_and_upload from "./scripts/take_task_and_upload_to_btfs";
import take_success_task_and_checck_status from "./scripts/take_success_task_and_checck_status";
// first do checks for the existence of a btfs node...
//
async function main(){
	await Btfs.ping().then(()=>{
		console.log("✅ Btfs node is present and accesible...");
	}).catch((err)=>{
		console.log("❌ Could't connct to a btfs node... exiting the process...");
		console.log(err);
		process.exit(1);
	});

// initiate the queues connection
	await BullQueues.init().then(()=>{
		console.log("✅ Queues connection was established.");
	}).catch((err)=>{
		console.log("❌ Error while connection to the redis queues: ", err);
		process.exit(1);
	});
	
	// now running the following commands is fine.....
	// which are to uploads....
	BullQueues.taskGlobalQueuePoll.add(
		{
			user:{
				address: "0x1234567890",
				telegram: "p_soni2022",
				webhook: "webhook here",
			},
			taskId: v6(),
			fileName: "tester.js",
			filePath: __dirname + "\\upload.json",
			nonce: 0 , // this defines the no of retries fro thiis file..
		});
	BullQueues.taskGlobalQueuePoll.process(take_task_and_upload);
  	BullQueues.redisLocalConnSuccess.process(take_success_task_and_checck_status);
	BullQueues.redisLocalConnError.process((job)=>{console.log("ERRORED _internal",job.data)});

	// these two queues to be handle sin the original core-be of renthub.
	BullQueues.notificationGlobalQueuePoll.process((job)=>{console.log(`NOTIFIER: message for ${job.data.telegramId} : ${job.data.message}`)});
	BullQueues.redisGlobalFinalizer.process((job)=>{console.log("FINALIZER: ",job.data)});

}

main();
