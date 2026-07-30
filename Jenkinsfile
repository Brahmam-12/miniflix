pipeline {
    agent any

    environment {
        acr_name = 'miniflixacr'
        service_name = 'miniflix'
        acr_login_server = 'miniflixacr.azurecr.io'

        image_name = "${acr_login_server}/${service_name}"
        image_tag = "${BUILD_NUMBER}"
        full_image = "${image_name}:${image_tag}"
    }

    stages {
        stage('Checkout and test'){
            steps {
                echo "checkout scm is automatically will checkout from teh source contro manager that triggered"
                checkout scm

                //if you want explicity checkout from branch //jenkins directly handles the cloning brach and switching
                // git branch: 'main', url: 'tyesyugd'
                echo "Checking git status"
                sh 'git status'
                
                echo "Checking baranches"
                sh 'git branch -a'
                
                echo "Checking the 5 latest commits"
                sh 'git log --oneline -5'

                echo "Checking Commit id"
                sh 'git rev-parse HEAD'
            }
        }
        
        stage('Instal and Test'){
            steps{
                echo "Installing packages"
                sh 'npm install'

                echo "Checking the Javascript code is correct syntax"
                sh 'node --check app.js'

                echo "We are skipping the code Testing"
            }
        }

        stage('Build Docker Image'){
            steps{
                sh """
                    set -e 
                    echo "Building Docker Image for ${full_image}"
                    docker build \
                        -t ${full_image} \
                        .
                    echo "List Images"
                    docker images
                """
            }
        }

        stage('Push to ACR'){
            steps{
                echo"Logging into ACR Using Docker cred"
                withCredentials([
                    usernamePassword(
                        credentialsId: "${acr_name}",
                        usernameVariable: 'ACR_USER',
                        passwordVariable: "ACR_PASS"
                    )
                ]){
                    echo "Logging in started"
                    sh """
                        set -e
                        echo \${ACR_PASS} | docker login ${acr_login_server} \
                            -u ${ACR_USER}  --password-stdin
                        
                        echo "Pushing ${full_image}"
                        docker push ${full_image}
                        docker logout ${acr_login_server}

                        echo "Push completed successfully"
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
            echo 'Build failure'
        }
        always {
            echo 'Cleaning workspace folder paths...'
            cleanWs()
        }
    }
}
