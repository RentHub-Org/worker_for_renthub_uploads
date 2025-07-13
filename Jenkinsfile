pipeline{
    agent any
    tools {
            nodejs 'nodejs-24-3-0'
    }
    environment {
            MONGO_URI = "mongodb://172.28.254.224:27017/?authSource=admin"
            MONGO_USERNAME = credentials('mongodb-username')
            MONGO_PASSWORD = credentials('mongodb-password')
            CORE_INSTANCE_IP = credentials('core-instance-ip-gcp')
    }
    stages{
        stage("Creating the image"){
            steps {
                sh "docker build -t priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT}"
                echo "Created the Docker-image named priyanshoe/worker-image-jenkins:COMMIT"
            }
        }
        stage("Pushing the image"){
            steps {
                withDockerRegistry(credentialsId: 'docker-credentials-priyanshu', toolName: 'Docker') {
                    sh "docker push priyanshoe/renthub-worker-jenkins:${GIT_COMMIT}"
                    echo "Pushing the image!"
                    sh "docker rmi priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT}"
                    echo "Done step!"
                }
            }
        }
        stage("Deleting the local-image"){
            steps {
                sh "docker rmi priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT}"
                echo "Deleted the iamge locally!"
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
                    sudo docker run -d --name renthub_worker_one -p priyanshoe/renthub-worker-image-jenkins:${GIT_COMMIT}

                    echo "Deployment complete."
                    EOF
                    '''
                }
                echo "Updated the deployment of the worker in the core-Instance."
            }

        }
    }
}
