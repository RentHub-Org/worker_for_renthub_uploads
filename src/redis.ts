import dotenv from "dotenv";
dotenv.config();
import Redis from 'ioredis';
import Queue from 'bull';

const Global_config = {
 	host: process.env.GLOBAL_REDIS_HOST,
  	port: parseInt(process.env.GLOBAL_REDIS_PORT),                  
  	// password: 'your-redis-password',
};
const Local_config = {
 	host: process.env.LOCAL_REDIS_HOST,
  	port: parseInt(process.env.LOCAL_REDIS_PORT),                  
  	// password: 'your-redis-password',
};
const taskGlobalQueueName = process.env.TASK_GLOBAL_QUEUE_NAME;
const notificationGlobalQueueName = process.env.NOTIFICATION_GLOBAL_QUEUE_NAME;
const redisLocalConnErrorName = process.env.REDIS_LOCAL_CONN_ERROR;
const redisLocalConnSuccessName = process.env.REDIS_LOCAL_CONN_SUCCESS;
const redisGlobalFinalizeName = process.env.REDIS_GLOBAL_FINALIZE;

class BullQueueInstances {
	public taskGlobalQueuePoll: any= "helo";
	public notificationGlobalQueuePoll: any = "helo";
	public redisLocalConnError: any;
	public redisLocalConnSuccess: any;
	public redisGlobalFinalizer: any;
	public queues: any;
	static instance: BullQueueInstances;	
	static getInstance(){
		if(!this.instance){
			this.instance = new BullQueueInstances();
		}
		return this.instance;
	
	} 

	public async init(){
		this.taskGlobalQueuePoll = new Queue(taskGlobalQueueName, {redis: Global_config});
		this.notificationGlobalQueuePoll = new Queue(notificationGlobalQueueName, {redis: Global_config});
		this.redisLocalConnError = new Queue(redisLocalConnErrorName, {redis: Local_config});
		this.redisLocalConnSuccess = new Queue(redisLocalConnSuccessName, {redis: Local_config});
		this.redisGlobalFinalizer = new Queue(redisGlobalFinalizeName, {redis: Global_config});
		this.queues = [
            		this.taskGlobalQueuePoll,
            		this.notificationGlobalQueuePoll,
            		this.redisLocalConnError,
            		this.redisLocalConnSuccess,
            		this.redisGlobalFinalizer,
        	];
		this.queues.forEach(queue => queue.on('error', (err) => {
            			new Error(`Queue "${queue.name}" connection failed: ${err.message}`);
        		})
		);

		await Promise.all(this.queues.map(queue=>queue.client.ping()));
	};
}

export default BullQueueInstances.getInstance();
