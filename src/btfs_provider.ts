import dotenv from "dotenv";
dotenv.config();
import axios from "axios"
import fs from 'fs';
import formData from "form-data";

class BtfsProvider{
	static instance: BtfsProvider;
	private btfs_gateway_endpoint = "http://"+process.env.BTFS_HOST+":"+process.env.BTFS_PORT_API+"/";
	private btfs_api_endpoint = "http://"+process.env.BTFS_HOST+":"+process.env.BTFS_API_ENDPOINT+"/";
	static getInstance(): BtfsProvider {
		if (!BtfsProvider.instance) {
			BtfsProvider.instance = new BtfsProvider();
		}
		return BtfsProvider.instance;
	}
	async ping() {
		try {
			const response = await axios.get(this.btfs_gateway_endpoint+ "btfs/QmSnAFu4to9G6VpKSzsc7cQ7cg9TMQYVLbsgsowaPWgxkB");
			// const response = await axios.get(this.btfs_api_endpoint+"btfs/QmNytdpG1FstSmR7eo547A8o9EdF7cFe1tcExunu8uEgDc");
			if (response.status != 200) throw new Error("Error pinging BTFS");
		} catch (err) {throw new Error("Error pinging BTFS:"+err);}
	}
	async addFile(filPath){
		try{
			const fileStream = fs.createReadStream(filPath)
			const form = new formData();
			form.append("file",fileStream);
			const response = await axios.post(this.btfs_api_endpoint+"api/v0/add?to-blockchain=true&token="+process.env.BTFS_TOKEN,form,{
				headers: form.getHeaders()
			});
			return response.data;
		}catch(err){
			console.log("BTFS_PROVIDER_addFileError:"+err);
			throw new Error("Error adding file to BTFS.");
		}
	}
	async removeFile(fileHash){
		try{
			const response = await axios.post(this.btfs_api_endpoint+"api/v1/files/rm?arg="+fileHash+"&token="+process.env.BTFS_TOKEN);
			return response.data;
		}catch(err){
			console.log("BTFS_PROVIDER_removeFileError:"+err);
			throw new Error("Error removing file from BTFS.");
		}
	}
	async uploadFile(fileHash, rentforDays?){
		rentforDays = rentforDays || 31;
		try{
			const response = await axios.post(this.btfs_api_endpoint+`api/v1/storage/upload?arg=${fileHash}&storage-length=${rentforDays}`+"&token="+process.env.BTFS_TOKEN);
			return response.data;
		}catch(err){
			console.log("BTFS_PROVIDER_uploadFileError:"+err);
			throw new Error("Error uploading file to BTFS.");
		}
	}
	async getStatus(ID: any){
		if(!ID){
			throw new Error("ID is required to get status from BTFS.");
		}
		try{
			const response = await axios.post(this.btfs_api_endpoint+"api/v1/storage/upload/status?arg="+ID+"&token="+process.env.BTFS_TOKEN);
			return response.data;
		}catch(err){
			console.log("BTFS_PROVIDER_getStatusError:"+err);
			throw new Error("Error getting status from BTFS.");
		}
	}
}


export default BtfsProvider.getInstance();
