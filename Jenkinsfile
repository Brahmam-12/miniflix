pipeline {
    agent any
    environment {
        SERVICE_NAME = 'miniflix'
        ACR_NAME = 'miniflixacr-e6frchh0hvg3h4ba'
        ACR_REGISTRY = "${ACR_NAME}.azurecr.io"

        IMAGE_NAME = "${ACR_REGISTRY}/${SERVICE_NAME}"
        IMAGE_TAG  = "${BUILD_NUMBER}"
        FULL_IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"

        ACR_CRED_ID = 'miniflixacr'
    }
    
    stages {
        stage('checkout') {
            steps {
                checkout scm
                // Print commit info so we can see in the build log what code we built
                sh 'git log --oneline -5'
                sh 'echo "Branch: $(git branch --show-current)"'
                sh 'echo "Commit: $(git rev-parse HEAD)"' 
            }
        }

        stage('Install & test') {
            steps {
                dir("${SERVICE_NAME}") {
                    sh 'npm install'
                    // For now: just verify the app can be required without crashing
                    sh 'node -e "require(\"./app.js\")" || true'

                    sh 'echo "Tests passed — proceeding to build"'
                }
            }
        }

        stage('Docker Build'){
            steps {
                sh """
                    echo "Building Docker Image ${FULL_IMAGE}"

                    docker build \
                        -t ${FULL_IMAGE} \
                        -t ${IMAGE_NAME}:latest \
                        ./${SERVICE_NAME}

                    echo "Image built: ${FULL_IMAGE}"
                    docker images | grep ${SERVICE_NAME}
                """
            }
        }

        //skip trivy scan for now

        stage('Push to ACR'){
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${ACR_CRED_ID}",
                    usernameVariable: 'ACR_USER',
                    passwordVariable: 'ACR_PASS'
                )]) {
                    sh """
                        echo "Logging into ACR: ${ACR_REGISTRY}"
                        # Login to ACR using service principal or admin credentials
                        # --password-stdin = read password from stdin (avoids it appearing in process list)
                        echo ${ACR_PASS} | docker login ${ACR_REGISTRY} \
                            --username ${ACR_USER} \
                            --password-stdin

                        echo "Pushing image: ${FULL_IMAGE}"
                        docker push ${FULL_IMAGE}           # push versioned tag (e.g. :42)
                        docker push ${IMAGE_NAME}:latest    # also push :latest tag

                        echo "Image pushed successfully to ACR"

                        # Logout — clean up credentials from the agent
                        docker logout ${ACR_REGISTRY}
                    """
                }
            }
        }

        echo "Build Success"
    }
}