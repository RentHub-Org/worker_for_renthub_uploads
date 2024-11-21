# Worker for Redis Queue-Based File Handling  

This worker processes tasks from multiple Redis queues to upload files to BTFS, manage their status, and notify users.  

## Workflow Overview  
1. **File Upload**: Interacts with a BTFS node using a custom provider.  
2. **Subtask Management**: Breaks uploads into smaller tasks (e.g., add, upload).  
3. **Status Polling**: Uses a priority-based queue to minimize delays.  
4. **Notifications**: Notifies users via Telegram or webhooks.  
5. **Database Updates**: Updates the file status in the database.  

## Environment Configuration  

`.env` example:  
```plaintext  
WORKER_ID = "3i7ac"  

# Global Redis connection  
GLOBAL_REDIS_HOST = "localhost"  
GLOBAL_REDIS_PORT = 6379  

# Local Redis connection  
LOCAL_REDIS_HOST = "localhost"  
LOCAL_REDIS_PORT = 6379  

# Queues  
TASK_GLOBAL_QUEUE_NAME = "work_uploads"  
NOTIFICATION_GLOBAL_QUEUE_NAME = "notifications"  
REDIS_GLOBAL_FINALIZE = "finalizer"  
REDIS_LOCAL_CONN_SUCCESS = "success_uploading"  
REDIS_LOCAL_CONN_ERROR = "error_uploding"  

# BTFS configuration  
BTFS_HOST = "127.0.0.1"  
BTFS_PORT_API = 8080  
BTFS_API_ENDPOINT = 5001  
```  

## Setup and Run  

1. Start a Redis service and a BTFS node.  
   Ensure the host and port values match those in the `.env` file.  

2. Install dependencies:  
   ```bash  
   npm install  
   ```  

3. Run the worker:  
   ```bash  
   npm run work  
   ```  

This will process tasks in the specified Redis queues and handle file uploads, status updates, and notifications.
