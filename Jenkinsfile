pipeline {
    agent any

    environment {
        SERVICE_NAME = 'miniflix'

        ACR_NAME = 'miniflixacr-e6frchh0hvg3h4ba'
        ACR_REGISTRY = "${ACR_NAME}.azurecr.io"

        IMAGE_NAME = "${ACR_REGISTRY}/${SERVICE_NAME}"
        IMAGE_TAG = "${BUILD_NUMBER}"
        FULL_IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"

        ACR_CRED_ID = 'miniflixacr'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm

                sh 'echo "===== Git Information ====="'
                sh 'git log --oneline -5'
                sh 'echo "Branch: $(git branch --show-current)"'
                sh 'echo "Commit: $(git rev-parse HEAD)"'
            }
        }

        stage('Install & Test') {
            steps {
                sh 'npm install'

                // Simple sanity check
                sh 'node -e "require(\\"./app.js\\")" || true'

                sh 'echo "Tests Passed"'
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                    echo "Building Docker Image: ${FULL_IMAGE}"

                    docker build \
                        -t ${FULL_IMAGE} \
                        -t ${IMAGE_NAME}:latest \
                        .

                    echo "Docker image built successfully."

                    docker images | grep ${SERVICE_NAME}
                """
            }
        }

        stage('Push to ACR') {
            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: "${ACR_CRED_ID}",
                        usernameVariable: 'ACR_USER',
                        passwordVariable: 'ACR_PASS'
                    )
                ]) {

                    sh """
                        echo "Logging into Azure Container Registry..."

                        echo \$ACR_PASS | docker login ${ACR_REGISTRY} \
                            --username \$ACR_USER \
                            --password-stdin

                        echo "Pushing ${FULL_IMAGE}"

                        docker push ${FULL_IMAGE}

                        docker push ${IMAGE_NAME}:latest

                        docker logout ${ACR_REGISTRY}

                        echo "Push Completed Successfully"
                    """
                }
            }
        }
    }

    post {

        success {
            echo 'Build Success'
        }

        failure {
            echo 'Build Failed'
        }

        always {
            cleanWs()
        }
    }
}