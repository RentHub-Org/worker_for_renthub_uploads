pipeline{
    agent any
    tools {
        dockerTool 'Docker'  // This matches the name from Global Tool Configuration
    }
    environment {
            CORE_INSTANCE_IP = credentials('core-instance-ip-gcp')
            BTFS_IP_GCP = credentials('btfs-ip-gcp')
            SECRET_PHRASE_TO_ACCESS_TOKEN = credentials('secret-phrase-to-access-token')
    }
    stages{
        stage("Creating the image and pushing"){
            steps {
                withDockerRegistry(credentialsId: 'docker-credentials-priyanshu', url: 'https://index.docker.io/v1/') {
                    sh "docker build -t priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT} ."
                    echo "Created the Docker-image named priyanshoe/worker-image-jenkins:COMMIT"
                    sh "docker push priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT}"
                    echo "Pushing the image!"
                    sh "docker rmi priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT}"
                    echo "Done step!"
                }
            }
        }
        stage("Running in the Worker Instance in EC2"){
            steps {
                sshagent(credentials: ['ssh-core-instance-gcp']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no priyanshoe_official@$CORE_INSTANCE_IP << 'EOF'
                    echo "Stopping running container (if any)..."
                    sudo docker stop renthub_worker_one || true
                    sudo docker rm renthub_worker_one || true

                    echo "Removing old image..."
                    sudo docker images 'your-image' --format '{{.Repository}}:{{.Tag}}' | xargs -r sudo docker rmi || true

                    echo "Pulling new image..."
                    sudo docker pull priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT}

                    echo "Running new container..."
                    sudo docker run -d \
                        --name renthub_worker_one \
                        -v /mnt/common-storage:/uploads \
                        -e WORKER_ID="3i7ac" \
                        -e POLLING_DELAY=500 \
                        -e GLOBAL_REDIS_HOST="localhost" \
                        -e GLOBAL_REDIS_PORT=6379 \
                        -e LOCAL_REDIS_HOST="localhost" \
                        -e LOCAL_REDIS_PORT=6379 \
                        -e TASK_GLOBAL_QUEUE_NAME="work_uploads" \
                        -e NOTIFICATION_GLOBAL_QUEUE_NAME="notifications" \
                        -e REDIS_GLOBAL_FINALIZE="finalizer" \
                        -e REDIS_LOCAL_CONN_SUCCESS="success_uploading" \
                        -e REDIS_LOCAL_CONN_ERROR="error_uploding" \
                        -e BTFS_HOST=${BTFS_IP_GCP} \
                        -e BTFS_PORT_API=8080 \
                        -e BTFS_API_ENDPOINT=5001 \
                        -e BTFS_TOKEN_ACCESS_URL="http://$CORE_INSTANCE_IP:3121/latest-token?password=${SECRET_PHRASE_TO_ACCESS_TOKEN}" \
                        priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT}

                    echo "Deployment complete."
                    EOF
                    '''
                }
                echo "Updated the deployment of the worker in the core-Instance."
            }

        }
    }
}
