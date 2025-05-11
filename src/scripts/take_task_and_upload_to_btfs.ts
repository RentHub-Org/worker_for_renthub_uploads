import axios from 'axios';
import BtfsInstance from '../btfs_provider';
import BullQueues from "../redis";

export default async function (job){
	try{
	// storing the file and the userContext here..
		const fileContext: any = job.data;
		const tryCount = fileContext.nonce;
		if(tryCount == 3){
			// push the file to the error queue... of the local to handle the rem
			BullQueues.redisLocalConnError.add(fileContext);
			return;
		}
		fileContext.nonce = fileContext.nonce + 1; // indexing the tries on uploads.
		try{
			const response = await BtfsInstance.addFile(fileContext.filePath);
			const upload = await BtfsInstance.uploadFile(response.Hash, fileContext.rentForDays);
			fileContext.btfsHash = response.Hash;
			fileContext.btfsUploadId = upload.ID; // to check the status....
			if(!fileContext.tries){
				fileContext.tries = [];
			}
			const tryDetails = {
				status: "success",
				data: {
					hsah: response.Hash,
					localId: upload.ID,
				},
			}
			fileContext.tries.push(tryDetails);
			fileContext.enqueuedAt = Date.now();
			BullQueues.redisLocalConnSuccess.add(fileContext, {priority: fileContext.enqueuedAt});
			console.log("LAYER ONE: Added the file for upload: ", fileContext.fileName);
			// now we push the data of the file in the context
		}catch(e){
			console.log(e);
			if(!fileContext.tries){
				fileContext.tries = [];
			}
			const tryDetails = {
				status: "failed",
				error: e,
			}
			fileContext.tries.push(tryDetails);
			BullQueues.taskGlobalQueuePoll.add(fileContext);
			// meaning we coudent add the file..
			// a call to remove it from the 
			console.log("LAYER ONE: Error while adding the file for upload: ", fileContext.fileName, e);
		}	
	}catch(error){
		await job.moveToFailed({ message: error.message }, true);
	}
}
