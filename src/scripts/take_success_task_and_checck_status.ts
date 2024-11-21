import BtfsInstance from "../btfs_provider";
import BullQueues from "../redis"
export default async function (job) {
	const fileContext = job.data;
	try{
		const status = await BtfsInstance.getStatus(fileContext.btfsUploadId);
		const priority = Date.now() - fileContext.enqueuedAt;
		switch(status.Status){
			case 'init':
			case 'submit':
				BullQueues.redisLocalConnSuccess.add(fileContext, { priority });
				break;
			case 'error':
				fileContext.rentalStatus = {
					...status
				};
				BullQueues.redisGlobalFinalizer.add(fileContext);
				console.log("DEBUG: upload errored : ", status.Message);
				BullQueues.notificationGlobalQueuePoll.add({
					message: `Upload failed for ${fileContext.fileName} with error: ${status.Message}`,
					telegramId: fileContext.user.telegram,
					webhookUrl: fileContext.user.webhook
				});
				BullQueues.redisGlobalFinalizer.add(fileContext);
				break;
			case 'complete':
				fileContext.rentalStatus = {
					...status
				};
				BullQueues.redisGlobalFinalizer.add(fileContext);
				console.log("DEBUG: upload completd at:", status.FileHash);
				BullQueues.notificationGlobalQueuePoll.add({
					message: `Uploaded Sccessfully for file ${fileContext.fileName} @${status.FileHash}`,
					telegramId: fileContext.user.telegram
					webhookUrl: fileContext.user.webhook
				});
				});
				BullQueues.redisGlobalFinalizer.add(fileContext);
				break;
			default:
				BullQueues.redisLocalConnSuccess.add(fileContext, { priority });
				break;
		}
    	// const currentTime = Date.now();
    	// const priority = currentTime - enqueuedAt; // Higher priority for older tasks
    	// BullQueues.redisLocalConnSuccess.add(fileContext, { priority });
	}catch(e){
		BullQueues.redisLocalConnError.add({
			fileContext,
			error: e
		});
	}finally{
		  await new Promise((resolve) => {setTimeout(resolve, 100);});
	}
	return;
}
